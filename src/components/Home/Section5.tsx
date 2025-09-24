import React from "react";
import RoadmapBg from "@/assets/images/home/roadmap-bg.png";
import RoadmapH5Bg from "@/assets/images/home/roadmap-bg-h5.png";
import RoadmapLine from "@/assets/images/home/roadmap-line.png";
import RoadmapItemBg from "@/assets/images/home/roadmap-item-bg.png";
import RoadmapHoverIcon from "@/assets/images/home/roadmap-item-hover-bg.png";

const data = [
    {
        year: 2025,
        quarter: "Q3",
        desc: [
            "Launching Mullex Bridge Alpha",
            "muUSD now supports multiple EVM chains",
        ],
    },
    {
        year: 2025,
        quarter: "Q4",
        desc: [
            "Supporting Solana and more EVM chains",
            "Auditing with leading security firms",
            "Launching Mullex EVM Alphanet",
            "Launching Mullex Saving for muUSD yield",
            "Forming DAO governance discussion",
            "Developing lite API for developer integration",
        ],
    },
    {
        year: 2026,
        quarter: "Q1",
        desc: [
            "Launching Mullex SDK for easily integration with different dapps",
            "Forming DAO governance discussion",
            "Developing multi-level DAO governance",
        ],
    },
    {
        year: 2025,
        quarter: "Q2",
        desc: [
            "Partnership with key player to integrate",
            "muUSD as global payment solution",
            "Expanding more use case for muUSD",
        ],
    },
];
const Section5 = () => {
    return (
        <div
            style={{
                backgroundImage: `url(${RoadmapBg})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
            }}
            className="text-center overflow-x-hidden relative max-md:!bg-none pt-[32px] md:pt-[150px]"
        >
            <div className="text-[26px] md:text-[80px] after:absolute after:bottom-[-6px] md:after:bottom-[-8px] after:bg-gradient-to-r after:from-[#4F74CA] after:to-[#9129DC] after:w-full md:after:w-[320.5px] after:z-[-1] after:left-0 md:after:left-0 after:h-[8px] md:after:h-[12.5px] relative z-[1] inline-block leading-[18px] md:leading-[59px]">
                Roadmap
            </div>
            <div style={{
                backgroundImage: `url(${RoadmapH5Bg})`,
                backgroundSize: "contain",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
            }} className="mt-[28px] pl-[34px] md:hidden pt-[32px]">
                {data &&
                    data.map((item) => {
                        return (
                            <div
                                className="w-full mb-[22px] flex items-center gap-[10px]"
                                key={`${item.year}-${item.quarter}`}
                            >
                                <div
                                    className="w-[79.66666412353516px] shrink-0 group z-[1] relative cursor-pointer flex items-center justify-center h-[80px] font-[Inter] text-[#1F1F1F]"
                                >
                                    <img alt="" className="absolute w-full h-full" src={RoadmapItemBg}></img>
                                    <div className="bg-[#ffffff] z-[1] relative w-fit mx-auto rounded-full">
                                        <div className="text-[12px] scale-75 origin-center font-medium leading-[9px]">
                                            {item.year}
                                        </div>
                                        <div className="text-[15px] font-medium leading-[17px]">
                                            {item.quarter}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-[12px] text-[#BFBFBF] text-left leading-[16px] font-[Inter]">
                                    {item.desc &&
                                        item.desc.map((del, index) => (
                                            <div
                                                key={`${item.year}-${item.quarter}-${index}`}
                                                className="mb-[4px]"
                                            >
                                                {del}
                                            </div>
                                        ))}
                                </div>
                            </div>
                        );
                    })}

            </div>
            <div className="relative max-md:hidden overflow-hidden flex justify-center">
                <img
                    alt=""
                    src={RoadmapLine}
                    className="w-full absolute top-[185px] shrink-0 object-cover"
                ></img>
                <div className="flex relative justify-center mt-[111px] pr-[26px] z-[10]">
                    {data &&
                        data.map((item) => {
                            return (
                                <div
                                    className="w-[16.2vw] px-[24px] shrink-0 grow-0"
                                    // className="w-[13vw] mr-[1vw] shrink-0 grow-0"
                                    key={`${item.year}-${item.quarter}`}
                                >
                                    <div
                                        className="w-[147.5px] group z-[1] relative cursor-pointer flex items-center justify-center mx-auto h-[149px] font-[Inter] text-[#1F1F1F]"
                                    >
                                        <img alt="" className="absolute w-full h-full visible group-hover:hidden" src={RoadmapItemBg}></img>
                                        <img alt="" className="absolute w-full h-full hidden group-hover:block" src={RoadmapHoverIcon}></img>
                                        <div className="bg-[#ffffff] z-[1] relative w-fit mx-auto p-[20.5px] rounded-full">
                                            <div className="text-[12px] font-medium leading-[9px] mb-[4.5px]">
                                                {item.year}
                                            </div>
                                            <div className="text-[23px] font-medium leading-[17px]">
                                                {item.quarter}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-[14px] text-[#BFBFBF] text-left leading-[24.05px] font-[Inter] mt-[54px]">
                                        {item.desc &&
                                            item.desc.map((del, index) => (
                                                <div
                                                    key={`${item.year}-${item.quarter}-${index}`}
                                                    className="mb-[23.5px]"
                                                >
                                                    {del}
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            );
                        })}
                </div>
            </div>
        </div>
    );
};

export default React.memo(Section5);
