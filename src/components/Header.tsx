import { ChevronDownIcon } from "lucide-react";
import logo from "@/assets/images/logo.png";
import WalletIcon from "@/assets/images/wallet.png";
import DisconnectIcon from "@/assets/images/disconnect.svg";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { useLocation, useNavigate } from "react-router-dom";
import clsx from "clsx";
import { useAccount, useDisconnect } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { desensitization } from "../utils";
export default function Header() {
    const location = useLocation();
    const navigate = useNavigate();
    const account = useAccount();
    const { disconnect } = useDisconnect();
    return (
        <header className="w-full fixed px-4 py-3 top-0 z-10">
            <div className="mx-auto flex justify-between items-center">
                <div className="flex items-center space-x-8">
                    <img alt="" src={logo} className="w-[124px] h-auto"></img>
                    <nav className="flex gap-[40px] ml-[60px] text-[#2C2C3F] text-[18px]">
                        <Menu>
                            {({ open }) => (
                                <>
                                    <MenuButton
                                        className={clsx(
                                            "inline-flex bg-transparent cursor-pointer border-none gap-[2px] outline-none items-center text-[18px] focus:not-data-focus:outline-none data-focus:outline data-focus:outline-white",
                                            {
                                                "text-[#5F4BD9] font-semibold":
                                                    location.pathname === "/bridge",
                                            }
                                        )}
                                    >
                                        Bridge
                                        <ChevronDownIcon
                                            className={clsx("size-4", {
                                                "rotate-180": open,
                                            })}
                                        />
                                    </MenuButton>
                                    <MenuItems
                                        anchor="bottom"
                                        className="p-[10px] cursor-pointer outline-none border-none text-[12px] font-medium rounded-[10px] bg-white shadow-[0px_1px_4px_0px_#1A1D251F]"
                                    >
                                        <MenuItem>
                                            <div
                                                onClick={() => {
                                                    navigate("/bridge");
                                                }}
                                                className="bg-[#F2F3F8] rounded-[8px] w-[150px] mb-[10px] h-[36px] flex items-center pl-[10px]"
                                            >
                                                Bridge
                                            </div>
                                        </MenuItem>
                                        <MenuItem>
                                            <div className="bg-[#F2F3F8] text-[#A6A8B3] relative rounded-[8px] w-[150px] mb-[10px] h-[36px] flex items-center pl-[10px]">
                                                Deposit
                                                <div
                                                    style={{
                                                        background:
                                                            "linear-gradient(135deg, #EDE9FE 0%, #F3E8FF 100%)",
                                                    }}
                                                    className="text-[8px] text-[#5F4BD9] absolute top-0 right-0 px-[6px] py-[2px] rounded-bl-[8px] rounded-tr-[8px]"
                                                >
                                                    Coming Soon
                                                </div>
                                            </div>
                                        </MenuItem>
                                        <MenuItem>
                                            <div className="bg-[#F2F3F8] relative text-[#A6A8B3] rounded-[8px] w-[150px] h-[36px] flex items-center pl-[10px]">
                                                NFT Cross
                                                <div
                                                    style={{
                                                        background:
                                                            "linear-gradient(135deg, #EDE9FE 0%, #F3E8FF 100%)",
                                                    }}
                                                    className="text-[8px] text-[#5F4BD9] absolute top-0 right-0 px-[6px] py-[2px] rounded-bl-[8px] rounded-tr-[8px]"
                                                >
                                                    Coming Soon
                                                </div>
                                            </div>
                                        </MenuItem>
                                    </MenuItems>
                                </>
                            )}
                        </Menu>
                        <div
                            onClick={() => {
                                navigate("/pool");
                            }}
                            className={clsx(
                                "text-gray-600 cursor-pointer transition-colors",
                                {
                                    "text-[#5F4BD9] font-semibold": location.pathname === "/pool",
                                }
                            )}
                        >
                            Pool
                        </div>
                        <div className="text-[#2C2C3F]/50 flex items-center gap-[8px]">
                            Transactions
                            <span
                                style={{
                                    background:
                                        "linear-gradient(135deg, #EDE9FE 0%, #F3E8FF 100%)",
                                }}
                                className="text-[#5F4BD9] text-[12px] font-medium rounded-[6px] px-[8px] py-[4px] leading-[16px]"
                            >
                                Coming Soon
                            </span>
                        </div>
                    </nav>
                </div>
                <div className="flex items-center space-x-4">
                    {account && account.address && account.isConnected ? (
                        <div
                            onClick={() => {
                                disconnect();
                            }}
                            style={{
                                background:
                                    "linear-gradient(127.14deg, #08C8B5 13.02%, #9A20DD 104.31%)",
                            }}
                            className="flex rounded-[14px] h-[48px] items-center gap-[10px] justify-center px-[20px] cursor-pointer text-white font-semibold"
                        >
                            {desensitization(account.address)}
                            <img alt="" src={DisconnectIcon}></img>
                        </div>
                    ) : (
                        <ConnectButton.Custom>
                            {({
                                account,
                                chain,
                                openChainModal,
                                openConnectModal,
                                authenticationStatus,
                                mounted,
                            }) => {
                                // Note: If your app doesn't use authentication, you
                                // can remove all 'authenticationStatus' checks
                                const ready = mounted && authenticationStatus !== "loading";
                                const connected =
                                    ready &&
                                    account &&
                                    chain &&
                                    (!authenticationStatus ||
                                        authenticationStatus === "authenticated");

                                return (
                                    <div
                                        {...(!ready && {
                                            "aria-hidden": true,
                                            style: {
                                                opacity: 0,
                                                pointerEvents: "none",
                                                userSelect: "none",
                                            },
                                        })}
                                    >
                                        {(() => {
                                            return (
                                                <div
                                                    onClick={() => {
                                                        if (!connected) {
                                                            openConnectModal();
                                                        } else {
                                                            if (chain.unsupported) {
                                                                openChainModal();
                                                            }
                                                        }
                                                    }}
                                                    className="bg-[#FFFFFF] cursor-pointer gap-[12px] shadow-[0px_1px_4px_0px_#1A1D251F] rounded-[14px] h-[48px] font-semibold text-[#5F4BD9] flex items-center justify-between pr-[20px]"
                                                >
                                                    <img
                                                        alt=""
                                                        src={WalletIcon}
                                                        className="w-[48px] h-auto"
                                                    ></img>
                                                    Connect
                                                </div>
                                            );
                                        })()}
                                    </div>
                                );
                            }}
                        </ConnectButton.Custom>
                    )}
                </div>
            </div>
        </header>
    );
}
