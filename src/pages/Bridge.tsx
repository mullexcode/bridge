import React, { useEffect, useMemo, useState } from "react";
import Select from "../components/Select";
import Input from "../components/Input";
import ETHIcon from "@/assets/images/ETH.png";
import MetisIcon from "@/assets/images/metis.png";
import BigNumber from "bignumber.js";
import { Erc20Abi } from "../assets/abi/erc20";
import { ethers, Interface, isAddress, MaxUint256 } from "ethers";
import { useAccount, useReadContract, useSendTransaction } from "wagmi";
import { waitForTransactionReceipt } from "@wagmi/core";
import { config } from "../main";
import { bridgeAbi } from "../assets/abi/bridge";
import clsx from "clsx";
import { toast } from "react-toastify";
import Loading from "../components/Loading";
import { Tooltip } from "react-tooltip";
import TooltipIcon from "@/assets/images/tooltip.png";

import "react-tooltip/dist/react-tooltip.css";

const chains = [
  {
    icon: ETHIcon,
    label: "Ethereum",
    symbol: "eth",
    id: Number(import.meta.env.VITE_APP_ETH_CHAINID) || 1,
  },
  {
    icon: MetisIcon,
    label: "Metis",
    symbol: "metis",
    id: Number(import.meta.env.VITE_APP_METIS_CHAINID) || 1088,
  },
];

const assets = [
  {
    icon: "https://assets.coingecko.com/coins/images/53815/standard/musd_%281%29.png",
    label: "muUSD",
    symbol: "muUSD",
    id: "muUSD",
  },
  // {
  //   icon: USDCIcon,
  //   label: "USDC",
  //   symbol: "USDC",
  //   id: "usdc",
  // },
];

const tokens = {
  [import.meta.env.VITE_APP_ETH_CHAINID]: {
    muUSD: import.meta.env.VITE_APP_ETH_MUSD,
    usdc: import.meta.env.VITE_APP_ETH_USDC,
  },
  [import.meta.env.VITE_APP_METIS_CHAINID]: {
    muUSD: import.meta.env.VITE_APP_METIS_MUSD,
    usdc: import.meta.env.VITE_APP_METIS_USDC,
  } as const,
};

const contactAddress = {
  [import.meta.env.VITE_APP_ETH_CHAINID]: import.meta.env.VITE_APP_ETH_CONTACT,
  [import.meta.env.VITE_APP_METIS_CHAINID]: import.meta.env
    .VITE_APP_METIS_CONTACT,
} as const;

