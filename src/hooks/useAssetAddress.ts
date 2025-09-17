import { useMemo } from 'react';
import { TOKENS, CONTACT_ADDRESS } from '../const/chain';
import type { AssetType, ChainId } from '../const/chain';

interface UseAssetAddressProps {
  fromChain: number;
  selectedAsset?: string;
}

interface UseAssetAddressReturn {
  assetAddress: `0x${string}` | undefined;
  currentContact: `0x${string}` | undefined;
}

export const useAssetAddress = ({ fromChain, selectedAsset }: UseAssetAddressProps): UseAssetAddressReturn => {
  // 计算当前链的合约地址
  const currentContact = useMemo(() => {
    if (!fromChain) return undefined;
    return fromChain === Number(import.meta.env.VITE_APP_METIS_CHAINID)
      ? CONTACT_ADDRESS[Number(import.meta.env.VITE_APP_METIS_CHAINID)]
      : fromChain === Number(import.meta.env.VITE_APP_ETH_CHAINID)
        ? CONTACT_ADDRESS[Number(import.meta.env.VITE_APP_ETH_CHAINID)]
        : CONTACT_ADDRESS[Number(import.meta.env.VITE_APP_LINEA_CHAINID)];
  }, [fromChain]);

  // 计算当前选择的资产地址
  const assetAddress = useMemo(() => {
    if (!selectedAsset || !fromChain) return undefined;
    const targetChainId: ChainId =
      fromChain === Number(import.meta.env.VITE_APP_METIS_CHAINID)
        ? Number(import.meta.env.VITE_APP_METIS_CHAINID)
        : fromChain === Number(import.meta.env.VITE_APP_ETH_CHAINID)
          ? Number(import.meta.env.VITE_APP_ETH_CHAINID)
          : Number(import.meta.env.VITE_APP_LINEA_CHAINID);
    const assetKey = selectedAsset as AssetType;
    return TOKENS[targetChainId]?.[assetKey] as `0x${string}` | undefined;
  }, [fromChain, selectedAsset]);

  return {
    assetAddress,
    currentContact
  };
};