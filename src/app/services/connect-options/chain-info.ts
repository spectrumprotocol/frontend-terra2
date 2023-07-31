import { ChainInfo } from '@keplr-wallet/types';
import { chainInfos } from '../../consts/config';

export function getChainInfo(chainId: string): ChainInfo {
  return chainInfos[chainId];
}
