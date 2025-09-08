import React, { useEffect, useMemo, useState } from "react";
import Select from "../components/Select";
import Input from "../components/Input";
import ETHIcon from "@/assets/images/ETH.png";
import MetisIcon from "@/assets/images/metis.png";
import USDCIcon from "@/assets/images/USDC.png";
import BigNumber from "bignumber.js";
import { Erc20Abi } from "../assets/abi/erc20";
import { ethers, formatEther, Interface, isAddress, MaxUint256 } from "ethers";
import {
  useAccount,
  useBalance,
  useFeeData,
  useReadContract,
  useSendTransaction,
} from "wagmi";
import { estimateGas, waitForTransactionReceipt } from "@wagmi/core";
import { config } from "../main";
import { bridgeAbi } from "../assets/abi/bridge";
import clsx from "clsx";
import { toast } from "react-toastify";
import Loading from "../components/Loading";

const chains = [
  {
    icon: ETHIcon,
    label: "Ethereum",
    symbol: "eth",
    id: 11155111,
  },
  {
    icon: MetisIcon,
    label: "Metis",
    symbol: "metis",
    id: 59902,
  },
];

const assets = [
  {
    icon: "https://assets.coingecko.com/coins/images/53815/standard/musd_%281%29.png",
    label: "MUSD",
    symbol: "musd",
    id: "musd",
  },
  {
    icon: USDCIcon,
    label: "USDC",
    symbol: "USDC",
    id: "usdc",
  },
];

const tokens = {
  11155111: {
    musd: "0x68F2Aee1054D468e299F9bf6c68a9369f7BB079b",
    usdc: "0xE1262c4856656d67c9c9cf0c6Acf12df5EfAB4AA",
  },
  59902: {
    musd: "0xeE36126C3d4cB96133aab87Ae4526e38F415e75b",
    usdc: "0xfB0Ba1EB50831297DB0c49E4FCc743830546467D",
  } as const,
};

const contactAddress = {
  11155111: "0x9596051b9082ece3cc9a699077b99a3df5eaab54",
  59902: "0x377598BB2347BC6723f894D6551b0E36B4812BD6",
} as const;

