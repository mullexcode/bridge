import React from "react";
import Marquee from "react-fast-marquee";
import BitGetIcon from "@/assets/images/home/bitget.png";
import GoatIcon from "@/assets/images/home/goat.png";
import AstraIcon from "@/assets/images/home/astra.png";
import SevenxIcon from "@/assets/images/home/sevenx.png";
import MetisIcon from "@/assets/images/home/metis.png";
import SNZIcon from "@/assets/images/home/snz.png";
import MixIcon from "@/assets/images/home/mix.png";
import HashkeyIcon from "@/assets/images/home/hashkey.png";
import HashglobalIcon from "@/assets/images/home/hashglobal.png";
import MarqueeBg from "@/assets/images/home/marquee-bg.png";
import MarqueeH5Bg from "@/assets/images/home/marquee-bg-h5.png";
const images = [

  {
    icon: BitGetIcon,
  },
  {
    icon: MetisIcon,
  },
  {
    icon: AstraIcon,
  },
  {
    icon: SevenxIcon,
  },
  {
    icon: MixIcon,
  },
  {
    icon: SNZIcon,
  },
  {
    icon: HashkeyIcon,
  },
  {
    icon: HashglobalIcon,
  },
  {
    icon: GoatIcon,
  },
];
const Section4 = () => {
  return (
    <div className="text-center relative pt-[150px]">
      <div className="text-[26px] md:text-[80px] after:absolute after:bottom-[-6px] md:after:bottom-[-8px] after:bg-gradient-to-r after:from-[#4F74CA] after:to-[#9129DC] after:w-[198px] md:after:w-[320.5px] after:z-[-1] after:right-[0px] md:after:right-[220px] after:h-[8px] md:after:h-[12.5px] relative z-[1] inline-block leading-[18px] md:leading-[59px]">
        Ecosystem & Partners
      </div>

      <div className="w-full max-md:hidden aspect-[1920/105.5] mt-[24px] md:mt-[64px] flex items-center justify-center" style={{
        backgroundImage: `url(${MarqueeBg})`,
        backgroundSize: "contain",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}>
        <div className="w-[818px] flex items-center">
          <Marquee
            pauseOnHover
          >
            {images &&
              images.map((imgs, i) => {
                return (
                  <div
                    key={i}
                    className={"mx-[12px] shrink-0 md:mx-[60px] h-[41px]"}
                  >
                    <img
                      className="h-full block shrink-0 object-contain"
                      src={imgs.icon}
                      alt=""
                    />
                  </div>
                );
              })}
          </Marquee>
        </div>
      </div>
      <div style={{
        backgroundImage: `url(${MarqueeH5Bg})`,
        backgroundSize: "contain",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }} className="w-full mt-[75px] aspect-[1115/111] gap-[24px] md:hidden px-[26px] flex items-center justify-around">
        {images &&
          images.slice(0, 3).map((imgs, i) => {
            return (
              <div
                className={"h-[60%]"}
                key={i}
              >
                <img
                  className="h-full block object-contain"
                  src={imgs.icon}
                  alt=""
                />
              </div>
            );
          })}
      </div>
      <div style={{
        backgroundImage: `url(${MarqueeH5Bg})`,
        backgroundSize: "contain",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }} className="w-full aspect-[1115/111] gap-[24px] md:hidden px-[26px] flex items-center justify-around">
        {images &&
          images.slice(3, 6).map((imgs, i) => {
            return (
              <div
                className={"h-[60%]"}
                key={i}
              >
                <img
                  className="h-full block object-contain"
                  src={imgs.icon}
                  alt=""
                />
              </div>
            );
          })}
      </div>
      <div style={{
        backgroundImage: `url(${MarqueeH5Bg})`,
        backgroundSize: "contain",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }} className="w-full aspect-[1115/111] gap-[24px] md:hidden px-[26px] flex items-center justify-around">
        {images &&
          images.slice(6, 9).map((imgs, i) => {
            return (
              <div
                className={"h-[60%]"}
                key={i}
              >
                <img
                  className="h-full block object-contain"
                  src={imgs.icon}
                  alt=""
                />
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default React.memo(Section4);