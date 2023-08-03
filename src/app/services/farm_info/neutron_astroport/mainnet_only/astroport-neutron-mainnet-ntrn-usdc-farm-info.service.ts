import {Injectable} from '@angular/core';
import BigNumber from 'bignumber.js';
import {RewardInfoResponseItem} from '../../../api/spectrum_astroport_farm/reward_info_response';
import {TerrajsService} from '../../../terrajs.service';
import {
  DEX,
  FARM_TYPE_ENUM,
  FarmInfoService,
  PairStat,
  PoolAPR,
  PoolInfo
} from '../../farm-info.service';
import {PoolResponse} from '../../../api/astroport_pair/pool_response';
import {VaultsResponse} from '../../../api/gov/vaults_response';
import {Denom} from '../../../../consts/denom';
import {SpectrumAstroportGenericFarmService} from '../../../api/spectrum-astroport-generic-farm.service';
import {WasmService} from '../../../api/wasm.service';
import {PairInfo} from '../../../api/astroport_factory/pair_info';
import {TokenInfo} from '../../../info.service';
import {times} from '../../../../libs/math';
import {SYMBOLS} from '../../../../consts/symbol';
import {CHAIN_ID_ENUM, CONFIG, NEUTRON_MAINNET_CHAINID, NEUTRON_TESTNET_CHAINID} from 'src/app/consts/config';

@Injectable()
export class AstroportNeutronMainnetNtrnUsdcFarmInfoService implements FarmInfoService {
  readonly farm = 'Astroport';
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
  readonly availableNetworks = new Set<CHAIN_ID_ENUM>([NEUTRON_MAINNET_CHAINID]);
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
    this.baseTokenContract = Denom.NTRN;
    this.denomTokenContract = this.terrajs.settings.usdcToken;
    this.poolAprs = [
      {
        apr: 0,
        rewardSymbol: SYMBOLS.ASTRO,
        rewardContract: this.terrajs.settings.astroToken
      },
    ];
    this.farmContract = this.terrajs.settings.astroportNtrnUsdcFarm;
    this.compoundProxyContract = this.terrajs.settings.astroportNtrnUsdcFarmCompoundProxy;
    this.contractOnNetwork = this.terrajs.networkName;
  }

  // no LP APR calculation, return 0 to use Astroport API
  async queryPairStats(poolInfos: Record<string, PoolInfo>, poolResponses: Record<string, PoolResponse>, govVaults: VaultsResponse, pairInfos: Record<string, PairInfo>, tokenInfos: Record<string, TokenInfo>, injPrice: number): Promise<Record<string, PairStat>> {
    const key = `${this.dex}|${this.baseTokenContract}|${this.denomTokenContract}`;
    const depositAmountTask = this.wasm.query(this.terrajs.settings.astroportGenerator, {
      deposit: {
        lp_token: pairInfos[key].liquidity_token,
        user: this.farmContract
      }
    });
    const pairs: Record<string, PairStat> = {};

    // TODO broken
    const [depositAmount] = await Promise.all([depositAmountTask]);

    const p = poolResponses[key];
    const usdc = p.assets.find(a => a.info['native_token']?.['denom'] === this.denomTokenContract);
    if (!usdc) {
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
    const totalInjValueUSD = times(injPrice, usdc.amount);
    pair.tvl = new BigNumber(totalInjValueUSD)
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
