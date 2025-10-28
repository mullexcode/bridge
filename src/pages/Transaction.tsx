import React, { useCallback, useEffect, useMemo, useState } from "react";
import USDCIcon from "@/assets/images/USDC.png";
import ETHIcon from "@/assets/images/ETH.png";
import LinkIcon from "@/assets/images/link.png";
import CopyIcon from "@/assets/images/copy.png";
import DoubleArrowIcon from "@/assets/images/double-arrow.png";
import ArrowIcon from "@/assets/images/page-arrow.png";
import TimeIcon from "@/assets/images/time.png";
import DownIcon from "@/assets/images/down.png";
import NoDataIcon from "@/assets/images/no-data.png";
import PendingIcon from "@/assets/images/pending.png";
import SuccessIcon from "@/assets/images/success.png";
import FailIcon from "@/assets/images/fail.png";
import {
  Checkbox,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
} from "@headlessui/react";
import { useAccount } from "wagmi";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { desensitization} from "../utils";

// import MuUSDIcon from "@/assets/images/muUSD.png";
import BigNumber from "bignumber.js";
import { toast } from "react-toastify";
import clsx from "clsx";
import { formatUnits } from "ethers";
import { Tooltip } from "react-tooltip";
import TooltipIcon from "@/assets/images/black-tooltip.png";
dayjs.extend(utc);
type TxModel = {
  address: string;
  refer: string;
  page: number;
  pagesize: number;
  txlist: Array<{
    tm: number;
    source: string; // 源地址
    sourcehash: string; // 源txhash
    chainid: string; // 源链id
    token: string; // usdc/muusd, 源链的token名称
    target: string; // 目标地址
    targethash: string; // 目标txhash
    targetchainid: string; // 目标链id
    targettoken: string;
    amount: number;
    status: string;
    chainIcon: string;
    targetChainIcon: string;
    targetTokenIcon: string;
    tokenIcon: string;
    fee: string;
    chainName: string;
    targetChainName: string;
    baseFee: string;
  }>;
};

const tabs = ["Bridge", "muUSD", "Pool"];
const filters = ["All", "Pending", "Success", "Failed"];
const filterButton = {
  muUSD: ["Deposit", "Redeem"],
  Pool: ["Add Liquidity", "Remove Liquidity"],
};

