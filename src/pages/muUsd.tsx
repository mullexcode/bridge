import React, { useEffect, useMemo, useState } from "react";
import Select from "../components/Select";
import Input from "../components/Input";
import BigNumber from "bignumber.js";
import { Erc20Abi } from "../assets/abi/erc20";
import { ethers, formatEther, Interface, isAddress, MaxUint256 } from "ethers";
import {
  useAccount,
  useBalance,
  useFeeData,
  useReadContract,
  useSendTransaction,
  useSwitchChain,
} from "wagmi";
import { estimateGas, waitForTransactionReceipt } from "@wagmi/core";
import { config } from "../main";
import { bridgeAbi } from "../assets/abi/bridge";
import clsx from "clsx";
import { toast } from "react-toastify";
// import { Tooltip } from "react-tooltip";
import TooltipIcon from "@/assets/images/tooltip.png";
import ArrowIcon from "@/assets/images/arrow.png";

import "react-tooltip/dist/react-tooltip.css";
import Loading from "../components/Loading";
import { Tooltip } from "react-tooltip";
import { CHAINS } from "../const/chain";
import { useAssetAddress } from "../hooks/useAssetAddress";

const chains = CHAINS.filter(el => el.symbol !== "metis")

const MuUSD: React.FC = () => {
  const [type, setType] = useState<"Deposit" | "Redeem">("Deposit");
  const [fromChain, setFromChain] = useState(0);
  const [toChain, setToChain] = useState(0);
  const account = useAccount();
  const [toAddress, setToAddress] = useState<string>(
    account.address?.toString() || ""
  );
  const { switchChain } = useSwitchChain();
  const [addressError, setAddressError] = useState("");
  const [gasFee, setGasFee] = useState("--");
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState("");
  const { sendTransactionAsync } = useSendTransaction();
  const { data: feeData } = useFeeData();
  const selectedAsset = useMemo(() => {
    return type === "Deposit" ? "usdc" : "muUSD";
  }, [type]);
  // 使用自定义hook获取assetAddress和currentContact
  const { assetAddress, currentContact } = useAssetAddress({
    fromChain,
    selectedAsset
  });
  useEffect(() => {
    if (account.address) {
      setToAddress(account.address.toString());
    }
  }, [account.address]);

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
      const depositData = iface.encodeFunctionData(
        type === "Deposit" ? "mappingMUSD" : "withdrawUSD",
        ["usdc", toChain, toAddress, ethers.parseUnits(amount, 6)]
      );
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
      setLoading(false);
      setAmount("");
      setFromChain(0);
      setToChain(0);
      toast.success("Transaction Successful");
    } catch {
      setLoading(false);
    }
  };

  const submitDisabled = useMemo(() => {
    return !(fromChain && new BigNumber(amount).gt(0) && selectedAsset);
  }, [amount, fromChain, selectedAsset]);

  useEffect(() => {
    if (!submitDisabled) {
      const iface = new Interface(bridgeAbi);
      const depositData = iface.encodeFunctionData(
        type === "Deposit" ? "mappingMUSD" : "withdrawUSD",
        ["usdc", toChain, toAddress, ethers.parseUnits(amount, 6)]
      );
      try {
        estimateGas(config, {
          account: account.address,
          to: currentContact as `0x${string}`,
          data: depositData as `0x${string}`,
          chainId: fromChain as any,
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

  const isFlag = useMemo(() => {
    return fromChain !== 0 && toChain === fromChain;
  }, [fromChain, toChain]);

  const overBalance = useMemo(() => {
    const _tokenBalance = ethers.formatUnits(tokenBalance?.toString() || 0, 6);
    return new BigNumber(amount).lte(_tokenBalance);
  }, [tokenBalance, amount]);

  const buttonText = useMemo(() => {
    if (!account.address) {
      return type;
    } else if (fromChain && account.chainId !== fromChain) {
      return "Switch network";
    } else if (!amount) {
      return "Enter amount";
    } else if (!overBalance) {
      return "Insufficient balance";
    } else if (addressError) {
      return "Invalid address";
    } else if (new BigNumber(allowance?.toString() || 0).lte(amount)) {
      return "Approve";
    }
    return type;
  }, [
    amount,
    account.address,
    account.chainId,
    allowance,
    fromChain,
    overBalance,
    addressError,
  ]);

  return (
    <div className="max-md:w-[90vw]">
      {/* Main Content */}
      <div className="flex justify-center bg-white rounded-[14px] mb-[20px] items-center py-[12px] gap-[12px] text-[16px] font-medium">
        <div
          onClick={() => setType("Deposit")}
          className={clsx(
            "w-[45%] md:w-[255px] h-[36px] flex items-center justify-center rounded-[10px] cursor-pointer",
            {
              "bg-gradient-to-br from-[#08C8B5] text-white to-[#9A20DD] bg-[length:100%_100%]":
                type === "Deposit",
            }
          )}
        >
          Deposit
        </div>
        <div
          onClick={() => setType("Redeem")}
          className={clsx(
            "w-[45%] md:w-[255px] h-[36px] flex items-center justify-center rounded-[10px] cursor-pointer",
            {
              "bg-gradient-to-br from-[#08C8B5] text-white to-[#9A20DD] bg-[length:100%_100%]":
                type === "Redeem",
            }
          )}
        >
          Redeem
        </div>
      </div>
      <main className="container rounded-[14px] bg-[#53517C] mx-auto">
        <div className="w-full rounded-[14px] bg-[#ffffff] p-[16px] !pb-[4px]">
          {/* Bridge Card */}
          <div className="overflow-hidden">
            {/* From Chain Selection */}
            <Select
              onChange={(value) => {
                setFromChain(Number(value));
              }}
              value={fromChain}
              options={chains}
              placeholder="Select a chain"
              label={
                type === "Deposit" ? "Deposit USDC from" : "Burn muUSD from"
              }
            ></Select>

            <div className="flex items-center mb-[10px] justify-between">
              <div className="text-[14px] md:text-[16px] font-medium text-left leading-[18px] md:leading-[21px] text-[#454464]">
                {type === "Deposit" ? "Deposit amount" : "Burn amount"}
              </div>
              <div className="text-[14px] md:text-[16px] font-medium text-left leading-[18px] md:leading-[21px] text-[#454464]">
                Balance: {formatTokenBalance}{" "}
                {type === "Deposit" ? "USDC" : "muUSD"}
              </div>
            </div>
            <Input
              label={""}
              placeholder={"Please input amount"}
              value={amount}
              onChange={(e) => {
                if (new BigNumber(e).lte(formatTokenBalance) || e === "") {
                  setAmount(e);
                } else {
                  setAmount(formatTokenBalance);
                }
              }}
            ></Input>
            <img
              alt=""
              src={ArrowIcon}
              className="w-[34px] h-[34px] mx-auto my-4"
            ></img>
            <Select
              onChange={(value) => setToChain(Number(value))}
              value={toChain}
              options={chains}
              placeholder="Select a chain"
              label={type === "Deposit" ? "Get muUSD to" : "Get USDC to"}
            ></Select>

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
        <div className="p-[16px] text-[14px]font-medium text-[#FFFFFF]">
          <div className="flex items-center h-[18px] mb-3  justify-between">
            <div
              data-tooltip-id="my-tooltip"
              className="flex items-center gap-[8px]"
            >
              Fees
              <img alt="" src={TooltipIcon} className="w-[12px] h-[12px]"></img>
            </div>
            <Tooltip id="my-tooltip" className="!bg-[#454464] !rounded-[14px]">
              <div className="bg-[#454464] text-[12px] font-normal text-left w-[285px] rounded-[14px]">
                <p>
                  The Base Fee:{" "}
                  {isFlag
                    ? `0 ${type === "Deposit" ? "USDC" : "muUSD"}`
                    : fromChain
                      ? `～${fromChain.toString() === import.meta.env.VITE_APP_ETH_CHAINID.toString()
                        ? "0.5"
                        : "0.1"
                      } ${type === "Deposit" ? "USDC" : "muUSD"}`
                      : "--"}
                </p>
                <p className="mb-4">
                  The Liquidity Fees:{" "}
                  {isFlag ? (
                    <span className="text-green-400">For Free!</span>
                  ) : (
                    <span>
                      {new BigNumber(0.03).times(amount || 0).decimalPlaces(2, 1).toString()}{" "}
                      {type === "Deposit" ? "USDC" : "muUSD"}
                    </span>
                  )}
                </p>
                <p className="mb-4">
                  Base Fee is used to cover the gas cost for sending your
                  transfer to the chain.{" "}
                </p>
                <p>Liquidity Fee is paid to Mullex as economic incentives.</p>
              </div>
            </Tooltip>
            <span>
              {isFlag
                ? `0 ${type === "Deposit" ? "USDC" : "muUSD"}`
                : assetAddress
                  ? `～${fromChain
                    ? new BigNumber(
                      fromChain.toString() === import.meta.env.VITE_APP_ETH_CHAINID.toString()
                        ? "0.5"
                        : "0.1"
                    )
                      .plus(new BigNumber(0.03).times(amount || 0))
                      .decimalPlaces(2, 1).toString()
                    : "0"
                  } ${type === "Deposit" ? "USDC" : "muUSD"}`
                  : "--"}
            </span>
          </div>
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
          <div className="flex items-center mb-3  h-[18px] justify-between">
            <span>Estimated time of arrival</span>
            <span>1-5Mins</span>
          </div>
          <div className="flex items-center mb-3  h-[18px] justify-between">
            <span>Receive</span>
            <span>
              {amount
                ? `${amount} ${type === "Deposit" ? "muUSD" : "USDC"}`
                : "--"}
            </span>
          </div>
        </div>
      </main>

      <div
        style={{
          background: "linear-gradient(90deg, #08C8B5 0%, #9A20DD 100%)",
        }}
        onClick={() => {
          if (!submitDisabled && !loading) {
            if (buttonText === "Switch network") {
              switchChain({
                chainId: fromChain,
              });
            } else {
              submit();
            }

          }

        }}
        className={clsx(
          "container !mt-[20px] gap-[8px] h-[48px] md:h-[70px] rounded-[14px] flex items-center justify-center text-[#FFFFFF] text-[20px] font-semibold cursor-pointer mx-auto",
          {
            "cursor-not-allowed opacity-40": submitDisabled || loading,
          }
        )}
      >
        {loading && <Loading></Loading>} {loading ? "Pending..." : buttonText}
      </div>
    </div>
  );
};

export default MuUSD;