type ChainId = keyof typeof tokens;
type AssetType = keyof (typeof tokens)[ChainId];
const Bridge: React.FC = () => {
  const [fromChain, setFromChain] = useState(1);
  const account = useAccount();
  const [loading, setLoading] = useState(false);

  const [gasFee, setGasFee] = useState("--")
  const [toChain, setToChain] = useState(0);
  const [selectedAsset, setSelectedAsset] = useState<string>("");
  const [toAddress, setToAddress] = useState<string>(account.address?.toString() || "");
  const [amount, setAmount] = useState("");
  const { sendTransactionAsync } = useSendTransaction();
  const { data: feeData } = useFeeData();
  const currentContact = useMemo(() => {
    return fromChain === 59902
      ? contactAddress[59902]
      : contactAddress[11155111];
  }, [fromChain]);

  const assetAddress = useMemo(() => {
    const targetChainId: ChainId = fromChain === 59902 ? 59902 : 11155111;
    const assetKey = selectedAsset.toLocaleLowerCase() as AssetType;
    return tokens[targetChainId]?.[assetKey] as `0x${string}` | undefined;
  }, [fromChain, selectedAsset]);

  const { data: tokenBalance } = useReadContract({
    address: assetAddress,
    abi: Erc20Abi,
    functionName: "balanceOf",
    args: [account.address],
    chainId: fromChain,
  });

  // 获取当前链的原生代币余额
  const { data: balanceData } = useBalance({
    address: account.address,
  });

  const { data: poolSize } = useReadContract({
    address: assetAddress,
    abi: Erc20Abi,
    functionName: "balanceOf",
    args: [currentContact],
    chainId: fromChain,
  });

  const { data: allowance } = useReadContract({
    address: assetAddress,
    abi: Erc20Abi,
    functionName: "allowance",
    args: [account.address, currentContact],
    chainId: fromChain,
  });
  const submit = async () => {
    if (new BigNumber(formatEther(balanceData?.value || "0")).lt((gasFee === '--' ? 0.1 : (new BigNumber(gasFee).times(1.5))))) {
      toast.error("Insufficient gas");
      return
    }
    setLoading(true)
    try {
      if (allowance && new BigNumber(allowance.toString()).gt(amount)) {
        submitFinal();
      } else {
        const iface = new Interface(Erc20Abi);
        const approveData = iface.encodeFunctionData("approve", [
          currentContact,
          MaxUint256,
        ]);
        if (assetAddress && approveData) {
          const tx = {
            to: assetAddress as `0x${string}`,
            data: approveData as `0x${string}`,
            value: BigInt(0),
          };
          const txHash = await sendTransactionAsync(tx);
          await waitForTransactionReceipt(config, {
            chainId: fromChain as 1 | 11155111 | 59902 | 1088,
            hash: txHash,
          });
          submitFinal();
        }
      }
    } catch {
      setLoading(false)
    }

  };

  const submitFinal = async () => {
    const iface = new Interface(bridgeAbi);

    const depositData = iface.encodeFunctionData("depositToken", [
      selectedAsset,
      ethers.parseUnits(amount, 6),
      toChain,
      toAddress,
    ]);
    const tx = {
      to: currentContact as `0x${string}`,
      data: depositData as `0x${string}`,
      value: BigInt(0),
    };
    const txHash = await sendTransactionAsync(tx);
    await waitForTransactionReceipt(config, {
      chainId: fromChain as 1 | 11155111 | 59902 | 1088,
      hash: txHash,
    });
    setAmount("");
    setSelectedAsset("")
    setToChain(0)
    setLoading(false)
    toast.success("Transaction Successful");
  };

  const submitDisabled = useMemo(() => {
    return !(
      fromChain &&
      toChain &&
      toAddress &&
      isAddress(toAddress) &&
      new BigNumber(amount).gt(0) &&
      selectedAsset
    );
  }, [amount, fromChain, selectedAsset, toAddress, toChain]);

  useEffect(() => {
    if (!submitDisabled && isAddress(toAddress)) {
      const iface = new Interface(bridgeAbi);
      const depositData = iface.encodeFunctionData("depositToken", [
        selectedAsset,
        ethers.parseUnits(amount, 6),
        toChain,
        toAddress,
      ]);
      try {
        estimateGas(config, {
          account: account.address,
          to: currentContact as `0x${string}`,
          data: depositData as `0x${string}`,
          chainId: fromChain as 1 | 11155111 | 59902 | 1088,
        }).then(gasEstimateRes => {
          setGasFee(ethers.formatEther(new BigNumber(gasEstimateRes).times(feeData?.maxFeePerGas || 0).toString()).toString());

        });
      } catch (error) {
        setGasFee("--")
      }
    } else {
      setGasFee("--")
    }
  }, [selectedAsset, submitDisabled, amount, toChain, toAddress])

  return (
    <div className="">
      {/* Main Content */}
      <main className="container rounded-[14px] bg-[#53517C] mx-auto">
        <div className="w-full rounded-[14px] bg-[#ffffff] px-[20px] py-[24px]">
          {/* Bridge Card */}
          <div className="overflow-hidden">
            {/* From Chain Selection */}
            <Select
              onChange={(value) => setFromChain(Number(value))}
              value={fromChain}
              options={chains.filter((el) => el.id !== toChain)}
              placeholder="Select a chain"
              label="From"
            ></Select>
            <Select
              onChange={(value) => setToChain(Number(value))}
              value={toChain}
              options={chains.filter((el) => el.id !== fromChain)}
              placeholder="Select a chain"
              label="To"
            ></Select>
            <Select
              onChange={(value) => setSelectedAsset(value.toString())}
              value={selectedAsset}
              options={assets}
              placeholder="Select a asset"
              label="Asset"
            ></Select>
            <Input
              label={"Amount"}
              placeholder={"Please input amount"}
              value={amount}
              onChange={(e) => {
                const _tokenBalance = ethers.formatUnits((tokenBalance?.toString() || 0), 6)
                const _poolSize = ethers.formatUnits((poolSize?.toString() || 0), 6)
                if (new BigNumber(e).lte(_tokenBalance) && (new BigNumber(e).lte(_poolSize) || selectedAsset === "musd")) {
                  setAmount(e)
                } else {
                  setAmount(BigNumber.minimum(_tokenBalance, _poolSize).toString())
                }
              }}
            ></Input>
            <Input
              label={"To Address"}
              placeholder={"Target chain address"}
              value={toAddress}
              onChange={(e) => setToAddress(e)}
            ></Input>
          </div>
        </div>
        <div className="p-[20px] text-[14px]font-medium text-[#FFFFFF]">
          <div className="flex items-center mb-4  justify-between">
            <span>Fees</span>
            <span>{gasFee || "--"}</span>
          </div>
          <div className="flex items-center mb-4  justify-between">
            <span>Max Available Amount</span>
            <span>{tokenBalance ? new BigNumber(ethers.formatUnits((tokenBalance.toString() || 0), 6) || 0).toString() : '--'}</span>
          </div>
          <div className="flex items-center mb-4  justify-between">
            <span>Pool size</span>
            <span>{selectedAsset === "musd" ? 'Infinity' : (poolSize ? ethers.formatUnits((poolSize.toString() || 0), 6).toString() : '--')}</span>
          </div>
          <div className="flex items-center mb-4  justify-between">
            <span>Remaining approved amount</span>
            <span>{allowance ? (new BigNumber(ethers.formatUnits(allowance?.toString() || 0, 6)).gt(10000000000) ? 'MAX' : ethers.formatEther(allowance?.toString() || 0)) : '--'}</span>
          </div>
          <div className="flex items-center  justify-between">
            <span>Estimated time of arrival</span>
            <span>1-5Mins</span>
          </div>
        </div>
      </main>

      <div
        style={{
          background: "linear-gradient(90deg, #08C8B5 0%, #9A20DD 100%)",
        }}
        onClick={async () => {
          // const iface = new Interface(bridgeAbi);
          // const depositData = iface.encodeFunctionData("mappingMUSD", [
          //   "usdc",
          //   11155111,
          //   "0x3edbe49932b45b28a1887558ada7c80c7a2624b6",
          //   ethers.parseUnits("100", 6),
          // ]);
          // const tx = {
          //   to: currentContact as `0x${string}`,
          //   data: depositData as `0x${string}`,
          //   value: BigInt(0),
          // };
          // const txHash = await sendTransactionAsync(tx);
          // await waitForTransactionReceipt(config, {
          //   chainId: 11155111,
          //   hash: txHash,
          // });
          if (!submitDisabled) {
            submit();
          }
        }}
        className={clsx(
          "container !mt-[30px] opacity-40 h-[70px] rounded-[14px] flex items-center justify-center text-[#FFFFFF] text-[20px] font-semibold cursor-pointer mx-auto",
          {
            "cursor-not-allowed": submitDisabled || loading,
          }
        )}
      >
        Transfer
      </div>
      {loading && <Loading></Loading>}
    </div>
  );
};

export default Bridge;