const Transaction: React.FC = () => {
  const [chains, setChains] = useState<any[]>([]);
  const [tokens, setTokens] = useState<any[]>([]);

  const [type, setType] = useState<"Bridge" | "muUSD" | "Pool">("Bridge");
  const [filterButtonType, setFilterButtonType] = useState("");
  const [condition, setCondition] = useState("All");
  const [txList, setTxList] = useState<TxModel | null>(null);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const { address } = useAccount();

  const getFee = useCallback(
    (chainId: string, amount: string, targettoken: string) => {
      if (type === "Bridge") {
        const baseFee =
          chainId === import.meta.env.VITE_APP_ETH_CHAINID.toString()
            ? "0.5"
            : "0.1";
        return new BigNumber(baseFee)
          .plus(
            new BigNumber(amount || "0").times(
              targettoken === "muusd" ? 0 : 0.0003
            )
          )
          .decimalPlaces(4, 1)
          .toString();
      } else if (type === "muUSD") {
        const baseFee =
          chainId === import.meta.env.VITE_APP_ETH_CHAINID.toString()
            ? "0.5"
            : "0.1";
        return new BigNumber(baseFee)
          .plus(new BigNumber(amount || "0").times(0.0003))
          .decimalPlaces(4, 1)
          .toString();
      }
      return "0";
    },
    [type]
  );

  const goScan = (chainId: string, hash: string) => {
      const chain = chains?.find((el) => el.id.toString() === chainId)
      if (!chain) {
        return;
      }

      window.open(`${chain['scan']}tx/${hash}`, '_blank');
  }

    useEffect(() => {
        if (!address) {
            return
        }
        fetch(`${import.meta.env.VITE_APP_API_HOST}/getmetadata`, {
            method: "GET",
        }).then(async (res) => {
            const response = await res.json();
            if (response) {
                setChains(response.chains)
                setTokens(response.tokens)
            }
        });
    }, [address]);

  useEffect(() => {
    if (chains.length===0||tokens.length===0){
        return
    }

    if (address) {
      fetch(`${import.meta.env.VITE_APP_API_HOST}/txcount`, {
        method: "POST",
        body: JSON.stringify({
          address: address,
          refer:
            type === "Bridge"
              ? "0"
              : type === "muUSD"
                ? filterButtonType === "Deposit"
                  ? "1"
                  : "2"
                : filterButtonType === "Add Liquidity"
                  ? "3"
                  : "4",
          pagesize: 7,
          page: page,
          condition: filters.findIndex((el) => el === condition).toString() === "-1" ? "0" : filters.findIndex((el) => el === condition).toString(),
        }),
        headers: {
          "Content-Type": "application/json",
        },
      }).then(async (res) => {
        const response = await res.json();
        if (response) {
          setTotal(response.count || 0);
        }
      });
      fetch(`${import.meta.env.VITE_APP_API_HOST}/txlist`, {
        method: "POST",
        body: JSON.stringify({
          address: address,
          refer:
            type === "Bridge"
              ? "0"
              : type === "muUSD"
                ? filterButtonType === "Deposit"
                  ? "1"
                  : "2"
                : filterButtonType === "Add Liquidity"
                  ? "3"
                  : "4",
          pagesize: 7,
          page: page,
          condition: filters.findIndex((el) => el === condition).toString() === "-1" ? "0" : filters.findIndex((el) => el === condition).toString(),
        }),
        headers: {
          "Content-Type": "application/json",
        },
      }).then(async (res) => {
        const response = await res.json();
        if (response) {
          setTxList({
            ...response,
            txlist: response.txlist ? response.txlist.map((el: any) => {
              const fromChain = chains.find(
                (cel) => cel.id.toString() === el.chainid
              );
              const fromAsset = tokens.find(
                (cel) => cel.id.toString().toUpperCase() === el.token.toString().toUpperCase()
              );
              const toChain = chains.find(
                (cel) => cel.id.toString() === el.targetchainid
              );
              const toAsset = tokens.find(
                (cel) => cel.id.toString().toUpperCase() === el.targettoken.toString().toUpperCase()
              );

              return {
                ...el,
                amount: formatUnits(el.amount || "0", 6).toString(),
                chainIcon: fromChain?.icon || ETHIcon,
                chainName: fromChain?.label || "Ethereum",
                tokenIcon: fromAsset ? fromAsset.icon : USDCIcon,
                targetChainIcon: toChain?.icon || ETHIcon,
                targetChainName: toChain?.label || "Ethereum",
                targetTokenIcon:
                    toAsset ? toAsset.icon : USDCIcon,

                baseFee:
                  el.chainid === el.targetchainid
                    ? "0"
                    : el.chainId ===
                      import.meta.env.VITE_APP_ETH_CHAINID.toString()
                      ? "0.5"
                      : "0.1",

                fee:
                  el.chainid === el.targetchainid
                    ? 0
                    : getFee(
                      el.chainid,
                      formatUnits(el.amount || "0", 6).toString(),
                      el.targettoken
                    ),
              };
            }) : [],
          });
        }
      });
    }
  }, [chains,tokens,address, page, type, getFee, filterButtonType, condition]);

  const copyAddress = useCallback((address: string) => {
    if (address) {
      navigator.clipboard.writeText(address);
      toast.success("Copy Success");
    }
  }, []);

  const { sourceText, targetText } = useMemo(() => {
    return {
      sourceText:
        type === "Bridge"
          ? "Source(From)"
          : type === "muUSD"
            ? filterButtonType === "Deposit"
              ? "Source(Deposit)"
              : "Source(Burn)"
            : "Pool Network",
      targetText:
        type === "Bridge"
          ? "Source(To)"
          : type === "muUSD"
            ? "Target(Get)"
            : "Pool Assets",
    };
  }, [type, filterButtonType]);
  return (
    <div className="w-full max-md:px-[16px] md:w-[1200px] mx-auto md:min-h-[calc(100vh-64px)] md:mt-[84px]">
      <div className="flex w-full md:w-[480px] mx-auto px-[10px] md:px-[14px] justify-center bg-white rounded-[14px] mb-[20px] items-center py-[8px] md:py-[12px] gap-[12px] text-[16px] font-medium">
        {tabs &&
          tabs.map((el) => (
            <div
              onClick={() => {
                if (el === "Pool") {
                  setFilterButtonType("Add Liquidity");
                }
                if (el === "muUSD") {
                  setFilterButtonType("Deposit");
                }
                setType(el as any);
                setPage(0);
              }}
              className={clsx(
                "w-[45%] md:w-[255px] h-[36px] flex items-center justify-center rounded-[10px] cursor-pointer",
                {
                  "bg-gradient-to-br from-[#08C8B5] text-white to-[#9A20DD] bg-[length:100%_100%]":
                    type === el,
                }
              )}
            >
              {el}
            </div>
          ))}
      </div>
      <div
        className={clsx(
          "flex items-center mb-[13px] md:mb-[25px] gap-[12px] md:gap-[24px] overflow-auto justify-between",
          {
            "!justify-end": type === "Bridge",
          }
        )}
      >
        {type !== "Bridge" && (
          <div className="flex items-center gap-[12px] md:gap-[24px]">
            {filterButton[type] &&
              filterButton[type].map((el) => (
                <div
                  onClick={() => setFilterButtonType(el)}
                  className={clsx(
                    "bg-[#FFFFFF] shrink-0 text-[13px] md:text-[16px] leading-[12px] md:leading-[24px] text-[#2C2C3F] px-3 md:px-4 py-[10px] cursor-pointer rounded-[8px] shadow-[0px_1px_1px_0px_#1A1D251A]",
                    {
                      "!text-[#5F4BD9] !font-semibold": el === filterButtonType,
                    }
                  )}
                  key={`filter-button-${el}`}
                >
                  {el}
                </div>
              ))}
          </div>
        )}
        <Menu>
          <MenuButton className="px-[12px] shrink-0  py-[10px] text-[13px] md:text-[16px] leading-[12px] md:leading-[24px] cursor-pointer outline-0 bg-white flex items-center gap-[6px] rounded-[10px]">
            <span>Status: {condition || "All"}</span>
            <svg
              width="12"
              height="8"
              viewBox="0 0 12 8"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M11 1.5L6 6.5L1 1.5"
                stroke="#333333"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </MenuButton>
          <MenuItems
            anchor="bottom"
            className="space-y-[20px] z-[1] outline-0 rounded-[10px] p-5 bg-[#FFFFFF] border-[1px] border-[#D5D4E9]"
          >
            {filters &&
              filters.map((el) => (
                <MenuItem key={el}>
                  {({ close }) => (
                    <div className="flex items-center gap-[8px]">
                      <Checkbox
                        checked={el === condition}
                        onChange={() => {
                          close()
                          setCondition(el === condition ? "All" : el);
                        }}
                        className="group block size-4 rounded border bg-[#F2F3F8] data-checked:bg-[#5F4BD9]"
                      >
                        {/* Checkmark icon */}
                        <svg
                          className="stroke-white opacity-0 group-data-checked:opacity-100"
                          viewBox="0 0 14 14"
                          fill="none"
                        >
                          <path
                            d="M3 8L6 11L11 3.5"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </Checkbox>
                      {el}
                    </div>
                  )}
                </MenuItem>
              ))}
          </MenuItems>
        </Menu>
      </div>

      <div className="md:hidden">
        {txList &&
          txList.txlist.map((el) => (
            <div key={`h5-${el.tm}`}>
              <div className="w-full z-[1] relative rounded-[8px] text-[13px] bg-[#FFFFFF] px-[12px] py-[14px]">
                <div className="flex items-center gap-[6px] text-[13px]">
                  <img alt="" src={TimeIcon} className="w-4 h-4"></img>
                  <span className="text-[#A6A8B3]">Time(UTC)</span>
                  <span className="text-[#454464]">
                    {dayjs.utc(el.tm).format("DD MMM, YYYY HH:mm")}
                  </span>
                </div>
                <div className="mt-[12px] text-left text-[#A6A8B3]">
                  {type === "Pool" ? "Target(To)" : sourceText}
                </div>
                <div className="flex gap-[9px]">
                  <div className="w-[40px] h-[40px] relative rounded-full">
                    <img
                      alt=""
                      src={el.targetChainIcon}
                      className="w-full h-full rounded-full object-contain"
                    ></img>
                    <div className="border-[2px] border-[#ffffff] rounded-full absolute right-[-7px] bottom-[1px]">
                      <img
                        alt=""
                        src={el.tokenIcon}
                        className="w-[16px] h-[16px] rounded-full object-contain"
                      ></img>
                    </div>
                  </div>
                  <div>
                    <div
                      className="flex items-center"
                      onClick={() => goScan(el.chainid, el.sourcehash)}
                    >
                      <span className="text-[#E06D5D] text-[15px]">
                        -{el.amount}
                      </span>
                      <span>
                        &nbsp;{el.token === "muusd" ? "muUSD" : "USDC"}
                      </span>
                      <img
                        alt=""
                        src={LinkIcon}
                        className="w-[12px] ml-[6px] cursor-pointer h-[12px] object-contain"
                      ></img>
                    </div>
                    <div className="flex text-[#282C2B]/30 items-center gap-[6px]">
                      <span>{desensitization(el.source)}</span>
                      <img
                        alt=""
                        src={CopyIcon}
                        onClick={() => copyAddress(el.source)}
                        className="w-[12px] cursor-pointer h-[12px] object-contain"
                      ></img>
                    </div>
                  </div>
                </div>
                {type !== "Pool" && (
                  <>
                    <img
                      alt=""
                      src={DownIcon}
                      className="w-4 ml-[12px] h-4 my-[12px]"
                    ></img>
                    <div className="mt-[12px] text-left text-[#A6A8B3]">
                      {targetText}
                    </div>
                    <div className="flex gap-[9px]">
                      <div className="w-[40px] h-[40px] relative rounded-full">
                        <img
                          alt=""
                          src={el.targetChainIcon}
                          className="w-full h-full rounded-full object-contain"
                        ></img>
                        <div className="border-[2px] border-[#ffffff] rounded-full absolute right-[-7px] bottom-[1px]">
                          <img
                            alt=""
                            src={el.targetTokenIcon}
                            className="w-[16px] h-[16px] rounded-full  object-contain"
                          ></img>
                        </div>
                      </div>
                      {
                        el.targetchainid && el.targethash && <div>
                          <div
                            className="flex items-center"
                            onClick={() =>
                              goScan(el.targetchainid, el.targethash)
                            }
                          >
                            <span className="text-[#5CAD46] text-[15px]">
                              +{el.amount}
                            </span>
                            <span>
                              &nbsp;
                              {el.targettoken === "muusd" ? "muUSD" : "USDC"}
                            </span>
                            <img
                              alt=""
                              src={LinkIcon}
                              className="w-[12px] ml-[6px] cursor-pointer h-[12px] object-contain"
                            ></img>
                          </div>
                          <div className="flex text-[#282C2B]/30 items-center gap-[6px]">
                            <span>{desensitization(el.target)}</span>
                            <img
                              alt=""
                              src={CopyIcon}
                              onClick={() => copyAddress(el.target)}
                              className="w-[12px] cursor-pointer h-[12px] object-contain"
                            ></img>
                          </div>
                        </div>
                      }
                    </div>
                  </>
                )}
              </div>
              <div
                className={`border-[1px] text-[13px] px-[8px] text-[#454464] mt-[-20px] flex items-center justify-between rounded-b-[8px] pt-[26px] pb-[8px] ${el.status === "pending"
                  ? "bg-[#FFF0DA] border-[#F8E1BF]"
                  : el.status === "success"
                    ? "bg-[#E2F4DE] border-[#BEE4B6]"
                    : el.source === "failed"
                      ? "bg-[#FBE8E5] border-[#E06D5D4D]"
                      : "bg-[#FFF0DA] border-[#F8E1BF]"
                  }`}
              >
                <div
                  className={`flex gap-[2px] items-center font-medium ${el.status === "pending"
                    ? "text-[#FFA100]"
                    : el.status === "success"
                      ? "text-[#5CAD46]"
                      : el.source === "failed"
                        ? "text-[#E06D5D]"
                        : "text-[#FFA100]"
                    }`}
                >
                  <img
                    alt=""
                    src={
                      el.status === "success"
                        ? SuccessIcon
                        : el.status === "failed"
                          ? FailIcon
                          : PendingIcon
                    }
                    className="w-[24px] h-[24px]"
                  ></img>
                  {el.status === "pending"
                    ? "Pending"
                    : el.status === "success"
                      ? "Success"
                      : el.source === "failed"
                        ? "Failed"
                        : "Pending"}
                </div>
                <div>
                  Fees:&nbsp;{el.fee} {el.token === "muusd" ? "muUSD" : "USDC"}
                </div>
              </div>
            </div>
          ))}
        {
          total === 0 && <div className="w-full h-full pt-[50%] flex items-center justify-center">
            <img alt="no-data" src={NoDataIcon} className="w-[142px] h-[108px]"></img>
          </div>
        }
      </div>

      <div className="max-md:hidden min-h-[672px] border bg-[#FFFFFF] border-[#FFFFFF] rounded-[14px] shadow-[0px_1px_4px_0px_#1A1D251F]">
        <div className="text-[16px] flex items-center rounded-t-[14px] border-b-[1px] border-[#F5F6FA] bg-[#FFFFFF] px-[26px] text-left py-[18px] font-bold leading-[24px] text-[#2C2C3F]">
          <div className="w-[25%]">Time(UTC)</div>
          <div className="w-[25%]">{sourceText}</div>
          <div className="w-[25%]">{targetText}</div>
          <div className="w-[15%]">
            {type === "Pool" ? `${filterButtonType === "Add Liquidity" ? "Added" : "Removed"} Amount` : "Fees"}
          </div>
          <div className="w-[10%] text-right">State</div>
        </div>
        {txList &&
          txList.txlist.map((el, index) => (
            <div
              key={`tx-${el.tm}`}
              className={`flex items-center px-[26px] text-left py-[24px] text-[16px] font-medium bg-white text-[#454464] ${index !== txList.txlist.length - 1
                ? "border-b-[1px] border-[#F5F6FA]"
                : "rounded-b-[14px]"
                }`}
            >
              <div className="w-[25%]">
                {dayjs.utc(el.tm).format("DD MMM, YYYY HH:mm")}
              </div>
              <div className="w-[25%] flex gap-[9px]">
                {type === "Pool" ? (
                  <>
                    <div className="flex items-center gap-[8px]">
                      <img
                        alt=""
                        src={el.chainIcon}
                        className="w-[40px] rounded-full h-[40px] object-contain"
                      ></img>
                      <span>{el.chainName}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-[40px] h-[40px] relative rounded-full">
                      <img
                        alt=""
                        src={el.tokenIcon}
                        className="w-full h-full rounded-full object-contain"
                      ></img>
                      <div className="border-[2px] border-[#ffffff] rounded-full absolute right-[-7px] bottom-[1px]">
                        <img
                          alt=""
                          src={el.chainIcon}
                          className="w-[16px] h-[16px] rounded-full object-contain"
                        ></img>
                      </div>
                    </div>
                    <div>
                      <div
                        className="flex items-center"
                        onClick={() => goScan(el.chainid, el.sourcehash)}
                      >
                        <span className="text-[#E06D5D]">-{el.amount}</span>
                        <span>
                          &nbsp;{el.token === "muusd" ? "muUSD" : "USDC"}
                        </span>
                        <img
                          alt=""
                          src={LinkIcon}
                          className="w-[12px] ml-[6px] cursor-pointer h-[12px] object-contain"
                        ></img>
                      </div>
                      <div className="flex text-[#282C2B]/30 items-center gap-[6px]">
                        <span>{desensitization(el.source)}</span>
                        <img
                          onClick={() => copyAddress(el.source)}
                          alt=""
                          src={CopyIcon}
                          className="w-[12px] cursor-pointer h-[12px] object-contain"
                        ></img>
                      </div>
                    </div>
                  </>
                )}
              </div>
              <div className="w-[25%] flex gap-[9px]">
                {type === "Pool" ? (
                  <>
                    <div className="flex items-center gap-[8px]">
                      <img
                        alt=""
                        src={el.targetTokenIcon}
                        className="w-[40px] rounded-full h-[40px] object-contain"
                      ></img>
                      <span>{el.targettoken === "muusd" ? "muUSD" : "USDC"}</span>
                    </div>
                  </>
                ) : (
                  <>
                    {" "}
                    <div className="w-[40px] h-[40px] relative rounded-full">
                      <img
                        alt=""
                        src={el.targetTokenIcon}
                        className="w-full h-full rounded-full object-contain"
                      ></img>
                      <div className="border-[2px] border-[#ffffff] rounded-full absolute right-[-7px] bottom-[1px]">
                        <img
                          alt=""
                          src={el.targetChainIcon}
                          className="w-[16px] h-[16px] rounded-full object-contain"
                        ></img>
                      </div>
                    </div>
                    <div>
                      <div
                        className="flex items-center"
                        onClick={() => {
                          if (el.targetchainid && el.targethash) {
                            goScan(el.targetchainid, el.targethash)
                          }
                        }}
                      >
                        <span className="text-[#00A186]">+{el.amount}</span>
                        <span>
                          &nbsp;{el.targettoken === "muusd" ? "muUSD" : "USDC"}
                        </span>
                        {
                          el.targethash && el.targetchainid && <img
                            alt=""
                            src={LinkIcon}
                            className="w-[12px] ml-[6px] cursor-pointer h-[12px] object-contain"
                          ></img>
                        }
                      </div>
                      {
                        el.target && <div className="flex text-[#282C2B]/30 items-center gap-[6px]">
                          <span>{desensitization(el.target)}</span>
                          <img
                            alt=""
                            onClick={() => copyAddress(el.target)}
                            src={CopyIcon}
                            className="w-[12px] cursor-pointer h-[12px] object-contain"
                          ></img>
                        </div>
                      }
                    </div>
                  </>
                )}
              </div>
              {type === "Pool" ? (
                <div
                  onClick={() => goScan(el.chainid, el.sourcehash)}
                  className="w-[15%] flex items-center cursor-pointer gap-[6px]"
                >
                  <span>{el.amount}</span>
                  <span>{el.token === "muusd" ? "muUSD" : "USDC"}</span>{" "}
                  <img
                    alt=""
                    src={LinkIcon}
                    className="w-[12px] ml-[6px] cursor-pointer h-[12px] object-contain"
                  ></img>
                </div>
              ) : (
                <>
                  <div
                    className="w-[15%] flex items-center"
                    data-tooltip-id={`my-tooltip-${el.sourcehash}`}
                  >
                    {el.fee} {el.token === "muusd" ? "muUSD" : "USDC"}
                    <img
                      alt=""
                      src={TooltipIcon}
                      className="w-[14px] ml-[6px] h-[14px]"
                    ></img>
                  </div>
                  <Tooltip
                    id={`my-tooltip-${el.sourcehash}`}
                    className="!bg-[#454464] !rounded-[14px]"
                  >
                    <div className="bg-[#454464] text-[12px] font-normal text-left w-[285px] rounded-[14px]">
                      <p>
                        The Base Fee:{" "}
                        {`～${el.baseFee} ${el.token === "muusd" ? "muUSD" : "USDC"
                          }`}
                      </p>
                      <p className="mb-4">
                        The Liquidity Fees:{" "}
                        {new BigNumber(el.baseFee).eq(el.fee) ? (
                          <span className="text-green-400">For Free!</span>
                        ) : (
                          <span>
                            {new BigNumber(el.fee).minus(el.baseFee).toString()}{" "}
                            {el.token === "muusd" ? "muUSD" : "USDC"}
                          </span>
                        )}
                      </p>
                      <p className="mb-4">
                        Base Fee is used to cover the gas cost for sending your
                        transfer to the chain.{" "}
                      </p>
                      <p>
                        Protocol Fee is paid to Mullex to operate liquidity
                        expenses.
                      </p>
                    </div>
                  </Tooltip>
                </>
              )}
              <div
                className={`w-[10%] flex items-center justify-end gap-[8px] ${el.status === "pending"
                  ? "text-[#FFA100]"
                  : el.status === "success"
                    ? "text-[#5CAD46]"
                    : el.source === "failed"
                      ? "text-[#E06D5D]"
                      : "text-[#FFA100]"
                  }`}
              >
                <div
                  className={`border-[2px] w-[10px] h-[10px] rounded-full ${el.status === "pending"
                    ? "bg-[#FFA100] border-[#FFA100]/10"
                    : el.status === "success"
                      ? "bg-[#5CAD46] border-[#5CAD46]/10"
                      : el.source === "failed"
                        ? "bg-[#E06D5D] border-[#E06D5D]/10"
                        : "bg-[#FFA100] border-[#FFA100]/10"
                    }`}
                ></div>
                <span className="capitalize">{el.status}</span>
              </div>
            </div>
          ))}
        {
          total === 0 && <div className="w-full h-full pt-[20%] flex items-center justify-center">
            <img alt="no-data" src={NoDataIcon} className="w-[142px] h-[108px]"></img>
          </div>
        }
      </div>
      <div className="flex items-center gap-[12px] mt-[24px] justify-end">
        {page > 0 && (
          <>
            <img
              alt=""
              src={DoubleArrowIcon}
              onClick={() => setPage(0)}
              className="w-[24px] h-[24px] cursor-pointer object-contain"
            ></img>
            <img
              alt=""
              src={ArrowIcon}
              onClick={() => setPage(page - 1)}
              className="w-[24px] h-[24px] cursor-pointer object-contain"
            ></img>
          </>
        )}

        {
          total > 0 && <span className="text-[16px] text-[#2C2C3F]">
            Page {page + 1} of {Math.ceil(total / 7)}
          </span>
        }

        {page < (Math.ceil(total / 7) - 1) && (
          <>
            <img
              alt=""
              src={ArrowIcon}
              onClick={() => setPage(page + 1)}
              className="w-[24px] h-[24px] cursor-pointer rotate-180 object-contain"
            ></img>
            <img
              alt=""
              src={DoubleArrowIcon}
              onClick={() => setPage(Math.ceil(total / 7))}
              className="w-[24px] h-[24px] cursor-pointer rotate-180 object-contain"
            ></img>
          </>
        )}
      </div>
    </div>
  );
};

export {Transaction};
