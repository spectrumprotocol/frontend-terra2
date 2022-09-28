import {Injectable} from '@angular/core';
import BigNumber from 'bignumber.js';
import {RewardInfoResponseItem} from '../../../api/spectrum_astroport_farm/reward_info_response';
import {TerrajsService} from '../../../terrajs.service';
import {
  DEX,
  FARM_TYPE_ENUM,
  FarmInfoService,
  NETWORK_NAME_ENUM,
  PairStat,
  PoolAPR,
  PoolInfo
} from '../../farm-info.service';
import {PoolResponse} from '../../../api/astroport_pair/pool_response';
import {VaultsResponse} from '../../../api/gov/vaults_response';
import {SpectrumAstroportGenericFarmService} from '../../../api/spectrum-astroport-generic-farm.service';
import {WasmService} from '../../../api/wasm.service';
import {PairInfo} from '../../../api/astroport_factory/pair_info';
import {TokenInfo} from '../../../info.service';
import {Denom} from '../../../../consts/denom';
import {getStablePrice} from '../../../../libs/stable';
import {SYMBOLS} from '../../../../consts/symbol';

@Injectable()
export class AstroportLunaxLunaFarmInfoService implements FarmInfoService {
  readonly farm = 'Stader';
  readonly farmColor = '#d924c5';
  readonly auditWarning = false;
  readonly farmType: FARM_TYPE_ENUM = 'LP';
  readonly dex: DEX = 'Astroport';
  baseTokenContract: string;
  denomTokenContract: string;
  readonly highlight = false;
  readonly notUseAstroportGqlApr = false;
  poolAprs: PoolAPR[];
  farmContract: string;
  compoundProxyContract: string;
  readonly availableNetworks = new Set<NETWORK_NAME_ENUM>(['mainnet']);
  contractOnNetwork: string;
  readonly poolType = 'stable';

  constructor(
    private farmService: SpectrumAstroportGenericFarmService,
    private terrajs: TerrajsService,
    private wasm: WasmService,
  ) {
    this.refreshContractOnNetwork();
  }

  refreshContractOnNetwork() {
    this.baseTokenContract = this.terrajs.settings.lunaXToken;
    this.denomTokenContract = Denom.LUNA;
    this.poolAprs = [{
      apr: 0,
      rewardSymbol: SYMBOLS.ASTRO,
      rewardContract: this.terrajs.settings.astroToken
    }];
    this.farmContract = this.terrajs.settings.astroportLunaXLunaFarm;
    this.compoundProxyContract = this.terrajs.settings.astroportLunaXLunaFarmCompoundProxy;
    this.contractOnNetwork = this.terrajs.networkName;
  }

  // no LP APR calculation, return 0 to use Astroport API
  async queryPairStats(poolInfos: Record<string, PoolInfo>, poolResponses: Record<string, PoolResponse>, govVaults: VaultsResponse, pairInfos: Record<string, PairInfo>, tokenInfos: Record<string, TokenInfo>, ulunaPrice: number, ampStablePairs: Record<string, string>): Promise<Record<string, PairStat>> {
    const key = `${this.dex}|${this.baseTokenContract}|${this.denomTokenContract}`;
    const depositAmountTask = this.wasm.query(this.terrajs.settings.astroportGenerator, {
      deposit: {
        lp_token: pairInfos[key].liquidity_token,
        user: this.farmContract
      }
    });
    const pairs: Record<string, PairStat> = {};

    const [depositAmount] = await Promise.all([depositAmountTask]);

    const p = poolResponses[key];

    pairs[key] = {
      poolAprs: this.poolAprs,
      poolApy: 0,
      tvl: '0',
      multiplier: 0,
      vaultFee: 0
    };

    const [ulunaAsset, lunaXAsset] = p.assets[0].info?.['native_token']?.['denom'] === Denom.LUNA
      ? [p.assets[0], p.assets[1]]
      : [p.assets[1], p.assets[0]];
    if (!ulunaAsset) {
      return;
    }
    const amp = ampStablePairs[key];
    const lunaXPrice = getStablePrice(+lunaXAsset.amount, +ulunaAsset.amount, +amp);
    const lunaXSwap = new BigNumber(depositAmount)
      .times(lunaXAsset.amount)
      .div(p.total_share)
      .times(lunaXPrice)
      .integerValue(BigNumber.ROUND_DOWN);

    const pair = pairs[key];
    pair.tvl = new BigNumber(depositAmount)
      .times(ulunaAsset.amount)
      .div(p.total_share)
      .plus(lunaXSwap)
      .times(ulunaPrice)
      .toString();

    return pairs;
  }

  async queryReward(): Promise<RewardInfoResponseItem> {
    const rewardInfo = await this.farmService.query(this.farmContract, {
      reward_info: {
        staker_addr: this.terrajs.address,
      }
    });
    return rewardInfo.reward_info;
  }
}
