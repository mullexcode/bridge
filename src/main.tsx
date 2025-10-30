import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultConfig, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { goat, linea, lineaSepolia, mainnet, metis, metisSepolia, sepolia,bsc,bscTestnet,xLayer } from 'wagmi/chains';
import { ToastContainer } from "react-toastify";
import './index.css';
import App from './App.tsx';
import "react-toastify/dist/ReactToastify.css";
import { GoatTest } from './const/chains.ts';

// 创建React Query客户端
const queryClient = new QueryClient();

// 配置Wagmi v2
export const config = createConfig({
  chains: [mainnet, sepolia, metisSepolia, metis, linea, lineaSepolia, goat, GoatTest, bsc,bscTestnet,xLayer],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [metisSepolia.id]: http(),
    [lineaSepolia.id]: http(),
    [linea.id]: http(),
    [goat.id]: http(),
    [GoatTest.id]: http(),
    [metis.id]: http("https://metis.drpc.org"),
    [bsc.id]: http(),
    [bscTestnet.id]:http("https://bsc-testnet.public.blastapi.io"),
    [xLayer.id]: http(),
  },
});


const WagmiConfig = getDefaultConfig({
  appName: "cece",
  projectId: "52a9534713853d81195801410732ba51",
  chains: [mainnet, sepolia, metisSepolia, metis, linea, lineaSepolia, goat, GoatTest,bsc,bscTestnet],
  transports: {
    [mainnet.id]: http("https://lb.drpc.org/ethereum/AnSelbKJaEZaq48Ebep8UBLLuR2Zj9gR8Iy4zltYSRe_"),
    [sepolia.id]: http(),
    [metisSepolia.id]: http(),
    [lineaSepolia.id]: http(),
    [goat.id]: http("https://rpc.goat.network"),
    [GoatTest.id]: http(),
    [linea.id]: http("https://lb.drpc.org/linea/AnSelbKJaEZaq48Ebep8UBLLuR2Zj9gR8Iy4zltYSRe_"),
    [metis.id]: http("https://lb.drpc.org/metis/AnSelbKJaEZaq48Ebep8UBLLuR2Zj9gR8Iy4zltYSRe_"),
    [bsc.id]:http("https://lb.drpc.org/metis/AnSelbKJaEZaq48Ebep8UBLLuR2Zj9gR8Iy4zltYSRe_"),
    [bscTestnet.id]:http(),
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <WagmiProvider config={WagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <App />
          <ToastContainer />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </StrictMode>,
);