type ChainId = keyof typeof tokens;
type AssetType = keyof (typeof tokens)[ChainId];
const Bridge: React.FC = () => {
  const [fromChain, setFromChain] = useState(0);
  const account = useAccount();
  const [loading, setLoading] = useState(false);
  const [amountError, setAmountError] = useState("");
  const [addressError, setAddressError] = useState("");
  // const [gasFee, setGasFee] = useState("--")
  const [toChain, setToChain] = useState(0);
  const [selectedAsset, setSelectedAsset] = useState<string>("");
  const [toAddress, setToAddress] = useState<string>(
    account.address?.toString() || ""
  );
  const [amount, setAmount] = useState("");
  const { sendTransactionAsync } = useSendTransaction();
  // const { data: feeData } = useFeeData();

  const currentContact = useMemo(() => {
    return fromChain === Number(import.meta.env.VITE_APP_METIS_CHAINID)
      ? contactAddress[Number(import.meta.env.VITE_APP_METIS_CHAINID)]
      : contactAddress[Number(import.meta.env.VITE_APP_ETH_CHAINID)];
  }, [fromChain]);
  useEffect(() => {
    if (account.address) {
      setToAddress(account.address.toString());
    }
    if (account.address && !localStorage.getItem("showRisk")) {
      localStorage.setItem("showRisk", "1");
      toast.error(
        <div className="text-left">
          <div className="text-[16px] font-semibold text-[#EC4A2F]">
            Risk Disclosure
          </div>
          <div className="text-[13px] leading-[20px] text-[#2C2C3F] mt-1">
            This product is in the Alpha stage. Please do not transfer or
            deposit more than you can afford to lose. During the Alpha phase,
            cross-chain transactions are limited to a single transfer of 1000
            USD worth of token.
          </div>
        </div>,
        {
          autoClose: false,
          closeOnClick: true,
        }
      );
    }
  }, [account.address]);

  const assetAddress = useMemo(() => {
    const targetChainId: ChainId =
      fromChain === Number(import.meta.env.VITE_APP_METIS_CHAINID)
        ? Number(import.meta.env.VITE_APP_METIS_CHAINID)
        : Number(import.meta.env.VITE_APP_ETH_CHAINID);
    const assetKey = selectedAsset as AssetType;
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
  // const { data: balanceData } = useBalance({
  //   address: account.address,
  // });

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
    setLoading(true);
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
            chainId: fromChain as any,
            hash: txHash,
          });
          submitFinal();
        }
      }
    } catch {
      setLoading(false);
    }
  };

  const submitFinal = async () => {
    try {
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
        chainId: fromChain as any,
        hash: txHash,
      });
      setAmount("");
      setSelectedAsset("");
      setToChain(0);
      setLoading(false);
      toast.success("Transaction Successful");
    } catch {
      setLoading(false);
    }
  };

  const { overBalance, overPoolSize } = useMemo(() => {
    const _tokenBalance = ethers.formatUnits(tokenBalance?.toString() || 0, 6);
    const _poolSize = ethers.formatUnits(poolSize?.toString() || 0, 6);
    return {
      overBalance: new BigNumber(amount).lte(_tokenBalance),
      overPoolSize:
        new BigNumber(amount).lte(_poolSize) || selectedAsset === "muUSD",
    };
  }, [tokenBalance, poolSize, amount]);

  const submitDisabled = useMemo(() => {
    return !(
      fromChain &&
      toChain &&
      toAddress &&
      account.address &&
      isAddress(toAddress) &&
      !amountError &&
      new BigNumber(amount).gt(0) &&
      overBalance &&
      overPoolSize &&
      selectedAsset
    );
  }, [
    amount,
    fromChain,
    selectedAsset,
    account.address,
    amountError,
    tokenBalance,
    poolSize,
    toAddress,
    toChain,
  ]);

  // useEffect(() => {
  //   if (!submitDisabled && isAddress(toAddress)) {
  //     const iface = new Interface(bridgeAbi);
  //     const depositData = iface.encodeFunctionData("depositToken", [
  //       selectedAsset,
  //       ethers.parseUnits(amount, 6),
  //       toChain,
  //       toAddress,
  //     ]);
  //     try {
  //       estimateGas(config, {
  //         account: account.address,
  //         to: currentContact as `0x${string}`,
  //         data: depositData as `0x${string}`,
  //         chainId: fromChain as 1 | Number(import.meta.env.VITE_APP_ETH_CHAINID) |  Number(import.meta.env.VITE_APP_METIS_CHAINID) | 1088,
  //       }).then(gasEstimateRes => {
  //         setGasFee(ethers.formatEther(new BigNumber(gasEstimateRes).times(feeData?.maxFeePerGas || 0).toString()).toString());

  //       });
  //     } catch (error) {
  //       setGasFee("--")
  //     }
  //   } else {
  //     setGasFee("--")
  //   }
  // }, [selectedAsset, submitDisabled, amount, toChain, toAddress])
  const buttonText = useMemo(() => {
    if (!account.address) {
      return "Transfer";
    } else if (fromChain && account.chainId !== fromChain) {
      return "Wrong Network";
    } else if (amountError || !amount) {
      return "Enter amount";
    } else if (!overBalance) {
      return "Insufficient balance";
    } else if (!overPoolSize) {
      return "Insufficient pool size";
    } else if (addressError) {
      return "Invalid address";
    }
    return "Transfer";
  }, [
    amountError,
    amount,
    account.address,
    account.chainId,
    fromChain,
    overBalance,
    overPoolSize,
    addressError,
  ]);
  return (
    <div className="max-md:w-[90vw]">
      {/* Main Content */}
      <main className="container rounded-[14px] bg-[#53517C] mx-auto">
        <div className="w-full rounded-[14px] bg-[#ffffff] p-[16px] !pb-[4px]">
          {/* Bridge Card */}
          <div className="overflow-hidden">
            {/* From Chain Selection */}
            <Select
              onChange={(value) => {
                setFromChain(Number(value));
                if (value.toString() === toChain.toString()) {
                  setToChain(0);
                }
              }}
              value={fromChain}
              options={chains}
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
            <div className="flex items-center mb-[10px] justify-between">
              <div className="text-[14px] md:text-[16px] font-medium text-left leading-[18px] md:leading-[21px] text-[#454464]">
                Amount
              </div>
              <div className="text-[14px] md:text-[16px] font-medium text-left leading-[18px] md:leading-[21px] text-[#454464]">
                Balance:{" "}
                {tokenBalance
                  ? new BigNumber(
                      ethers.formatUnits(tokenBalance.toString() || 0, 6) || 0
                    ).toString()
                  : "--"}
              </div>
            </div>
            <Input
              label={""}
              placeholder={"Please input amount"}
              value={amount}
              onBlur={(e) => {
                if (new BigNumber(e).lt(" 0.000001")) {
                  setAmountError("Minimum amount is 0.000001");
                  return;
                }
                if (new BigNumber(e).gt("1000")) {
                  setAmountError(
                    "Cross-chain amount exceeds the limit (max value 1000u)"
                  );
                  return;
                }
                setAmountError("");
              }}
              onChange={(e) => {
                setAmount(e);
                if (new BigNumber(e).lt(" 0.000001")) {
                  setAmountError("Minimum amount is 0.000001");
                } else if (new BigNumber(e).gt("1000")) {
                  setAmountError(
                    "Cross-chain amount exceeds the limit (max value 1000u)"
                  );
                } else {
                  setAmountError("");
                }
                // const _tokenBalance = ethers.formatUnits((tokenBalance?.toString() || 0), 6)
                // const _poolSize = ethers.formatUnits((poolSize?.toString() || 0), 6)
                // if (new BigNumber(e).lte(_tokenBalance) && (new BigNumber(e).lte(_poolSize) || selectedAsset === "musd")) {
                //   setAmount(e)
                // } else {
                //   setAmount(BigNumber.minimum(_tokenBalance, _poolSize).toString())
                // }
              }}
            ></Input>
            {amountError && (
              <div className="text-red-500 text-left text-base mt-2">
                {amountError}
              </div>
            )}
            <Input
              label={"To Address"}
              placeholder={"Target chain address"}
              value={toAddress}
              onBlur={(e) => {
                if (!isAddress(e)) {
                  setAddressError("Invalid address");
                } else {
                  setAddressError("");
                }
              }}
              onChange={(e) => {
                setToAddress(e);
                if (!isAddress(e)) {
                  setAddressError("Invalid address");
                } else {
                  setAddressError("");
                }
              }}
            ></Input>
            {addressError && (
              <div className="text-red-500 text-left text-base mt-2">
                {addressError}
              </div>
            )}
          </div>
        </div>
        <div className="p-[16px] text-[14px] font-medium text-[#FFFFFF]">
          <div className="flex items-center mb-3 h-[18px] justify-between">
            <div
              data-tooltip-id="my-tooltip"
              className="flex items-center gap-[8px]"
            >
              Fees
              <img alt="" src={TooltipIcon} className="w-[12px] h-[12px]"></img>
            </div>
            <Tooltip id="my-tooltip" className="!bg-[#454464] !rounded-[14px]">
              <div className="bg-[#454464] text-[12px] font-normal text-left w-[285px] rounded-[14px]">
                <p>The Base Fee: {selectedAsset ? "～0.5 muUSD" : "--"}</p>
                <p className="mb-4">
                  The Protocol Fee:{" "}
                  <span className="text-green-400">For Free!</span>
                </p>
                <p className="mb-4">
                  Base Fee is used to cover the gas cost for sending your
                  transfer to the chain.{" "}
                </p>
                <p>Protocol Fee is paid to Mullex as economic incentives.</p>
              </div>
            </Tooltip>
            <span>{selectedAsset ? "～0.5 muUSD" : "--"}</span>
          </div>
          {/* <div className="flex items-center h-[18px] mb-3 justify-between">
            <span>Balance</span>
            <span>{tokenBalance ? new BigNumber(ethers.formatUnits((tokenBalance.toString() || 0), 6) || 0).toString() : '--'}</span>
          </div> */}
          {/* <div className="flex items-center mb-3 h-[18px] justify-between">
            <span>Pool size</span>
            <span>{selectedAsset === "musd" ? 'Infinity' : (poolSize ? ethers.formatUnits((poolSize.toString() || 0), 6).toString() : '--')}</span>
          </div> */}
          <div className="flex items-center mb-3 h-[18px] justify-between">
            <span>Remaining approved amount</span>
            <span>
              {allowance
                ? new BigNumber(
                    ethers.formatUnits(allowance?.toString() || 0, 6)
                  ).gt(10000000000)
                  ? "MAX"
                  : ethers.formatEther(allowance?.toString() || 0)
                : "--"}
            </span>
          </div>
          <div className="flex items-center h-[18px] justify-between">
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
          //   Number(import.meta.env.VITE_APP_ETH_CHAINID),
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
          //   chainId: Number(import.meta.env.VITE_APP_ETH_CHAINID),
          //   hash: txHash,
          // });
          if (!submitDisabled) {
            submit();
          }
        }}
        className={clsx(
          "container !mt-[20px] h-[48px] md:h-[70px] rounded-[14px] flex items-center justify-center text-[#FFFFFF] text-[20px] font-semibold cursor-pointer mx-auto",
          {
            "cursor-not-allowed opacity-40": submitDisabled || loading,
          }
        )}
      >
        {loading ? "Pending..." : buttonText}
      </div>
      {loading && <Loading></Loading>}
    </div>
  );
};

export default Bridge;
