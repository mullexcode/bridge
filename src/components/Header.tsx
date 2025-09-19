import { ChevronDownIcon } from "lucide-react";
import logo from "@/assets/images/logo.png";
import WalletIcon from "@/assets/images/wallet.png";
import DisconnectIcon from "@/assets/images/disconnect.svg";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { useLocation, useNavigate } from "react-router-dom";
import clsx from "clsx";
import { useAccount, useChainId, useConnect, useDisconnect } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { desensitization } from "../utils";
import { useEffect, useState } from "react";
const STORAGE_KEY = 'manual-wallet-connection';

export default function Header() {
    const location = useLocation();
    const navigate = useNavigate();
    const { isConnected, address, connector, isConnecting } = useAccount();
    const { connect, connectors } = useConnect();
    const { disconnect } = useDisconnect();
    const chainId = useChainId();
    const [isReconnecting, setIsReconnecting] = useState(false);
    useEffect(() => {
        if (isConnected && address && connector && chainId) {
            const connectionInfo: any = {
                connectorId: connector.id,
                address,
                chainId
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(connectionInfo));
        }
    }, [isConnected, address, connector, chainId]);

    // 2. 页面加载时，尝试自动重连
    useEffect(() => {
        const reconnect = async () => {
            // 如果已连接或正在重连，直接返回
            if (isConnected || isReconnecting || isConnecting) return;

            // 读取本地存储的连接信息
            const storedInfo = localStorage.getItem(STORAGE_KEY);
            if (!storedInfo) return;

            try {
                const { connectorId } = JSON.parse(storedInfo) as any;

                // 找到对应的连接器
                const targetConnector = connectors.find(c => c.id === connectorId);
                if (!targetConnector) {
                    throw new Error(`未找到连接器: ${connectorId}`);
                }

                // 开始重连
                setIsReconnecting(true);
                await connect({ connector: targetConnector });
            } catch (err) {
                console.error('自动重连失败:', err);
                // 重连失败时清除无效信息
                localStorage.removeItem(STORAGE_KEY);
            } finally {
                setIsReconnecting(false);
            }
        };

        // 页面加载完成后尝试重连
        reconnect();
    }, [isConnected, isConnecting, connect, connectors]);

    // 3. 断开连接时清除存储的信息
    const handleDisconnect = () => {
        disconnect();
        localStorage.removeItem(STORAGE_KEY);
    };


    return (
        <header className="w-full fixed px-4 py-3 top-0 z-10">
            <div className="mx-auto flex justify-between items-center">
                <div className="flex items-center space-x-4 md:space-x-8">
                    <div className="flex items-center gap-[12px]">
                        <img alt="" src={logo} className="w-[32px] md:w-[50px] h-auto"></img>
                        <div className="text-[16px] md:text-[20px] text-[#2C2C3F] font-extrabold">Mullex</div>
                    </div>
                    <nav className="flex gap-[24px] md:gap-[40px] ml-[24px] md:ml-[60px] text-[#2C2C3F] text-[14px] md:text-[18px]">
                        <Menu>
                            {({ open }) => (
                                <>
                                    <MenuButton
                                        className={clsx(
                                            "inline-flex bg-transparent cursor-pointer border-none gap-[2px] outline-none items-center text-[14px] md:text-[18px] focus:not-data-focus:outline-none data-focus:outline data-focus:outline-white",
                                            {
                                                "text-[#5F4BD9] font-semibold":
                                                    location.pathname === "/bridge" || location.pathname === "/muUSD" || location.pathname === "/",
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
                                            <div onClick={() => {
                                                navigate("/muUSD");
                                            }} className="bg-[#F2F3F8] rounded-[8px] w-[150px] mb-[10px] h-[36px] flex items-center pl-[10px]">
                                                muUSD
                                            </div>
                                        </MenuItem>
                                        {/* <MenuItem>
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
                                        </MenuItem> */}
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
                                    "!text-[#5F4BD9] font-semibold": location.pathname === "/pool",
                                }
                            )}
                        >
                            Pool
                        </div>
                        <div className="text-[#2C2C3F]/50 max-md:hidden flex items-center gap-[8px]">
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
                    {address && isConnected ? (
                        <div
                            onClick={() => {
                                handleDisconnect();
                            }}
                            style={{
                                background:
                                    "linear-gradient(127.14deg, #08C8B5 13.02%, #9A20DD 104.31%)",
                            }}
                            className="flex rounded-[14px] h-[32px] md:h-[48px] items-center gap-[10px] justify-center max-md:text-[12px] px-[12px] md:px-[20px] cursor-pointer text-white font-semibold"
                        >
                            {desensitization(address)}
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
                                                    className="bg-[#FFFFFF] max-md:text-[12px] cursor-pointer gap-[12px] shadow-[0px_1px_4px_0px_#1A1D251F] rounded-[14px] h-[32px] md:h-[48px] font-semibold text-[#5F4BD9] flex items-center justify-between pr-[20px]"
                                                >
                                                    <img
                                                        alt=""
                                                        src={WalletIcon}
                                                        className="w-[24px] md:w-[48px] h-auto"
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
