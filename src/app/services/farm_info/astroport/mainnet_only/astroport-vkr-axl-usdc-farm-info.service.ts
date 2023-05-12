import {Injectable} from '@angular/core';
import BigNumber from 'bignumber.js';
import {RewardInfoResponseItem} from '../../../api/spectrum_astroport_farm/reward_info_response';
import {TerrajsService} from '../../../terrajs.service';
import {
  DEX,
  FARM_TYPE_ENUM,
  FarmInfoService,
  CHAIN_ID_ENUM,
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
import {SYMBOLS} from '../../../../consts/symbol';
import {TERRA2_MAINNET_CHAINID} from '../../../../consts/config';

@Injectable()
export class AstroportVkrAxlUsdcFarmInfoService implements FarmInfoService {
  readonly farm = 'Valkyrie';
  readonly farmColor = '#ffe646';
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
  readonly availableNetworks = new Set<CHAIN_ID_ENUM>([TERRA2_MAINNET_CHAINID]);
  contractOnNetwork: string;
  readonly poolType = 'xyk';

  constructor(
    private farmService: SpectrumAstroportGenericFarmService,
    private terrajs: TerrajsService,
    private wasm: WasmService,
  ) {
    this.refreshContractOnNetwork();
  }

  refreshContractOnNetwork() {
    this.baseTokenContract = this.terrajs.settings.valkyrieToken;
    this.denomTokenContract = this.terrajs.settings.axlUsdcToken;
    this.poolAprs = [
      {
        apr: 0,
        rewardSymbol: SYMBOLS.ASTRO,
        rewardContract: this.terrajs.settings.astroToken
      },
      {
        apr: 0,
        rewardSymbol: SYMBOLS.VKR,
        rewardContract: this.terrajs.settings.valkyrieToken
      }
    ];
    this.farmContract = this.terrajs.settings.astroportVkrAxlUsdcFarm;
    this.compoundProxyContract = this.terrajs.settings.astroportVkrAxlUsdcFarmCompoundProxy;
    this.contractOnNetwork = this.terrajs.networkName;
  }

  // no LP APR calculation, return 0 to use Astroport API
  async queryPairStats(poolInfos: Record<string, PoolInfo>, poolResponses: Record<string, PoolResponse>, govVaults: VaultsResponse, pairInfos: Record<string, PairInfo>, tokenInfos: Record<string, TokenInfo>, ulunaPrice: number): Promise<Record<string, PairStat>> {
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
    const axlUsdc = p.assets.find(a => a.info['native_token']?.['denom'] === this.denomTokenContract);
    if (!axlUsdc) {
      return;
    }
    pairs[key] = {
      poolAprs: this.poolAprs,
      poolApy: 0,
      tvl: '0',
      multiplier: 0,
      vaultFee: 0
    };
    const pair = pairs[key];
    pair.tvl = new BigNumber(axlUsdc.amount)
      .times(depositAmount)
      .times(2)
      .div(p.total_share)
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
