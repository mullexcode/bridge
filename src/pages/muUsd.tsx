import React, { useEffect, useMemo, useState } from "react";
import Select from "../components/Select";
import Input from "../components/Input";
import BigNumber from "bignumber.js";
import { Erc20Abi } from "../assets/abi/erc20";
import { ethers, Interface, isAddress, MaxUint256 } from "ethers";
import {
  useAccount,
  useReadContract,
  useSendTransaction,
  useSwitchChain,
} from "wagmi";
import { waitForTransactionReceipt } from "@wagmi/core";
import { config } from "../main";
import { bridgeAbi } from "../assets/abi/bridge";
import clsx from "clsx";
import { toast } from "react-toastify";
import TooltipIcon from "@/assets/images/tooltip.png";
import ArrowIcon from "@/assets/images/arrow.png";

import "react-tooltip/dist/react-tooltip.css";
import Loading from "../components/Loading";
import { Tooltip } from "react-tooltip";
import { preloadImage } from "../utils";

const MuUSD: React.FC = () => {
    const [chains, setChains] = useState<any>();
    const [tokens, setTokens] = useState<any>();
    const [usdcChains, setUsdcChains] = useState<string[]>([]);
    const [muUSDChains, setMuUSDChains] = useState<string[]>([]);

    const [type, setType] = useState<"Deposit" | "Redeem">("Deposit");
    const [fromChain, setFromChain] = useState(0);
    const [toChain, setToChain] = useState(0);
    const account = useAccount();
    const [toAddress, setToAddress] = useState<string>(
        account.address?.toString() || ""
    );

  const [amountError, setAmountError] = useState("");
  const { switchChain } = useSwitchChain();
  const [addressError, setAddressError] = useState("");
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState("");
  const { sendTransactionAsync } = useSendTransaction();

  const selectedAsset = useMemo(() => {
    return type === "Deposit" ? "USDC" : "muUSD";
  }, [type]);
  const targetAsset = useMemo(() => {
    return type === "Deposit" ? "muUSD" : "USDC";
  }, [type]);

  const fromChainList = useMemo(() => {
      if (!chains||!type){
         return [];
     }

      if (type === "Deposit") {
          return chains?.filter((item: any) => usdcChains.includes(item.label));
      }else{
          return chains?.filter((item: any) => muUSDChains.includes(item.label));
      }
  }, [chains,type,usdcChains,muUSDChains]);
  const toChainList = useMemo(() => {
      if (!chains||!type){
          return [];
      }

      if (type === "Deposit") {
         return chains?.filter((item: any) => muUSDChains.includes(item.label));
      }else{
         return chains?.filter((item: any) => usdcChains.includes(item.label));
      }
  }, [chains,type,usdcChains,muUSDChains]);

    const getToken = (tokens: any, selectedAsset: string) => {
        return useMemo(() => {
            if (!selectedAsset) {
                return "";
            }

            const info = tokens?.[selectedAsset];
            const contracts = info?.contracts

            return contracts;
        }, [tokens, selectedAsset]);
    };
    const selectedToken = getToken(tokens, selectedAsset)
    const targetToken = getToken(tokens, targetAsset)
    const fromTokenAddress = useMemo(() => {
        if (!selectedToken) {
            return "";
        }

        return selectedToken[fromChain]
    }, [selectedToken, fromChain]);
    const toTokenAddress = useMemo(() => {
        if (!targetToken) {
            return "";
        }

        return targetToken[toChain]
    }, [targetToken, toChain]);

    const getChainData = (chains: any[], chainId: number) => {
        return useMemo(() => {
            if (!chains){
                return null;
            }
            return chains.find((item) => item.id.toString() === chainId.toString());
        }, [chains, chainId]);
    };
    const fromChainData  = getChainData(chains, fromChain);
    const fromContact = useMemo(() => {
        return fromChainData?.contract;
    }, [fromChainData]);
    const toChainData  = getChainData(chains, toChain);
    const toContact = useMemo(() => {
        return toChainData?.contract;
    }, [toChainData]);

  useEffect(() => {
      if (account.address) {
          fetch(`${import.meta.env.VITE_APP_API_HOST}/getmuusdinfo`, {
              method: "GET",
          }).then(async (res) => {
              const response = await res.json();
              console.log("response", response)
              if (response) {
                  setChains(response.chains)
                  setTokens(response.tokens)
                  setUsdcChains(response.USDCChains)
                  setMuUSDChains(response.muusdChains)
                  response.chains?.forEach((item: any) => {
                      preloadImage(item.icon)
                  });

                  Object.keys(response.tokens).forEach((key: string) => {
                      preloadImage(response.tokens[key].icon)
                  });
              }
          });
      }

    if (account.address) {
      setToAddress(account.address.toString());
    }
  }, [account.address]);

  const { data: tokenBalance } = useReadContract({
    address: fromTokenAddress,
    abi: Erc20Abi,
    functionName: "balanceOf",
    args: [account.address],
    chainId: fromChain,
  });

  const { data: allowance } = useReadContract({
    address: fromTokenAddress,
    abi: Erc20Abi,
    functionName: "allowance",
    args: [account.address, fromContact],
    chainId: fromChain,
  });

  const { data: poolSize } = useReadContract({
    address: toTokenAddress,
    abi: Erc20Abi,
    functionName: "balanceOf",
    args: [toContact],
    chainId: toChain,
  });

  const submit = async () => {
    setLoading(true);
    try {
      if (allowance && new BigNumber(allowance.toString()).gt(amount)) {
        submitFinal();
      } else {
        const iface = new Interface(Erc20Abi);
        const approveData = iface.encodeFunctionData("approve", [
            fromContact,
          MaxUint256,
        ]);
        if (fromTokenAddress && approveData) {
          const tx = {
            to: fromTokenAddress as `0x${string}`,
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
        to: fromContact as `0x${string}`,
        data: depositData as `0x${string}`,
        value: BigInt(0),
      };
      const txHash = await sendTransactionAsync(tx);
      await waitForTransactionReceipt(config, {
        chainId: fromChain as any,
        hash: txHash,
      });
      fetch(`${import.meta.env.VITE_APP_API_HOST}/commit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          "chainId": fromChain.toString(),
          "tochainId": toChain.toString(),
          "token": selectedAsset,
          "address": account.address,
          "hash": txHash,
          "page": "muusd",
          "toToken": targetAsset,
          "kind": type === "Deposit" ? "0" : "1",
          "amount": ethers.parseUnits(amount, 6).toString(),
        }),
      })
      setLoading(false);
      setAmount("");
      setFromChain(0);
      setToChain(0);
      toast.success("Transaction Successful");
    } catch {
      setLoading(false);
    }
  };

  const formatTokenBalance = useMemo(() => {
    return ethers.formatUnits(tokenBalance?.toString() || 0, 6);
  }, [tokenBalance]);

  const isFlag = useMemo(() => {
    return fromChain !== 0 && toChain === fromChain;
  }, [fromChain, toChain]);

  const { overPoolSize } = useMemo(() => {
    const _poolSize = ethers.formatUnits(poolSize?.toString() || 0, 6);
    return {
      overPoolSize: new BigNumber(amount).lte(_poolSize) || type === "Deposit",
    };
  }, [amount, type, poolSize]);

  const selectedAssetFormat = useMemo(() => {
    return selectedAsset === "muUSD"
      ? selectedAsset
      : selectedAsset.toLocaleUpperCase();
  }, [selectedAsset]);

  const buttonText = useMemo(() => {
    if (!account.address) {
      return type;
    } else if (fromChain && account.chainId !== fromChain) {
      return "Switch network";
    } else if (new BigNumber(allowance?.toString() || 0).lte(amount)) {
      return "Approve";
    } else if (loading) {
      return "Pending...";
    }
    return type;
  }, [
    type,
    amount,
    allowance,
    account.address,
    account.chainId,
    fromChain,
    loading,
  ]);


  const baseFee = useMemo(() => {
    return fromChain === toChain ? '0' :fromChain.toString() ===
      import.meta.env.VITE_APP_ETH_CHAINID.toString()
      ? "0.5"
      : "0.1";
  }, [fromChain, toChain]);

  const liquidityFees = useMemo(() => {
    return type === "Deposit" ? BigNumber(fromChain === toChain ? 0 : 0.0003).times(amount || 0).toString() : "0";
  }, [amount, toChain, fromChain, type]);

  const submitDisabled = useMemo(() => {
    return !(
      !loading &&
      isAddress(toAddress) &&
      !amountError &&
      new BigNumber(amount).gt(0) &&
      new BigNumber(amount).minus(baseFee).minus(liquidityFees).gt(0) &&
      overPoolSize
    );
  }, [
    loading,
    amount,
    amountError,
    toAddress,
    baseFee,
    liquidityFees,
    overPoolSize
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
                setToChain(0);
              }}
              value={fromChain}
              options={fromChainList}
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
                e = e.replace(/^\D*(\d*(?:\.\d{0,10})?).*$/g, '$1')
                if (new BigNumber(e).lt(new BigNumber(baseFee).plus(liquidityFees))) {
                  setAmountError(
                    "Amount must be greater than total fees"
                  );
                } else if (new BigNumber(e).gt(formatTokenBalance)) {
                  setAmountError("Insufficient balance");
                } else {
                  setAmountError("")
                }
                setAmount(e);
              }}
            ></Input>
            {amountError && (
              <div className="text-red-500 text-left text-base mt-2">
                {amountError}
              </div>
            )}
            <img
              alt=""
              src={ArrowIcon}
              className="w-[34px] h-[34px] mx-auto my-4"
            ></img>
            <Select
              onChange={(value) => setToChain(Number(value))}
              value={toChain}
              options={toChainList}
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
          <div className={clsx("flex items-center h-[18px] mb-3  justify-between", {
            "text-red-500": new BigNumber(amount)
              .minus(baseFee)
              .minus(liquidityFees).lt(0),
          })}>
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
                      ? `～${baseFee} ${type === "Deposit" ? "USDC" : "muUSD"}`
                      : "--"}
                </p>
                <p className="mb-4">
                  The Liquidity Fees:{" "}
                  {isFlag ? (
                    <span className="text-green-400">For Free!</span>
                  ) : (
                    <span>
                      {new BigNumber(liquidityFees)
                        .decimalPlaces(4, 1)
                        .toString()}{" "}
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
                : fromTokenAddress
                  ? `～${fromChain
                    ? new BigNumber(baseFee)
                      .plus(liquidityFees)
                      .decimalPlaces(4, 1)
                      .toString()
                    : "0"
                  } ${type === "Deposit" ? "USDC" : "muUSD"}`
                  : "--"}
            </span>
          </div>
          {/* <div className="flex items-center mb-3 h-[18px] justify-between">
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
          </div> */}
          {
            type !== "Deposit" && <div
              className={clsx("flex items-center mb-3 h-[18px] justify-between", {
                "text-red-500": !overPoolSize && amount,
              })}
            >
              <span>Max available amount</span>
              <span>
                {
                    poolSize
                    ? ethers.formatUnits(poolSize.toString() || 0, 6).toString()
                    : "--"}
              </span>
            </div>
          }
          <div className="flex items-center h-[18px] mb-3 justify-between">
            <span>You will receive</span>
            <span>
              {selectedAssetFormat && new BigNumber(amount || 0)
                .minus(baseFee || 0)
                .minus(liquidityFees || 0).gt(0)
                ? `${new BigNumber(amount)
                  .minus(baseFee)
                  .minus(liquidityFees)
                  .toFixed(4, 1)} ${type === "Deposit" ? "muUSD" : "USDC"}`
                : "--"}
            </span>
          </div>
          <div className="flex items-center mb-3  h-[18px] justify-between">
            <span>Estimated time of arrival</span>
            <span>1-5&nbsp;Mins</span>
          </div>
          {/* <div className="flex items-center mb-3  h-[18px] justify-between">
            <span>Receive</span>
            <span>
              {amount
                ? `${amount} ${type === "Deposit" ? "muUSD" : "USDC"}`
                : "--"}
            </span>
          </div> */}
        </div>
      </main>

      <div
        style={{
          background: "linear-gradient(90deg, #08C8B5 0%, #9A20DD 100%)",
        }}
        onClick={async () => {
          if (!submitDisabled) {
            if (buttonText === "Switch network") {
              switchChain({
                chainId: fromChain,
              });
            } else {
              submit();
            }
          } else if (buttonText === "Switch network") {
            switchChain({
              chainId: fromChain,
            });
          }
        }}
        className={clsx(
          "container !mt-[20px] gap-[24px] h-[48px] md:h-[70px] rounded-[14px] flex items-center justify-center text-[#FFFFFF] text-[20px] font-semibold cursor-pointer mx-auto",
          {
            "cursor-not-allowed opacity-40":
              (submitDisabled || loading) && buttonText !== "Switch network",
          }
        )}
      >
        {loading && <Loading></Loading>} {loading ? "Pending..." : buttonText}
      </div>
    </div>
  );
};

export {MuUSD};
