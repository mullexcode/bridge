import ETHIcon from "@/assets/images/ETH.png";
import MetisIcon from "@/assets/images/metis.png";
import LineaIcon from "@/assets/images/linea.png";

export const CHAINS = [
  {
    icon: ETHIcon,
    label: "Ethereum",
    symbol: "eth",
    id: Number(import.meta.env.VITE_APP_ETH_CHAINID) || 1,
  },
  {
    icon: MetisIcon,
    label: "Metis",
    symbol: "metis",
    id: Number(import.meta.env.VITE_APP_METIS_CHAINID) || 1088,
  },
  {
    icon: LineaIcon,
    label: "Linea",
    symbol: "linea",
    id: Number(import.meta.env.VITE_APP_LINEA_CHAINID) || 1,
  },
];

export const TOKENS = {
  [import.meta.env.VITE_APP_ETH_CHAINID]: {
    muUSD: import.meta.env.VITE_APP_ETH_MUSD,
    usdc: import.meta.env.VITE_APP_ETH_USDC,
  },
  [import.meta.env.VITE_APP_LINEA_CHAINID]: {
    muUSD: import.meta.env.VITE_APP_LINEA_MUSD,
    usdc: import.meta.env.VITE_APP_LINEA_USDC,
  },
  [import.meta.env.VITE_APP_METIS_CHAINID]: {
    muUSD: import.meta.env.VITE_APP_METIS_MUSD,
    usdc: import.meta.env.VITE_APP_METIS_USDC,
  } as const,
};

export const CONTACT_ADDRESS = {
  [import.meta.env.VITE_APP_ETH_CHAINID]: import.meta.env.VITE_APP_ETH_CONTACT,
  [import.meta.env.VITE_APP_LINEA_CHAINID]: import.meta.env
    .VITE_APP_LINEA_CONTACT,
  [import.meta.env.VITE_APP_METIS_CHAINID]: import.meta.env
    .VITE_APP_METIS_CONTACT,
} as const;

export type ChainId = keyof typeof TOKENS;
export type AssetType = keyof (typeof TOKENS)[ChainId];