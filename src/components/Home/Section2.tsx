import React from "react";
import AboutIcon1 from "@/assets/images/home/about1.png";
import AboutIcon2 from "@/assets/images/home/about2.png";
import AboutIcon3 from "@/assets/images/home/about3.png";
import AboutIcon4 from "@/assets/images/home/about4.png";
import MULLEXBg from "@/assets/images/home/MULLEX.png";
import MULLEXBg2 from "@/assets/images/home/MULLEX2.png";
import { motion } from "framer-motion";

const data = [
    {
        icon: AboutIcon1,
        title: "Cross-chain as a Service",
        description:
            "Mullex Protocol offers a decentralized cross-chain bridge tailored for stablecoin transfers. Powered by a relay chain, it enables seamless asset movement, like muUSD, between Ethereum, Solana, and future EVM chains. Mullex's CaaS simplifies interoperability for developers and users, providing a secure, trustless solution for fast stablecoin transactions. With Mullex, access a unified blockchain ecosystem effortlessly.",
    },
    {
        icon: AboutIcon2,
        title: "Bridge the liquidity across the whole blockchain worlds",
        description:
            "Mullex Protocol’s unique strength lies in muUSD, a native yield stablecoin 1:1 backed by USDC, integrable across all blockchains—even those without USDC support. Our relay chain connects numbers of chains, enabling seamless muUSD transfers in under 10 seconds (in theory). Unlock liquidity for DeFi, payments, and more, anywhere in the blockchain world.",
    },
    {
        icon: AboutIcon3,
        title: "Security, fast and low friction",
        description:
            "Mullex Protocol ensures secure, rapid stablecoin transfers using Threshold Signature Scheme (TSS). With theoretical transfer times under 10 seconds between Ethereum and Solana, our low-friction design minimizes fees and simplifies the user experience. Rigorous audits and transparent practices protect assets, including muUSD, making cross-chain bridging fast, secure, and accessible for all.",
    },
    {
        icon: AboutIcon4,
        title: "TSS — no single point of failure",
        description:
            "Mullex Protocol’s TSS eliminates single points of failure, enhancing security for cross-chain transfers. By distributing signing across multiple parties, TSS ensures trustless, tamper-proof transactions for assets like muUSD across Ethereum, Solana, and future EVM chains. Combined with our relay chain, it delivers a robust, fault-tolerant cross-chain ecosystem.",
    },
];
const Section2 = () => {
    return (
        <div className="text-center relative pb-[10px] md:pb-[90.5px]">
            <motion.img
                alt=""
                src={MULLEXBg2}
                className="w-[675.5px] max-md:hidden h-auto absolute left-0 top-0"
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 3, ease: "easeOut" }}
            ></motion.img>
            <motion.img
                alt=""
                src={MULLEXBg}
                className="w-[937px] max-md:hidden h-auto absolute right-0 bottom-[25px]"
                initial={{ x: 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 3, ease: "easeOut" }}
            ></motion.img>
            <div className="text-[26px] md:text-[80px] after:absolute after:bottom-[-6px] md:after:bottom-[-8px] after:bg-gradient-to-r after:from-[#4F74CA] after:to-[#9129DC] after:w-[90px] md:after:w-[320.5px] after:z-[-1] after:right-[calc(50%-45px)] md:after:right-[220px] after:h-[8px] md:after:h-[12.5px] relative z-[1] inline-block leading-[18px] md:leading-[59px]">
                About Mullex Protocol
            </div>
            <div className="flex gap-[22px] max-md:px-[26px] md:gap-[30px] flex-col md:flex-row relative z-[1] justify-center mt-[28px] md:mt-[65px]">
                {data &&
                    data.map((el) => (
                        <div
                            key={`Section2-item-${el.title}`}
                            className="border-[1.5px] w-full md:w-[307px] text-left border-[#4E4E4E] rounded-[7px]"
                        >
                            <div
                                className="w-full aspect-[307/243] rounded-t-[7px] relative"
                                style={{
                                    backgroundImage: `url(${el.icon})`,
                                    backgroundSize: "cover",
                                    backgroundRepeat: "no-repeat",
                                }}
                            >
                                <div className="w-full h-[26px] md:h-[52px] max-md:text-center max-md:justify-center absolute left-0 bottom-0 p-[17px] flex items-center font-[Lack] text-[13px] md:text-[18px] leading-[13px] md:leading-[17px]">
                                    {el.title}
                                </div>
                            </div>
                            <div className="p-[20px] text-[#BFBFBF] md:p-[17px] font-[Inter] !font-normal text-[12px] md:text-[15px] leading-[16px] md:leading-[18.5px]">
                                {el.description}
                            </div>
                        </div>
                    ))}
            </div>
        </div>
    );
};

export default React.memo(Section2);
