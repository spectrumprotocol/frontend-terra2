import {RewardInfoResponseItem as SpecRewardInfoResponseItem} from '../api/spectrum_spec_farm/reward_info_response';
import {
  RewardInfoResponseItem as AstroportFarmRewardInfoResponseItem
} from '../api/spectrum_astroport_farm/reward_info_response';

import {InjectionToken} from '@angular/core';
import {PoolResponse} from '../api/terraswap_pair/pool_response';
import {VaultsResponse} from '../api/gov/vaults_response';
import {PairInfo} from '../api/astroport_pair/pair_info';
import {TokenInfo} from '../info.service';

export type FARM_TYPE_ENUM = 'LP';
export type FORCE_DEPOSIT_TYPE_ENUM = 'speclp' | 'compound';

export type DEX = 'Terraswap' | 'Astroport' | 'Phoenix';
export type PoolType = 'xyk' | 'stable';

export type PoolInfo = {
  key: string;
  farm: string;
  baseTokenContract: string;
  denomTokenContract: string;
  rewardTokenContracts: string[];
  farmContract: string;
  auditWarning?: boolean;
  farmType: FARM_TYPE_ENUM;
  score: number;
  dex?: DEX;
  highlight: boolean;
  commission?: number;
  notUseAstroportGqlApr?: boolean
  farmConfig?: FarmConfig;
  forceDepositType: FORCE_DEPOSIT_TYPE_ENUM;
  compoundProxyContract: string;
  poolType: PoolType;
  disabled: boolean;
};
export type RewardInfoResponseItem = AstroportFarmRewardInfoResponseItem;

export type PoolAPR = {
  apr: number,
  rewardSymbol: string,
  rewardContract: string
};

export interface PairStat {
  tvl: string;
  poolAprs: PoolAPR[];
  poolApy: number;
  multiplier: number;
  vaultFee: number;
  dpr?: number;
  tradeApy?: number;
}

export interface FarmConfig {
  controller_fee: number;
  platform_fee: number;
  community_fee: number;

  [k: string]: unknown;
}

export const defaultFarmConfig: FarmConfig = {
  controller_fee: 0.01,
  platform_fee: 0.01,
  community_fee: 0.03,
};

export const FARM_INFO_SERVICE = new InjectionToken('FARM_INFO_SERVICE');
export type NETWORK_NAME_ENUM = 'mainnet' | 'testnet';

export interface FarmInfoService {
  // name of farm
  readonly farm: string;

  farmContract: string;
  compoundProxyContract: string;
  poolAprs: PoolAPR[];

  // unaudit notice
  readonly auditWarning?: boolean;

  // color for chart
  readonly farmColor: string;
  readonly availableNetworks: Set<NETWORK_NAME_ENUM>;

  readonly farmType: FARM_TYPE_ENUM;
  readonly highlight?: boolean;
  readonly dex: DEX;

  baseTokenContract: string;
  denomTokenContract: string;

  readonly notUseAstroportGqlApr?: boolean;
  readonly poolType?: PoolType;

  readonly disabled?: boolean;

  contractOnNetwork: string;

  refreshContractOnNetwork();

  queryPairStats(poolInfos: Record<string, PoolInfo>, poolResponses: Record<string, PoolResponse>, govVaults: VaultsResponse, pairInfos: Record<string, PairInfo>, tokenInfos: Record<string, TokenInfo>, ulunaPrice: number, ampStablePairs: Record<string, string>): Promise<Record<string, PairStat>>;

  queryReward(): Promise<RewardInfoResponseItem>;

  getConfig?();

}
