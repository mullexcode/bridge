import React from "react";
import CommunityIcon from "@/assets/images/home/community.png";
import CommunitySelectIcon from "@/assets/images/home/community-select.png";
import XIcon from "@/assets/images/home/x.png";
import XSelectIcon from "@/assets/images/home/x-select.png";
import ChannelIcon from "@/assets/images/home/channel.png";
import ChannelSelectIcon from "@/assets/images/home/channel-select.png";
import GroupIcon from "@/assets/images/home/group.png";
import GroupSelectIcon from "@/assets/images/home/group-select.png";
// import New1Icon from "@/assets/images/home/new1.png";
// import New2Icon from "@/assets/images/home/new2.png";
// import New3Icon from "@/assets/images/home/new3.png";
import NewBg from "@/assets/images/home/new-bg.png";

const medias = [
    {
        key: "community",
        default: CommunityIcon,
        link: "https://mullex.discourse.group/",
        select: CommunitySelectIcon,
    },
    { key: "x", default: XIcon, select: XSelectIcon, link: "https://x.com/MullexProtocol", },
    { key: "channel", default: ChannelIcon, select: ChannelSelectIcon, link: "https://t.me/mullex_protocol", },
    { key: "group", default: GroupIcon, select: GroupSelectIcon, link: "https://t.me/mullex_group", },
];

// const news = [
//     {
//         title: "News Title Placeholder 1",
//         desc: "Replace with a curated announcement or ecosystem update. This is a low-fi placeholder for editor-managed content and external links.",
//         icon: New1Icon,
//     },
//     {
//         title: "News Title Placeholder 2",
//         desc: "Replace with a curated announcement or ecosystem update. This is a low-fi placeholder for editor-managed content and external links.",
//         icon: New2Icon,
//     },
//     {
//         title: "News Title Placeholder 3",
//         desc: "Replace with a curated announcement or ecosystem update. This is a low-fi placeholder for editor-managed content and external links.",
//         icon: New3Icon,
//     },
// ];
const news: any[] = [];
const Section6 = () => {
    return (
        <div
            style={{
                backgroundImage: `url(${NewBg})`,
                backgroundSize: "contain",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "bottom right",
            }}
            className="text-center relative mt-[8px] md:mt-[151px] pb-[62px] md:pb-[196px]"
        >
            <div className="text-[20px] md:text-[80px] after:absolute after:bottom-[-6px] md:after:bottom-[-8px] after:bg-gradient-to-r after:from-[#4F74CA] after:to-[#9129DC] after:w-[194px] md:after:w-[320.5px] after:z-[-1] after:right-0 md:after:right-0 after:h-[8px] md:after:h-[12.5px] relative z-[1] inline-block leading-[18px] md:leading-[59px]">
                Community update & Supports
            </div>
            <div className="flex items-center justify-center gap-[19px] md:gap-[28.5px] mt-[28px] md:mt-[72px]">
                {medias &&
                    medias.map((item) => (
                        <div
                            onClick={() => window.open(item.link)}
                            key={item.key}
                            className="group w-[62px] md:w-[93px] cursor-pointer"
                        >
                            <img
                                src={item.default}
                                className="group-hover:hidden w-full h-full block"
                                alt=""
                            />
                            <img
                                className="group-hover:block hidden w-full h-full"
                                src={item.select}
                                alt=""
                            />
                        </div>
                    ))}
            </div>

            <div className="bg-gradient-to-t font-[lack] flex items-center w-[246px] md:w-fit mx-auto mt-[34px] md:mt-[78.5px] from-[#9A1FDE] to-[#04C9B7] rounded-[6px] md:rounded-[12px] h-[40px] md:h-[50px] px-[36.5px] text-[14px] md:text-[20px] max-md:justify-center leading-[14px] cursor-pointer hover:from-[#4F74CA] hover:to-[#4F74CA] transition-opacity">
                Request for Connect
            </div>

            <div className="flex mt-[50px] md:mt-[120px] justify-center flex-col md:flex-row gap-[20px] md:gap-[10px] items-center">
                {news &&
                    news.map((el) => (
                        <div className="w-[calc(100vw-80px)] md:w-[434px]" key={`new-item-${el.title}`}>
                            <div
                                style={{
                                    backgroundImage: `url(${el.icon})`,
                                    backgroundSize: "cover",
                                    backgroundPosition: "top",
                                    backgroundRepeat: "no-repeat",
                                }}
                                className="w-[calc(100vw-80px)] md:w-[434px] relative  rounded-[10px] overflow-hidden border-[1px] border-[#4D4D4D] aspect-[434.1/313.6000061035156]"
                            >
                                <div className="absolute w-full text-left left-0 bottom-[19px] md:bottom-[27px] px-[14px] md:px-[24px]">
                                    <div className="mb-[12px] md:mb-[20px] text-[#FFFFFF] text-[12px] md:text-[18px] leading-[8px] md:leading-[24px]">
                                        {el.title}
                                    </div>
                                    <div className="text-[11px] md:text-[16px] leading-[14.5px] md:leading-[22px] text-[#BFBFBF]">
                                        {el.desc}
                                    </div>
                                    <div onClick={() => window.open("https://mullex.gitbook.io/mullex-docs")} className=" font-[lack] max-md:hidden mt-[24px] flex w-fit items-center border-[1px] border-[#ffffff] rounded-[12px] h-[40px] px-[29.5px] text-[16px] leading-[14px] cursor-pointer hover:bg-[#4A4A4A] transition-bg">
                                        Learn More
                                    </div>
                                </div>
                            </div>
                            <div
                                onClick={() => window.open("https://mullex.gitbook.io/mullex-docs")}
                                className='w-full mt-[12px] md:hidden text-center justify-center font-[lack] flex items-center border-[1px] border-[#ffffff] rounded-[6px] md:rounded-[12px] h-[40px] md:h-[52px] px-[38.5px] text-[15px] md:text-[19.5px] leading-[14px] cursor-pointer hover:bg-[#4A4A4A] transition-opacity'
                            >
                                Learn More
                            </div>
                        </div>
                    ))}
            </div>
        </div>
    );
};

export default React.memo(Section6);
