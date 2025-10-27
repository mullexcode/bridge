import FooterBg from "@/assets/images/home/footer-MULLEX.png";
import EmailIcon from "@/assets/images/home/email.png";
import FooterXIcon from "@/assets/images/home/footer-x.png";
import TeleXIcon from "@/assets/images/home/tele.png";
import clsx from "clsx";
import { Link } from "react-router-dom";

const menus = [
  {
    title: "Terms & Conditions",
    menus: [
      {
        title: "Privacy policy",
        link: "/",
      },
      {
        title: "Terms of Service",
        link: "/",
      },
      {
        title: "Disclaimer",
        link: "/",
      },
    ],
  },
  {
    title: "Users",
    menus: [
      {
        title: "Mullex Bridge",
        link: "https://bridge.mullex.io/",
      },
      {
        title: "Mint muUSD",
        link: "https://bridge.mullex.io/muUSD",
      },
      {
        title: "Mullex EVM (Coming Soon)",
        disabled: true,
        link: "/",
      },
      {
        title: "Mullex Saving (Coming Soon)",
        disabled: true,
        link: "/",
      },
      {
        title: "Dashboard (Coming Soon)",
        disabled: true,
        link: "/",
      },
    ],
  },
  {
    title: "Developers",
    menus: [
      {
        title: "Docs",
        link: "https://mullex.gitbook.io/mullex-docs",
      },
      {
        title: "Github",
        link: "/",
      },
      {
        title: "API & SDK (Coming Soon)",
        disabled: true,
        link: "/",
      },
    ],
  },
];
export default function Footer() {
  return (
    <div
      className="pt-[46px] font-[Inter] pb-[40px]"
      style={{
        backgroundImage: `url(${FooterBg})`,
        backgroundSize: "contain",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="home-container text-[12px] md:text-[16px] grid grid-cols-2 md:grid-cols-4 mx-auto justify-between">
        {menus &&
          menus.map((el) => (
            <div key={`menu-item-${el.title}`}>
              <div className="text-[12px] md:text-[18px] mb-[22px] md:mb-[33.5px] text-left font-medium">
                {el.title}
              </div>
              {el.menus &&
                el.menus.map((cel) => (
                  <Link
                    to={cel.disabled ? "javascript:void(0)" : cel.link}
                    className={clsx(
                      "text-[#ffffff] block text-left mb-[13px] md:mb-[19.5px]",
                      {
                        "cursor-not-allowed !text-[#6A6A6A]": cel.disabled,
                      }
                    )}
                    key={`menu-item-${cel.title}`}
                  >
                    {cel.title}
                  </Link>
                ))}
            </div>
          ))}
        <div className="flex flex-col md:items-center">
          <div className="text-[12px] md:text-[18px] mb-[33.5px] text-left font-medium">
            Contact
          </div>
          <div className="gap-[13px] flex md:flex-col md:gap-[12px]">
            <Link to={"mailto:contact@mullexlabs.io"}>
              <img
                alt=""
                src={EmailIcon}
                className="w-[30px] md:w-[46px] h-auto"
              ></img>
            </Link>
            <Link to={""}>
              <img
                alt=""
                src={FooterXIcon}
                className="w-[30px] md:w-[46px] h-auto"
              ></img>
            </Link>
            <Link to={""}>
              <img
                alt=""
                src={TeleXIcon}
                className="w-[30px] md:w-[46px] h-auto"
              ></img>
            </Link>
          </div>
        </div>
      </div>
      <div className="mt-[29px] md:mt-[100px] max-md:text-[14px] font-light">
        © 2025 Mullex Protocol — Lo‑Fi Preview
      </div>
    </div>
  );
}
