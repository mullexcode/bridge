import React, {useEffect, useMemo, useState} from "react";
import Select from "../components/Select";
import Input from "../components/Input";
import BigNumber from "bignumber.js";
import { Erc20Abi } from "../assets/abi/erc20";
import { ethers, Interface, MaxUint256 } from "ethers";
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

import "react-tooltip/dist/react-tooltip.css";
import Loading from "../components/Loading";
import {preloadImage} from "../utils";

const Pool: React.FC = () => {
  const [chains, setChains] = useState<any[]>([]);
  const [tokens, setTokens] = useState<any[]>([]);
  const [fromChain, setFromChain] = useState(0);

  const [type, setType] = useState<"Add" | "Remove">("Add");
  const account = useAccount();
  const [selectedAsset, setSelectedAsset] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState("");
  const { sendTransactionAsync } = useSendTransaction();
  const { switchChain } = useSwitchChain();

    const getToken = (tokens: any, selectedAsset: string) => {
        return useMemo(() => {
            if (!selectedAsset || !tokens) {
                return "";
            }

            let token:any = null;
            tokens.forEach((item:any) => {
                if (item.symbol.toString().toLocaleUpperCase() === selectedAsset.toString().toLocaleUpperCase()) {
                    token = item;
                }
            });

            return token;
        }, [tokens, selectedAsset]);
    };
    const selectedToken = getToken(tokens, selectedAsset)
    const selectedTokenAddress = useMemo(() => {
        if (!selectedToken) {
            return "";
        }
        console.log("selectedToken", selectedToken[fromChain],"fromChain", fromChain )
        return selectedToken.contracts[fromChain]
    }, [selectedToken, fromChain]);
    const selectedTokenDecimal:number = useMemo(() => {
        if (!selectedToken||!selectedToken.decimals) {
            return 6;
        }
        const result = selectedToken.decimals[fromChain]
        if (result) {
            return result;
        }
        return 6;
    }, [selectedToken, fromChain]);

    const getChainData = (chains: any[], chainId: number) => {
        return useMemo(() => {
            return chains.find((item) => item.id.toString() === chainId.toString());
        }, [chains, chainId]);
    };
    const fromChainData  = getChainData(chains, fromChain);
    const fromContact = useMemo(() => {
        return fromChainData?.contract;
    }, [fromChainData]);

    useEffect(() => {
        if (account.address) {
            fetch(`${import.meta.env.VITE_APP_API_HOST}/getpoolinfo`, {
                method: "GET",
            }).then(async (res) => {
                const response = await res.json();
                if (response) {
                    setChains(response.chains)
                    setTokens(response.tokens)
                    response.chains?.forEach((item: any) => {
                        preloadImage(item.icon)
                    });
                    response.tokens?.forEach((item: any) => {
                        preloadImage(item.icon)
                    });
                }
            });
        }

    }, [account.address]);

  const { data: tokenBalance } = useReadContract({
    address: selectedTokenAddress,
    abi: Erc20Abi,
    functionName: "balanceOf",
    args: [account.address],
    chainId: fromChain,
  });

  const { data: currentLiquity } = useReadContract({
    address: fromContact,
    abi: bridgeAbi,
    functionName: "queryLiquity",
    args: [selectedAsset, account.address],
    chainId: fromChain,
  });

  const { data: allowance } = useReadContract({
    address: selectedTokenAddress,
    abi: Erc20Abi,
    functionName: "allowance",
    args: [account.address, fromContact],
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
            fromContact,
          MaxUint256,
        ]);
        if (selectedTokenAddress && approveData) {
          const tx = {
            to: selectedTokenAddress as `0x${string}`,
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
        type === "Add" ? "addLiquity" : "delLiquity",
        [selectedAsset, ethers.parseUnits(amount, selectedTokenDecimal)]
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
          "token": selectedAsset,
          "address": account.address,
          "hash": txHash,
          "page": "pool",
          "kind": type === "Add" ? "0" : "1",
          "amount": ethers.parseUnits(amount, selectedTokenDecimal).toString(),
        }),
      })
      setLoading(false);
      setAmount("");
      setSelectedAsset("");
      toast.success("Transaction Successful");
    } catch {
      setLoading(false);
    }
  };

  const submitDisabled = useMemo(() => {
    return !(fromChain && selectedAsset);
  }, [fromChain, selectedAsset]);

  const formatTokenBalance = useMemo(() => {
    return ethers.formatUnits(tokenBalance?.toString() || 0, selectedTokenDecimal);
  }, [tokenBalance,selectedTokenDecimal]);

  const liquidity = useMemo(() => {
    return ethers.formatUnits(currentLiquity?.toString() || 0, selectedTokenDecimal);
  }, [currentLiquity,selectedTokenDecimal]);

  const buttonText = useMemo(() => {
    if (!account.address) {
      return `${type} Liquidity`;
    } else if (fromChain && account.chainId !== fromChain) {
      return "Switch network";
    } else if (new BigNumber(allowance?.toString() || 0).lte(amount)) {
      return "Approve";
    } else if (loading) {
      return "Pending...";
    }
    return `${type} Liquidity`;
  }, [
    type,
    loading,
    account.address,
    fromChain,
    account.chainId,
    allowance,
    amount
  ]);

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
              options={tokens}
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
                  e = e.replace(/^\D*(\d*(?:\.\d{0,10})?).*$/g, '$1')
                  if (e === "") {
                    setAmount("")
                    return
                  }
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
                  if (e === "") {
                    setAmount("")
                    return
                  }
                  e = e.replace(/^\D*(\d*(?:\.\d{0,10})?).*$/g, "$1");
                  if (new BigNumber(e).lte(liquidity || 0)) {
                    setAmount(e);
                  } else {
                    setAmount(liquidity);
                  }
                }}
              ></Input>
            </div>
          )}
        </div>
        {/* <div className="p-[16px] text-[14px]font-medium text-[#FFFFFF]">
          <div className="flex items-center h-[18px] justify-between">
            <div
              data-tooltip-id="my-tooltip"
              className="flex items-center gap-[8px]"
            >
              Gas fee
              <img alt="" src={TooltipIcon} className="w-[12px] h-[12px]"></img>
            </div>
            {
              type !== "Add" && <Tooltip id="my-tooltip" className="!bg-[#454464] !rounded-[14px]">
                <div className="bg-[#454464] text-[12px] font-normal text-left rounded-[14px]">
                  <p>he Base Fee: ～{gasFee || "--"} {gasFee && gasFee !== '--' ? (fromChain === Number(import.meta.env.VITE_APP_ETH_CHAINID) ? 'ETH' : "METIS") : ""}</p>
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
            }
            <span>
              {gasFee || "--"}{" "}
              {gasFee && gasFee !== "--"
                ? fromChain === Number(import.meta.env.VITE_APP_ETH_CHAINID)
                  ? "ETH"
                  : "METIS"
                : ""}
            </span>
          </div>
        </div> */}
      </main>

      <div
        style={{
          background: "linear-gradient(90deg, #08C8B5 0%, #9A20DD 100%)",
        }}
        onClick={() => {
          if (!submitDisabled && !loading) {
            if (fromChain && account.chainId !== fromChain) {
              switchChain({
                chainId: fromChain
              });
            } else {
              submit();
            }
          } else if (fromChain && account.chainId !== fromChain) {
            switchChain({
              chainId: fromChain
            });
          }
        }}
        className={clsx(
          "container !mt-[20px] gap-[8px] h-[48px] md:h-[70px] rounded-[14px] flex items-center justify-center text-[#FFFFFF] text-[20px] font-semibold cursor-pointer mx-auto",
          {
            "cursor-not-allowed opacity-40": submitDisabled || loading,
          }
        )}
      >
        {loading && <Loading></Loading>}
        {buttonText}
      </div>
    </div>
  );
};

export { Pool };
