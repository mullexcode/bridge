import { defineChain } from "viem";

export const GoatTest = defineChain({
  id: 48816,
  name: "goat testnet",
  nativeCurrency: { name: "goat", symbol: "goat", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://rpc.testnet3.goat.network"],
    },
  },
});