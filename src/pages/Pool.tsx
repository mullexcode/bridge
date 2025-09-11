import React, { useEffect, useMemo, useState } from "react";
import Select from "../components/Select";
import Input from "../components/Input";
import ETHIcon from "@/assets/images/ETH.png";
import USDCIcon from "@/assets/images/USDC.png";
import BigNumber from "bignumber.js";
import { Erc20Abi } from "../assets/abi/erc20";
import { ethers, formatEther, Interface, MaxUint256 } from "ethers";
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
// import { Tooltip } from "react-tooltip";
import TooltipIcon from "@/assets/images/tooltip.png";

import "react-tooltip/dist/react-tooltip.css";
import Loading from "../components/Loading";

const chains = [
  {
    icon: ETHIcon,
    label: "Ethereum",
    symbol: "eth",
    id: 11155111,
  },
  // {
  //   icon: MetisIcon,
  //   label: "Metis",
  //   symbol: "metis",
  //   id: 59902,
  // },
];

const assets = [
  // {
  //   icon: "https://assets.coingecko.com/coins/images/53815/standard/musd_%281%29.png",
  //   label: "MUSD",
  //   symbol: "musd",
  //   id: "musd",
  // },
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
const Pool: React.FC = () => {
  const [type, setType] = useState<"Add" | "Remove">("Add");
  const [fromChain, setFromChain] = useState(1);
  const account = useAccount();
  const [gasFee, setGasFee] = useState("--");
  const [selectedAsset, setSelectedAsset] = useState<string>("");
  const [loading, setLoading] = useState(false);
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

  const { data: currentLiquity } = useReadContract({
    address: currentContact,
    abi: bridgeAbi,
    functionName: "queryLiquity",
    args: [selectedAsset, account.address],
    chainId: fromChain,
  });

  // 获取当前链的原生代币余额
  const { data: balanceData } = useBalance({
    address: account.address,
  });

  const { data: allowance } = useReadContract({
    address: assetAddress,
    abi: Erc20Abi,
    functionName: "allowance",
    args: [account.address, currentContact],
    chainId: fromChain,
  });
  const submit = async () => {
    if (
      new BigNumber(formatEther(balanceData?.value || "0")).lt(
        gasFee === "--" ? 0.1 : new BigNumber(gasFee).times(1.5)
      )
    ) {
      toast.error("Insufficient gas");
      return;
    }
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
            chainId: fromChain as 1 | 11155111 | 59902 | 1088,
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
    const iface = new Interface(bridgeAbi);

    const depositData = iface.encodeFunctionData(
      type === "Add" ? "addLiquity" : "delLiquity",
      [selectedAsset, ethers.parseUnits(amount, 6)]
    );
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
    setLoading(false);
    setAmount("");
    setSelectedAsset("");
    toast.success("Transaction Successful");
  };

  const submitDisabled = useMemo(() => {
    return !(fromChain && new BigNumber(amount).gt(0) && selectedAsset);
  }, [amount, fromChain, selectedAsset]);

  useEffect(() => {
    if (!submitDisabled) {
      const iface = new Interface(bridgeAbi);
      const depositData = iface.encodeFunctionData(
        type === "Add" ? "addLiquity" : "delLiquity",
        [selectedAsset, ethers.parseUnits(amount, 6)]
      );
      try {
        estimateGas(config, {
          account: account.address,
          to: currentContact as `0x${string}`,
          data: depositData as `0x${string}`,
          chainId: fromChain as 1 | 11155111 | 59902 | 1088,
        }).then((gasEstimateRes) => {
          setGasFee(
            ethers
              .formatEther(
                new BigNumber(gasEstimateRes)
                  .times(feeData?.maxFeePerGas || 0)
                  .toString()
              )
              .toString()
          );
        });
      } catch (error) {
        setGasFee("--");
      }
    } else {
      setGasFee("--");
    }
  }, [selectedAsset, submitDisabled, amount]);

  const formatTokenBalance = useMemo(() => {
    return ethers.formatUnits(tokenBalance?.toString() || 0, 6);
  }, [tokenBalance]);

  const liquidity = useMemo(() => {
    return ethers.formatUnits(currentLiquity?.toString() || 0, 6);
  }, [currentLiquity]);

  return (
    <div className="max-md:w-[90vw]">
      {/* Main Content */}
      <div className="flex justify-center bg-white rounded-[14px] mb-[20px] items-center py-[12px] gap-[12px] text-[16px] font-medium">
        <div
          onClick={() => setType("Add")}
          className={clsx(
            "w-[45%] md:w-[255px] h-[36px] flex items-center justify-center rounded-[10px] cursor-pointer",
            {
              "bg-gradient-to-br from-[#08C8B5] text-white to-[#9A20DD] bg-[length:100%_100%]":
                type === "Add",
            }
          )}
        >
          Add
        </div>
        <div
          onClick={() => setType("Remove")}
          className={clsx(
            "w-[45%] md:w-[255px] h-[36px] flex items-center justify-center rounded-[10px] cursor-pointer",
            {
              "bg-gradient-to-br from-[#08C8B5] text-white to-[#9A20DD] bg-[length:100%_100%]":
                type === "Remove",
            }
          )}
        >
          Remove
        </div>
      </div>
      <main className="container rounded-[14px] bg-[#53517C] mx-auto">
        <div className="w-full rounded-[14px] bg-[#ffffff] p-[16px] !pb-[4px]">
          {/* Bridge Card */}
          <div className="overflow-hidden">
            {/* From Chain Selection */}
            <Select
              onChange={(value) => setFromChain(Number(value))}
              value={fromChain}
              options={chains}
              placeholder="Select a chain"
              label=""
            ></Select>

            <Select
              onChange={(value) => setSelectedAsset(value.toString())}
              value={selectedAsset}
              options={assets}
              placeholder="Select a asset"
              label=""
            ></Select>
          </div>
        </div>
      </main>
      <main className="container !mt-[20px] rounded-[14px] bg-[#53517C] mx-auto">
        <div className="w-full rounded-[14px] bg-[#ffffff] px-[16px] md:px-[20px] py-[16px] md:py-[24px]">
          {/* Bridge Card */}
          {type === "Add" ? (
            <div className="overflow-hidden">
              {/* From Chain Selection */}
              <div className="flex items-center mb-[10px] justify-between">
                <div className="text-[14px] md:text-[16px] font-medium text-left leading-[18px] md:leading-[21px] text-[#454464]">
                  Amount
                </div>
                <div className="text-[14px] md:text-[16px] font-medium text-left leading-[18px] md:leading-[21px] text-[#454464]">
                  Balance: {formatTokenBalance}
                </div>
              </div>
              <Input
                label={""}
                placeholder={"0"}
                value={amount}
                onChange={(e) => {
                  if (new BigNumber(e).lte(formatTokenBalance)) {
                    setAmount(e);
                  } else {
                    setAmount(formatTokenBalance);
                  }
                }}
              ></Input>
              {selectedAsset && fromChain ? (
                <div className="w-full bg-[#BEE4B6]/20 border-[1px] flex items-center justify-between border-[#BEE4B6] rounded-[12px] py-[18px] px-[20px] text-base font-medium">
                  <span>Your Total Liquidity</span>
                  <span>
                    {liquidity} {selectedAsset.toLocaleUpperCase()}
                  </span>
                </div>
              ) : (
                <></>
              )}
            </div>
          ) : (
            <div className="overflow-hidden">
              {/* From Chain Selection */}
              <div className="flex items-center mb-[10px] justify-between">
                <div className="text-[14px] md:text-[16px]text-[16px] font-medium text-left leading-[18px] md:leading-[21px] text-[#454464]">
                  Remove
                </div>
                <div className="text-[14px] md:text-[16px]text-[16px] font-medium text-left leading-[18px] md:leading-[21px] text-[#454464]">
                  Your Total Liquidity: {liquidity}{" "}
                  {selectedAsset.toLocaleUpperCase()}
                </div>
              </div>
              <Input
                label={""}
                placeholder={"0"}
                value={amount}
                onChange={(e) => {
                  if (new BigNumber(e).lte(liquidity || 0)) {
                    setAmount(e);
                  } else {
                    setAmount(formatTokenBalance);
                  }
                }}
              ></Input>
            </div>
          )}
        </div>
        <div className="p-[16px] text-[14px]font-medium text-[#FFFFFF]">
          <div className="flex items-center h-[18px] justify-between">
            <div
              data-tooltip-id="my-tooltip"
              className="flex items-center gap-[8px]"
            >
              Gas fee
              <img alt="" src={TooltipIcon} className="w-[12px] h-[12px]"></img>
            </div>
            {/* {
              type !== "Add" && <Tooltip id="my-tooltip" className="!bg-[#454464] !rounded-[14px]">
                <div className="bg-[#454464] text-[12px] font-normal text-left rounded-[14px]">
                  <p>he Base Fee: ～{gasFee || "--"} {gasFee && gasFee !== '--' ? (fromChain === 11155111 ? 'ETH' : "METIS") : ""}</p>
                  <p className="mb-4">The Protocol Fee: 0.0003 USDC</p>
                  <p className="mb-4">
                    Gas Fee is used to cover the gas cost for sending your
                    transfer to the chain.{" "}
                  </p>
                  <p>
                    Protocol Fee is paid to Mullex as economic incentives.
                  </p>
                </div>
              </Tooltip>
            } */}
            <span>{gasFee || "--"} {gasFee && gasFee !== '--' ? (fromChain === 11155111 ? 'ETH' : "METIS") : ""}</span>
          </div>
        </div>
      </main>

      <div
        style={{
          background: "linear-gradient(90deg, #08C8B5 0%, #9A20DD 100%)",
        }}
        onClick={() => {
          if (!submitDisabled && !loading) {
            submit();
          }
        }}
        className={clsx(
          "container !mt-[20px] gap-[8px] h-[48px] md:h-[70px] rounded-[14px] flex items-center justify-center text-[#FFFFFF] text-[20px] font-semibold cursor-pointer mx-auto",
          {
            "cursor-not-allowed opacity-40": submitDisabled || loading,
          }
        )}
      >
        {
          (fromChain && (account.chainId !== fromChain)) ? "Wrong Network" : <>{type} liquidity</>
        }
      </div>
      {loading && <Loading></Loading>}
    </div>
  );
};

export default Pool;
