import React, { useEffect, useRef } from 'react';
import BannerMp4 from "@/assets/mp4/banner.mp4";
import LogoWhiteIcon from "@/assets/images/home/logo-white.png";
import BannerBg from "@/assets/images/home/banner-bg.png";
import BannerH5Bg from "@/assets/images/home/banner-bg-h5.png";
import LogoIcon from "@/assets/images/home/logo.png";
import { useNavigate } from 'react-router-dom';
// import { toast } from 'react-toastify';
const Section1 = () => {
  const navigate = useNavigate()
  const videoRef = useRef<HTMLVideoElement>(null);
  // 处理视频加载和自动播放，特别是针对iOS设备
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // 尝试在用户交互后启动视频（特别是iOS）
    const handleUserInteraction = async () => {
      if (video.paused) {
        try {
          await video.play();
        } catch (error) {
          console.log('Auto-play failed, will try again on user interaction');
        }
      }
      // 移除事件监听器，避免多次触发
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
    };

    // 立即尝试播放视频
    video.play().catch(() => {
      // 如果自动播放失败，添加用户交互监听器
      document.addEventListener('click', handleUserInteraction);
      document.addEventListener('touchstart', handleUserInteraction);
    });

    // 清理函数
    return () => {
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
    };
  }, []);

  // const isMetaMaskInstalled = () => {
  //   return typeof window.ethereum !== 'undefined' && window.ethereum.isMetaMask;
  // };

  // const addRpc = () => {
  //   // 检查MetaMask是否可用
  //   if (!isMetaMaskInstalled()) {
  //     toast.error("请安装MetaMask钱包")
  //     return;
  //   }

  //   try {

  //     // 调用MetaMask的wallet_addEthereumChain方法添加网络
  //     // await window.ethereum.request({
  //     //   method: 'wallet_addEthereumChain',
  //     //   params: [POLYGON_MUMBAI]
  //     // });
  //     toast.success("网络添加成功！")
  //   } catch (error: any) {
  //     toast.error(`添加失败: ${error.message}`)
  //   }
  // };

  return (
    <div className="font-[lack] text-white bg-[#000000] w-full relative overflow-hidden">
      <div className='home-container !pb-[46px] md:!pb-[200px] z-[2] relative'>
        <div className='px-[16px] md:px-[32px] md:mt-[24px] py-[11px] md:py-[16px] md:rounded-[10px] md:bg-white/[0.05] relative flex items-center justify-between'>
          <img alt='' src={LogoWhiteIcon} className='w-[78px] md:w-[117px] h-auto'></img>
          <div className='flex items-center gap-[20px]'>
            {/* <div onClick={addRpc} className='text-[12px] md:text-[14px] rounded-[3px] md:rounded-[7px] leading-[9px] bg-black/80 md:bg-[#2A2B2B] md:hover:bg-[#000000] px-[10px] md:px-[21px] py-[10.5px] cursor-pointer'>Add RPC</div> */}
            <div onClick={() => navigate("/bridge")} className='text-[12px] md:text-[14px] rounded-[3px] md:rounded-[7px] leading-[9px] bg-black/80 md:bg-[#2A2B2B] md:hover:bg-[#000000] px-[10px] md:px-[21px] py-[10.5px] cursor-pointer'>Start Bridge</div>
          </div>
        </div>
        <img alt='' src={LogoIcon} className='w-[76px] md:w-[184px] mt-[30px] md:mt-[130px] mx-auto h-auto'></img>
        <div className='md:w-[724px] mt-[13px] md:mt-[42px] text-center mx-auto'>
          <div className='text-[18px] md:text-[50px] leading-[26px] md:leading-[47.5px] mb-[16px] md:mb-[27.5px]'>Powering the multi-chain
            stablecoin & RWA ecosystem</div>
          <div className='px-[12px] md:px-[80px] text-[12px] md:text-[20px] font-medium font-[Inter] leading-[14px] md:leading-[26px]'>
            Through its unique TSS + Relay Chain technology, Mullex
            Protocol aims to introduce native multi-chain and yield-
            bearing stablecoins to the blockchain ecosystem.
          </div>
        </div>
        <div className='flex max-md:flex-col justify-center gap-[30px] items-center mt-[20px] md:mt-[41px]'>
          <div
            className='max-md:w-[246px] text-center justify-center font-[lack] flex items-center border-[1px] border-[#ffffff] rounded-[6px] md:rounded-[12px] h-[40px] md:h-[52px] px-[38.5px] text-[15px] md:text-[19.5px] leading-[14px] cursor-pointer hover:bg-[#4A4A4A] transition-opacity'
            onClick={() => window.open("https://docs.mullex.io")}
          >
            Learn More
          </div>
          <div
            className='max-md:w-[246px] text-center justify-center bg-gradient-to-t font-[lack] flex items-center from-[#9A1FDE] to-[#04C9B7] rounded-[6px] md:rounded-[12px] h-[40px] md:h-[52px] px-[38.5px] text-[15px] md:text-[19.5px] leading-[14px] cursor-pointer hover:from-[#4F74CA] hover:to-[#4F74CA] transition-opacity'
            onClick={() => navigate("/bridge")}
          >
            Start Bridge
          </div>
        </div>

      </div>
      <div className='absolute w-full aspect-[1920/269.5] z-[1] left-0 bottom-0' style={{
        backgroundImage: `url(${BannerBg})`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
      }}></div>
      {/* 视频背景 */}
      <div className="absolute inset-0 w-full h-full">
        <img alt='' src={BannerH5Bg} className="object-cover md:hidden w-full h-full"></img>
        <video
          ref={videoRef}
          className="object-cover max-md:hidden w-full h-full"
          autoPlay
          muted
          loop
          playsInline
          disableRemotePlayback
        >
          <source src={BannerMp4} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
    </div>
  );
};

export default React.memo(Section1);
