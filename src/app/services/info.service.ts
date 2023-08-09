import { Inject, Injectable } from '@angular/core';
import { BLOCK_TIME, TerrajsService } from './terrajs.service';
import { TokenService } from './api/token.service';
import { BankService } from './api/bank.service';
import { PoolResponse } from './api/terraswap_pair/pool_response';
import { div, plus } from '../libs/math';
import {CONFIG, INJECTIVE_TESTNET_CHAINID, getCurrentChainBrand, CHAIN_ID_ENUM, NEUTRON_MAINNET_CHAINID} from '../consts/config';
import {
  defaultFarmConfig,
  FARM_INFO_SERVICE,
  FarmInfoService,
  PairStat,
  PoolAPR,
  PoolInfo,
  RewardInfoResponseItem,
  FarmConfig
} from './farm_info/farm-info.service';
import { fromEntries } from '../libs/core';
import { PairInfo } from './api/astroport_pair/pair_info';
import { Vault } from '../pages/vault/vault.component';
import { HttpClient } from '@angular/common/http';
import { memoize } from 'utils-decorators';
import { ATOM_NEUTRON_MAINNET, Denom, NATIVE_TOKEN_LIST } from '../consts/denom';
import { Apollo, gql } from 'apollo-angular';
import { BalanceResponse } from './api/gov/balance_response';
import { StateInfo } from './api/gov/state_info';
import { QueryBundler } from './querier-bundler';
import { WasmService } from './api/wasm.service';
import { ConfigService } from './config.service';
import { fromBase64 } from '../libs/base64';
import { lp_balance_transform } from './calc/balance_calc';
import { getChainInfo } from './connect-options/chain-info';
import { NumberValueAccessor } from '@angular/forms';
import BigNumber from 'bignumber.js';

export interface Stat {
  pairs: Record<string, PairStat>;
  vaultFee: number;
  tvl: string;
  govStaked: string;
  govTvl: string;
  govApr: number;
  govPoolCount: number;
}


export type PortfolioItem = {
  bond_amount_ust: number;
};

export type Portfolio = {
  farms: Map<string, PortfolioItem>;
};

export interface GovPoolDetail {
  days: number;
  balance: string;
  apr: number;
  userBalance: string;
  userAUst: string;
  userProfit: string;
  austApr: number;
  userAvailableBalance: string;
  unlockAt: Date | null;
  moveOptions: { days: number; userBalance: string; unlockAt: Date | null }[];
}

export type TokenInfo = {
  name: string;
  symbol: string;
  decimals: number;
  unit: number;
};

export type CompoundStat = {
  id: string,
  txHash: string,
  txTimestamp: string,
};

export type AstroportPools = {
  pools: Array<AstroportPool>
};

export type AstroportPool = {
  lpAddress: string;
  poolAddress: string;
  rewardTokenSymbol: string;
  tradingFees: AstroRewards;
  astroRewards: AstroRewards;
  protocolRewards: AstroRewards;
  totalRewards: AstroRewards;
};

export type AstroRewards = {
  apy: number;
  apr: number;
  day: number;
};

const HEIGHT_PER_YEAR = 365 * 24 * 60 * 60 * 1000 / BLOCK_TIME;
const ASTROPORT_PRICE_GQL = gql`
      query Token($tokenAddress: String!, $chainId: String!) {
        token(tokenAddress: $tokenAddress, chainId: $chainId) {
          priceUsd
        }
      }`;
const ASTROPORT_POOLS_GQL = gql`
        query Pools($chains: [String]!, $limit: Int, $sortField: PoolSortFields) {
          pools(chains: $chains, limit: $limit, sortField: $sortField) {
            lpAddress
            poolAddress
            rewardTokenSymbol
            tradingFee
            poolLiquidity
            dayVolumeUsd
            tradingFees {
              apy
              apr
              day
            }
            astroRewards {
              apy
              apr
              day
            }
            protocolRewards {
              apy
              apr
              day
            }
            totalRewards {
              apy
              apr
              day
            }
            prices {
              token1Address
              token1PriceUsd
              token2Address
              token2PriceUsd
            }
            poolType
            rewardProxyAddress
          }
        }`;


export const isNativeToken = (input: string) => {
  if (
    (input.startsWith('terra') && input.length === 64) ||
    (input.startsWith('inj') && input.length === 42) ||
    (input.startsWith('kujira') && input.length === 65) ||
    (input.startsWith('neutron') && input.length === 66)
  ) {
    return false;
  } else {
    return true;
  }
};

@Injectable({
  providedIn: 'root'
})
export class InfoService {

  userSpecAmount: string; // TODO remove these and use tokenBalances?
  userSpecLpAmount: string; // TODO remove these and use lpTokenBalances?
  specPoolInfo: PoolResponse;
  specPrice: string;
  poolInfos: Record<string, PoolInfo>;
  pairInfos: Record<string, PairInfo> = {};
  tokenInfos: Record<string, TokenInfo> = {};
  ampStablePairs: Record<string, string> = {};
  stat: Stat;
  circulation: string;
  marketCap: number;
  rewardInfos: Record<string, RewardInfoResponseItem & { farm: string, farmContract: string }> = {};
  tokenBalances: Record<string, string> = {};
  lpTokenBalances: Record<string, string> = {};
  poolResponses: Record<string, PoolResponse> = {};
  govBalanceResponse: BalanceResponse;
  govStateInfo: StateInfo;
  poolDetails: GovPoolDetail[] = [];
  myTvl = 0;
  allVaults: Vault[] = [];
  portfolio: Portfolio;
  astroportPoolsData: AstroportPools;
  ulunaUSDPrice: number; // to get testnet uluna/usd price
  injUSDPrice: number;
  ntrnUSDPrice: number;
  atomUSDPrice: number;
  compoundStat: Record<string, CompoundStat> = {};

  DISABLED_VAULTS: Set<string> = new Set([]);
  private loadedChainId: string;

  constructor(
    private bankService: BankService,
    @Inject(FARM_INFO_SERVICE) public farmInfos: FarmInfoService[],
    public terrajs: TerrajsService,
    private token: TokenService,
    private httpClient: HttpClient,
    private apollo: Apollo,
    private wasm: WasmService,
    private config: ConfigService
  ) {
    try {
      const infoSchemaVersion = localStorage.getItem('infoSchemaVersion');
      const chainIdData = localStorage.getItem('chainIdData');
      if (infoSchemaVersion && +infoSchemaVersion >= 1 && chainIdData === this.terrajs.settings.chainID) {
        const poolJson = localStorage.getItem('poolInfos');
        if (poolJson) {
          this.poolInfos = JSON.parse(poolJson);
        }
        const pairJson = localStorage.getItem('pairInfos');
        if (pairJson) {
          this.pairInfos = JSON.parse(pairJson);
        }
        const statJson = localStorage.getItem('stat');
        if (statJson) {
          this.stat = JSON.parse(statJson);
        }
        const poolResponseJson = localStorage.getItem('poolResponses');
        if (poolResponseJson) {
          this.poolResponses = JSON.parse(poolResponseJson);
        }
        if (this.terrajs.isConnected) {
          const rewardInfoJson = localStorage.getItem('rewardInfos');
          if (rewardInfoJson) {
            this.rewardInfos = JSON.parse(rewardInfoJson);
          }
        }
        const tokenInfoJson = localStorage.getItem('tokenInfos');
        if (tokenInfoJson) {
          this.tokenInfos = JSON.parse(tokenInfoJson);
        }
        const ampStablePairsJson = localStorage.getItem('ampStablePairs');
        if (ampStablePairsJson) {
          this.ampStablePairs = JSON.parse(ampStablePairsJson);
        }
        const compoundStatJson = localStorage.getItem('compoundStat');
        if (compoundStatJson) {
          this.compoundStat = JSON.parse(compoundStatJson);
        }
      } else {
        console.log('localStorage clearing triggered.');
        localStorage.removeItem('poolInfos');
        localStorage.removeItem('pairInfos');
        localStorage.removeItem('stat');
        localStorage.removeItem('poolResponses');
        localStorage.removeItem('rewardInfos');
        localStorage.removeItem('tokenInfos');
        localStorage.removeItem('ampStablePairs');
        localStorage.removeItem('compoundStat');
      }
    } catch (e) {
    }
  }

  get SPEC_KEY() {
    return `Astroport|${this.terrajs.settings.specToken}|${this.terrajs.settings.axlUsdcToken}`;
  }

  get USDC_LUNA_KEY() {
    return `Astroport|${this.terrajs.settings.axlUsdcToken}|${Denom.LUNA}`;
  }

  get INJ_USDC_KEY() {
    return `Astroport|${Denom.INJ}|${this.terrajs.settings.usdcToken}`;
  }

  get NTRN_USDC_KEY() {
    return `Astroport|${Denom.NTRN}|${this.terrajs.settings.usdcToken}`;
  }

  get ATOM_USDC_KEY() {
    return `Astroport|${ATOM_NEUTRON_MAINNET}|${this.terrajs.settings.usdcToken}`;
  }

  shouldEnableFarmInfo(farmInfo: FarmInfoService) {
    return farmInfo.availableNetworks.has(this.terrajs.settings.chainID as CHAIN_ID_ENUM);
    // && (farmInfo.farmContract.length > 0 && farmInfo.baseTokenContract.length > 0 && farmInfo.denomTokenContract.length > 0); // for check farm setup validity
  }

  async refreshBalance(opt: { spec?: boolean; native_token?: boolean; lp?: boolean }) {
    if (!this.terrajs.isConnected) {
      return;
    }
    const tasks: Promise<any>[] = [];
    // if (opt.spec) {
    //   const task = this.token.balance(this.terrajs.settings.specToken)
    //     .then(it => this.userSpecAmount = div(it.balance, CONFIG.UNIT));
    //   tasks.push(task);
    // }
    // if (opt.lp) {
    //   const task = this.token.balance(this.terrajs.settings.specLpToken)
    //     .then(it => this.userSpecLpAmount = div(it.balance, CONFIG.UNIT));
    //   tasks.push(task);
    // }
    if (opt.native_token) {
      tasks.push(this.refreshNativeTokens());
    }
    await Promise.all(tasks);
  }

  @memoize(1000)
  async refreshNativeTokens() {
    const it = await this.bankService.balances();
    for (const coin of it.toArray()) {
      this.tokenBalances[coin.denom] = coin.amount.toString() ?? '0';
    }

    for (const nativeToken of NATIVE_TOKEN_LIST){
      if (!this.tokenBalances[nativeToken] || !it.toArray().find(coin => coin.denom === nativeToken)) {
        this.tokenBalances[nativeToken] = '0';
      }
    }


    // if (this.terrajs.isMainnet) {
    //   if (!this.tokenBalances[this.terrajs.settings.axlUsdcToken] || !it.toArray().find(coin => coin.denom === this.terrajs.settings.axlUsdcToken)) {
    //     this.tokenBalances[this.terrajs.settings.axlUsdcToken] = '0';
    //   }
    //   if (!this.tokenBalances[this.terrajs.settings.axlUsdtToken] || !it.toArray().find(coin => coin.denom === this.terrajs.settings.axlUsdtToken)) {
    //     this.tokenBalances[this.terrajs.settings.axlUsdtToken] = '0';
    //   }
    // }
  }

  @memoize(1000)
  async refreshSPECPool() {
    // TODO until SPEC is live
    // this.specPoolInfo = await this.astroport.query(this.terrajs.settings.specPool, {pool: {}});
    // this.specPrice = div(this.specPoolInfo.assets[1].amount, this.specPoolInfo.assets[0].amount);
  }

  async ensurePoolInfoLoaded() {
    if (this.poolInfos && this.loadedChainId === this.terrajs.settings.chainID) {
      return this.poolInfos;
    }
    await this.refreshPoolInfos();
    this.loadedChainId = this.terrajs.settings.chainID;
  }

  getRewardTokenContracts(poolAPRs: PoolAPR[]): string[] {
    return poolAPRs.map(poolAPR => poolAPR.rewardContract);
  }

  @memoize(1000)
  async refreshPoolInfos() {
    const poolInfos: Record<string, PoolInfo> = {};
    for (const farmInfo of this.farmInfos) {
      if (!this.shouldEnableFarmInfo(farmInfo)) {
        continue;
      }
      const key = farmInfo.farmType === 'LP' ? `${farmInfo.dex}|${farmInfo.baseTokenContract}|${farmInfo.denomTokenContract}` : `${farmInfo.baseTokenContract}`;
      let farmConfig: FarmConfig;
      if (farmInfo.getConfig) {
        farmConfig = await farmInfo.getConfig();
      } else {
        farmConfig = defaultFarmConfig;
      }
      poolInfos[key] = {
        key,
        farm: farmInfo.farm,
        farmContract: farmInfo.farmContract,
        baseTokenContract: farmInfo.baseTokenContract,
        denomTokenContract: farmInfo.denomTokenContract,
        rewardTokenContracts: this.poolAprsToRewardTokenContracts(farmInfo.poolAprs),
        auditWarning: farmInfo.auditWarning,
        farmType: farmInfo.farmType ?? 'LP',
        score: (farmInfo.highlight ? 1000000 : 0),
        dex: farmInfo.dex,
        highlight: farmInfo.highlight,
        notUseAstroportGqlApr: farmInfo.notUseAstroportGqlApr,
        farmConfig,
        compoundProxyContract: farmInfo.compoundProxyContract,
        poolType: farmInfo.poolType,
        disabled: farmInfo.disabled ? farmInfo.disabled : false,
      };
    }

    localStorage.setItem('poolInfos', JSON.stringify(poolInfos));
    this.poolInfos = poolInfos;
  }

  poolAprsToRewardTokenContracts(poolAprs: PoolAPR[]) {
    return poolAprs.map(poolApr => poolApr.rewardContract);
  }

  async ensurePairInfos() {
    await this.ensurePoolInfoLoaded();
    const bundler = new QueryBundler(this.wasm);
    const tasks: Promise<any>[] = [];
    for (const key of Object.keys(this.poolInfos)) {
      if (this.pairInfos[key]) {
        continue;
      }

      let pairInfoKey: string;
      const baseTokenContract = this.poolInfos[key].baseTokenContract;
      const denomTokenContract = this.poolInfos[key].denomTokenContract;
      if (this.poolInfos[key].farmType === 'LP') {
        pairInfoKey = key;
      } else {
        continue;
      }
      const tokenA = isNativeToken(baseTokenContract) ?
        { native_token: { denom: baseTokenContract } } : { token: { contract_addr: baseTokenContract } };
      const tokenB = isNativeToken(denomTokenContract) ?
        { native_token: { denom: denomTokenContract } } : { token: { contract_addr: denomTokenContract } };

      let factory: string;
      if (this.poolInfos[key].dex === 'Astroport') {
        factory = this.terrajs.settings.astroportFactory;
      } else {
        continue;
      }

      const task = bundler.query(factory, {
        pair: {
          asset_infos: [
            tokenA, tokenB
          ]
        }
      }).then(value => this.pairInfos[pairInfoKey] = value);
      tasks.push(task);
    }

    if (tasks.length) {
      bundler.flush();
      await Promise.all(tasks);
      localStorage.setItem('pairInfos', JSON.stringify(this.pairInfos));
    }
  }

  async ensureAmpStablePairs() {
    const pairInfoKeys = Object.keys(this.pairInfos);
    const tasks: Promise<any>[] = [];
    const bundler = new QueryBundler(this.wasm);
    for (const pairInfoKey of pairInfoKeys) {
      const pairInfo = this.pairInfos[pairInfoKey];
      if (pairInfo.pair_type?.['stable']) {
        const task = bundler.query(pairInfo.contract_addr, {
          config: {}
        }).then(value => {
          try {
            const params = fromBase64<any>(value.params);
            this.ampStablePairs[pairInfoKey] = params.amp;
          } catch (e) {
            console.error('ensureAmpStablePairs', pairInfo, e);
          }
        });
        tasks.push(task);
      }
    }
    if (tasks.length) {
      bundler.flush();
      await Promise.all(tasks);
      localStorage.setItem('ampStablePairs', JSON.stringify(this.ampStablePairs));
    }
  }

  async ensureTokenInfos() {
    await this.ensurePoolInfoLoaded();
    const cw20Tokens = new Set<string>();
    const bundler = new QueryBundler(this.wasm);
    const tasks: Promise<any>[] = [];
    for (const key of Object.keys(this.poolInfos)) {
      const baseTokenContract = this.poolInfos[key].baseTokenContract;
      const denomTokenContract = this.poolInfos[key].denomTokenContract;
      const rewardTokenContracts = this.poolInfos[key].rewardTokenContracts;
      if (baseTokenContract && !isNativeToken(baseTokenContract)) {
        cw20Tokens.add(baseTokenContract);
      }
      if (denomTokenContract && !isNativeToken(denomTokenContract)) {
        cw20Tokens.add(denomTokenContract);
      }
      rewardTokenContracts.forEach(rewardTokenContract => {
        if (!isNativeToken(rewardTokenContract)) {
          cw20Tokens.add(rewardTokenContract);
        }
      });
    }
    for (const key of cw20Tokens) {
      if (this.tokenInfos[key]) {
        continue;
      }
      const task = bundler.query(key, { token_info: {} })
        .then(it => this.tokenInfos[key] = {
          name: it.name,
          symbol: this.cleanSymbol(it.symbol),
          decimals: it.decimals,
          unit: 10 ** it.decimals,
        });
      tasks.push(task);
    }
    if (tasks.length) {
      bundler.flush();
      await Promise.all(tasks);
      localStorage.setItem('tokenInfos', JSON.stringify(this.tokenInfos));
    }
  }

  async refreshStat() {
    const stat: Stat = {
      pairs: {},
      vaultFee: 0,
      tvl: '0',
      govStaked: '0',
      govTvl: '0',
      govApr: 0,
      govPoolCount: 1,
    };
    // const vaultsTask = this.gov.vaults();
    await this.refreshPoolInfos();
    await Promise.all([
      this.refreshPoolResponses(),
      this.ensureAstroportData().catch(e => console.error(e)),
    ]);

    const vaults = null; // await vaultsTask; TODO
    const tasks = this.farmInfos.filter(farmInfo => this.shouldEnableFarmInfo(farmInfo)).map(async farmInfo => {
      const farmPoolInfos = fromEntries(Object.entries(this.poolInfos)
        .filter(it => it[1].farmContract === farmInfo.farmContract));
      try {
        if (farmInfo.contractOnNetwork !== this.terrajs.networkName) {
          farmInfo.refreshContractOnNetwork();
        }
        const chainTokenUSDPrice = getCurrentChainBrand() === 'Terra' ? this.ulunaUSDPrice : this.injUSDPrice;
        const pairStats = await farmInfo.queryPairStats(farmPoolInfos, this.poolResponses, vaults, this.pairInfos, this.tokenInfos, chainTokenUSDPrice, this.ampStablePairs);
        const keys = Object.keys(pairStats);
        for (const key of keys) {
          const farmConfig = this.poolInfos[key]?.farmConfig || defaultFarmConfig;
          const totalFee = +farmConfig.controller_fee + +farmConfig.platform_fee + +farmConfig.community_fee;
          if (farmInfo.dex === 'Astroport' && farmInfo.farmType === 'LP') {
            const found = this.astroportPoolsData.pools.find(pool => pool?.poolAddress === this.pairInfos[key]?.contract_addr);
            if (farmInfo.notUseAstroportGqlApr) {
              const pair = pairStats[key];
              const poolAprTotal = this.getPoolAprTotal(pair);
              const proxyAndAstroApy = ((poolAprTotal * (1 - totalFee)) / CONFIG.COMPOUND_TIMES_PER_YEAR + 1) ** CONFIG.COMPOUND_TIMES_PER_YEAR - 1;
              const foundTradingFeeApy = +found?.tradingFees?.apy || 0;
              pair.tradeApy = foundTradingFeeApy;
              pair.poolApy = proxyAndAstroApy > 0 ? (proxyAndAstroApy + 1) * (foundTradingFeeApy + 1) - 1 : 0;
              pair.dpr = (this.getPoolAprTotal(pair) * (1 - totalFee)) / 365;
            } else {
              // to prevent set pairStat undefined in case of no data available from Astroport api
              if (found) {
                const pair = pairStats[key];
                const foundTokenSymbol = found.rewardTokenSymbol;
                const poolAprAstro = pair.poolAprs.find(poolAPR => poolAPR.rewardContract === this.terrajs.settings.astroToken);
                if (poolAprAstro && found?.astroRewards?.apr) {
                  poolAprAstro.apr = +found.astroRewards.apr;
                }
                if (found.protocolRewards.apr) {
                  if (foundTokenSymbol) {
                    this.findPoolAPRBySymbol(pair, foundTokenSymbol).apr = +found.protocolRewards.apr;
                  } else {
                    const rewardTokenContract = this.poolInfos[key].rewardTokenContracts.find(it => it !== this.terrajs.settings.astroToken);
                    if (rewardTokenContract) {
                      const symbol = this.tokenInfos[rewardTokenContract].symbol;
                      this.findPoolAPRBySymbol(pair, symbol).apr = +found.protocolRewards.apr;
                    }
                  }
                }
                const poolAprTotal = this.getPoolAprTotal(pair);
                const proxyAndAstroApy = ((poolAprTotal * (1 - totalFee)) / CONFIG.COMPOUND_TIMES_PER_YEAR + 1) ** CONFIG.COMPOUND_TIMES_PER_YEAR - 1;
                pair.poolApy = proxyAndAstroApy > 0 ? (proxyAndAstroApy + 1) * (+found.tradingFees.apy + 1) - 1 : 0;
                pair.tradeApy = +found?.tradingFees?.apy || 0;
                pair.vaultFee = +pair.tvl * poolAprTotal * totalFee;
                pair.dpr = (poolAprTotal * (1 - totalFee)) / 365;
              }
            }
          }
          if (farmInfo.dex === 'Terraswap' && farmInfo.farmType === 'LP') {
            // supported only in backend
          }
        }

        Object.assign(stat.pairs, pairStats);
      } catch (e) {
        console.error('queryPairStats error >> ', e);
        if (!this.stat) {
          throw e;
        }
        for (const key of Object.keys(this.stat.pairs)) {
          if (!stat.pairs[key]) {
            stat.pairs[key] = this.stat.pairs[key];
          }
        }
      }
    });
    await Promise.all([
      this.refreshGovStat(stat),
      this.refreshMarketCap(),
      ...tasks
    ]);

    // TODO once gov is live
    // const config = await this.gov.config();
    // const totalWeight = Object.keys(stat.pairs)
    //   .map(key => stat.pairs[key].multiplier)
    //   .reduce((a, b) => a + b, 0);
    // const height = await this.terrajs.getHeight();
    // const specPerHeight = config.mint_end > height ? config.mint_per_block : '0';
    // const ustPerYear = +specPerHeight * HEIGHT_PER_YEAR * +this.specPrice
    //   * (1 - (+config.burnvault_ratio || 0))
    //   * (1 - +config.warchest_ratio);
    for (const pair of Object.values(stat.pairs)) {
      stat.vaultFee += pair.vaultFee;
      stat.tvl = plus(stat.tvl, pair.tvl);
    }
    stat.govApr = 0; // stat.vaultFee / stat.govPoolCount / +stat.govTvl;

    // TODO USDC in gov
    // stat.tvl = plus(stat.tvl, austValue);

    this.stat = stat;
    localStorage.setItem('stat', JSON.stringify(stat));
  }

  async refreshRewardInfos() {
    const rewardInfos: InfoService['rewardInfos'] = {};
    const bundler = new QueryBundler(this.wasm, 8);
    const tasks: Promise<any>[] = [];
    const BUNDLER_BLACKLIST = new Set([]);
    const processRewards = (farmInfo: FarmInfoService, reward: RewardInfoResponseItem) => {
      if (farmInfo.farmType === 'LP') {
        rewardInfos[`${farmInfo.dex}|${farmInfo.baseTokenContract}|${farmInfo.denomTokenContract}`] = {
          ...reward,
          farm: farmInfo.farm,
          farmContract: farmInfo.farmContract
        };
      }
    };
    for (const farmInfo of this.farmInfos) {
      if (!this.shouldEnableFarmInfo(farmInfo)) {
        continue;
      }
      if (farmInfo.contractOnNetwork !== this.terrajs.networkName) {
        farmInfo.refreshContractOnNetwork();
      }
      if (!farmInfo.farmContract) {
        continue;
      }
      let task: Promise<void>;
      if (BUNDLER_BLACKLIST.has(farmInfo.farmContract)) {
        task = farmInfo.queryReward().then((reward) => processRewards(farmInfo, reward));
      } else {
        task = bundler.query(farmInfo.farmContract, {
          reward_info: {
            staker_addr: this.terrajs.address,
          }
        }).then(({ reward_info: reward }: { reward_info: RewardInfoResponseItem }) => processRewards(farmInfo, reward));
      }
      tasks.push(task);
    }

    bundler.flush();
    await Promise.all(tasks);
    this.rewardInfos = rewardInfos;
    localStorage.setItem('rewardInfos', JSON.stringify(rewardInfos));
  }

  async refreshTokenBalance(assetToken: string) {
    if (isNativeToken(assetToken)) {
      await this.refreshNativeTokens();
    } else {
      this.tokenBalances[assetToken] = (await this.token.balance(assetToken)).balance;
    }
  }

  async refreshPoolResponse(key: string) {
    const pairInfo = this.pairInfos[key];
    const [dex, base, denom] = key.split('|');
    const bundler = new QueryBundler(this.wasm);
    const tasks: Promise<any>[] = [];

    const balanceQuery = {
      balance: {
        address: this.terrajs.address
      }
    };
    if (!isNativeToken(base)) {
      tasks.push(bundler.query(base, balanceQuery)
        .then(it => this.tokenBalances[base] = it.balance));
    } else {
      tasks.push(this.refreshNativeTokens());
    }
    if (!isNativeToken(denom)) {
      tasks.push(bundler.query(denom, balanceQuery)
        .then(it => this.tokenBalances[denom] = it.balance));
    } else {
      tasks.push(this.refreshNativeTokens());
    }
    tasks.push(bundler.query(pairInfo.contract_addr, { pool: {} })
      .then(it => this.poolResponses[key] = it));

    tasks.push(bundler.query(pairInfo.liquidity_token, balanceQuery)
      .then(it => this.lpTokenBalances[pairInfo.liquidity_token] = it.balance));

    bundler.flush();
    await Promise.all(tasks);
  }

  @memoize(1000)
  async refreshPoolResponses() {
    await this.ensurePairInfos();
    await this.ensureAmpStablePairs();
    const poolResponses: Record<string, PoolResponse> = {};
    const bundler = new QueryBundler(this.wasm);
    const poolTasks: Promise<any>[] = [];
    for (const key of Object.keys(this.poolInfos)) {
      let poolResponseKey: string;
      const dex = this.poolInfos[key].dex;
      if (this.poolInfos[key].farmType === 'LP') {
        poolResponseKey = key;
      }
      const pairInfo = this.pairInfos[poolResponseKey];

      poolTasks.push(bundler.query(pairInfo.contract_addr, { pool: {} })
        .then(it => poolResponses[poolResponseKey] = it));
    }
    if (getCurrentChainBrand() !== 'Terra' && this.loadedChainId === INJECTIVE_TESTNET_CHAINID) {
      const injUsdcPoolTestnet = 'inj1akax66g89c8sp29f2reyxs4rwv0ljr0ljsnmy5';
      const usdcTestnet = 'factory/inj17vytdwqczqz72j65saukplrktd4gyfme5agf6c/usdc';
      poolTasks.push(bundler.query(injUsdcPoolTestnet, { pool: {} })
        .then(pool => {
          poolResponses[`Astroport|${Denom.INJ}|${usdcTestnet}`] = pool;
          const axlUsdcAmount = pool.assets.find(asset => asset?.info?.native_token?.['denom'] === usdcTestnet)?.amount || 0;
          const injAmount = pool.assets.find(asset => asset?.info?.native_token?.['denom'] === Denom.INJ)?.amount || 0;
          this.injUSDPrice = +div(axlUsdcAmount, injAmount);
        }));
    }

    bundler.flush();
    await Promise.all(poolTasks)
      .catch(error => console.error('refreshPoolResponses error: ', error));
    this.poolResponses = poolResponses;
    localStorage.setItem('poolResponses', JSON.stringify(poolResponses));
    if (this.terrajs.isMainnet) {
      const pool = this.poolResponses[this.USDC_LUNA_KEY];
      if (pool) {
        const axlUsdcAmount = pool.assets.find(asset => asset?.info?.native_token?.['denom'] === this.terrajs.settings.axlUsdcToken)?.amount || 0;
        const ulunaAmount = pool.assets.find(asset => asset?.info?.native_token?.['denom'] === Denom.LUNA)?.amount || 0;
        this.ulunaUSDPrice = +div(axlUsdcAmount, ulunaAmount);
      }
    }

    if (this.loadedChainId === NEUTRON_MAINNET_CHAINID){
      const pool = this.poolResponses[this.NTRN_USDC_KEY];
      if (pool) {
        const usdcAmount = pool.assets.find(asset => asset?.info?.native_token?.['denom'] === this.terrajs.settings.usdcToken)?.amount || 0;
        const ntrnAmount = pool.assets.find(asset => asset?.info?.native_token?.['denom'] === Denom.NTRN)?.amount || 0;
        this.ntrnUSDPrice = new BigNumber(usdcAmount).div(ntrnAmount).toNumber();
      }

      const ntrnAtomPool = 'neutron1e22zh5p8meddxjclevuhjmfj69jxfsa8uu3jvht72rv9d8lkhves6t8veq';
      poolTasks.push(bundler.query(ntrnAtomPool, { pool: {} })
      .then(pool2 => {
        poolResponses[`Astroport|${Denom.NTRN}|${ATOM_NEUTRON_MAINNET}`] = pool;
        const atomAmount = pool2.assets.find(asset => asset?.info?.native_token?.['denom'] === ATOM_NEUTRON_MAINNET)?.amount || 0;
        const ntrnAmount = pool2.assets.find(asset => asset?.info?.native_token?.['denom'] === Denom.NTRN)?.amount || 0;
        this.atomUSDPrice = new BigNumber(ntrnAmount).div(atomAmount).times(this.ntrnUSDPrice).toNumber();
      }));
    }

  }

  async refreshCirculation() {
    // TODO once SPEC is live
    // testnet_only doesn't have burnvault
    // if (this.terrajs.network?.name === 'testnet') {
    //   const task1 = this.token.query(this.terrajs.settings.specToken, {token_info: {}});
    //   const task2 = this.wallet.balance(this.terrajs.settings.wallet, this.terrajs.settings.platform);
    //   const taskResult = await Promise.all([task1, task2]);
    //   this.circulation = minus(taskResult[0].total_supply, taskResult[1].locked_amount);
    //   return;
    // } else {
    //   const bundler = new QueryBundler(this.wasm);
    //   const task1 = bundler.query(this.terrajs.settings.specToken, {token_info: {}});
    //   const task2 = bundler.query(this.terrajs.settings.wallet, {
    //     balance: {
    //       address: this.terrajs.settings.platform
    //     }
    //   });
    //   bundler.flush();
    //   const taskResult = await Promise.all([task1, task2]);
    //   this.circulation = minus(taskResult[0].total_supply, taskResult[1].locked_amount);
    // }
  }

  async refreshMarketCap() {
    await Promise.all([
      this.refreshCirculation(),
      this.refreshSPECPool(),
    ]);
    this.marketCap = +this.circulation / CONFIG.UNIT * +this.specPrice;
  }

  async updateMyTvl() {
    if (!this.terrajs.address) {
      this.rewardInfos = {};
    }
    let tvl = 0;
    const portfolio: Portfolio = {
      farms: new Map(),
    };

    for (const vault of this.allVaults) {
      const rewardInfo = this.rewardInfos[vault.poolInfo.key];
      if (!rewardInfo) {
        continue;
      }
      let bond_amount: number;
      if (vault.poolInfo.farmType === 'LP') {
        bond_amount = +lp_balance_transform(rewardInfo.bond_amount, this, this.config, vault.poolInfo.key);
      }
      bond_amount = bond_amount / CONFIG.UNIT || 0;
      if (!portfolio.farms.get(vault.poolInfo.farm)) {
        portfolio.farms.set(vault.poolInfo.farm, { bond_amount_ust: 0 });
      }
      portfolio.farms.get(vault.poolInfo.farm).bond_amount_ust += bond_amount;
      tvl += bond_amount;
    }
    this.myTvl = tvl;
    this.portfolio = portfolio;
  }

  async initializeVaultData(connected: boolean) {
    await this.retrieveCachedStat();
    if (this.config.contractOnNetwork !== this.terrajs.networkName) {
      this.config.refreshContractOnNetwork();
    }
    if (connected) {
      this.refreshRewardInfos().then(() => this.updateMyTvl());
    }

    this.updateVaults();
    await this.fetchGovPoolDetails();

    if (connected) {
      await this.updateMyTvl();
    }
  }

  async retrieveCachedStat(skipPoolResponses = false) {
    // try {
    //   const data = await this.httpClient.get<any>(this.terrajs.settings.specAPI + '/data?type=lpVault').toPromise();
    //   if (!data.stat || !data.pairInfos || !data.poolInfos || !data.tokenInfos || !data.poolResponses || !data.infoSchemaVersion || !data.ulunaUSDPrice || !data.ampStablePairs) {
    //     throw (data);
    //   }
    //   this.tokenInfos = data.tokenInfos;
    //   this.stat = data.stat;
    //   this.pairInfos = data.pairInfos;
    //   this.poolInfos = data.poolInfos;
    //   this.circulation = data.circulation;
    //   this.marketCap = data.marketCap;
    //   this.ulunaUSDPrice = data.ulunaUSDPrice;
    //   this.ampStablePairs = data.ampStablePairs;
    //   this.compoundStat = data.compoundStat;
    //   localStorage.setItem('tokenInfos', JSON.stringify(this.tokenInfos));
    //   localStorage.setItem('stat', JSON.stringify(this.stat));
    //   localStorage.setItem('pairInfos', JSON.stringify(this.pairInfos));
    //   localStorage.setItem('poolInfos', JSON.stringify(this.poolInfos));
    //   localStorage.setItem('infoSchemaVersion', JSON.stringify(data.infoSchemaVersion));
    //   localStorage.setItem('ampStablePairs', JSON.stringify(this.ampStablePairs));
    //   localStorage.setItem('compoundStat', JSON.stringify(this.compoundStat));
    //   if (!skipPoolResponses) {
    //     this.poolResponses = data.poolResponses;
    //     localStorage.setItem('poolResponses', JSON.stringify(this.poolResponses));
    //   }
    //   // no more fallback
    // } catch (ex) {
    //   // fallback if api die
    //   console.error('Error in retrieveCachedStat: fallback local info service data init');
    //   console.error(ex);
    await Promise.all([this.ensureTokenInfos(), this.refreshStat()]);
    localStorage.setItem('infoSchemaVersion', '1');
    // } finally {
    this.loadedChainId = this.terrajs.settings.chainID;
    localStorage.setItem('chainIdData', this.loadedChainId);
    // }
  }

  updateVaults() {
    if (this.loadedChainId !== this.terrajs.settings.chainID) {
      return;
    }
    this.allVaults = [];
    for (const key of Object.keys(this.poolInfos)) {
      if (!this.poolInfos[key]) {
        continue;
      }
      const baseTokenContract = this.poolInfos[key].baseTokenContract;
      const denomTokenContract = this.poolInfos[key].denomTokenContract;
      const rewardTokenContracts = this.poolInfos[key].rewardTokenContracts;
      const baseSymbol = isNativeToken(baseTokenContract) ? Denom.display[baseTokenContract] : this.tokenInfos[baseTokenContract]?.symbol;
      const denomSymbol = isNativeToken(denomTokenContract) ? Denom.display[denomTokenContract] : this.tokenInfos[denomTokenContract]?.symbol;
      const poolInfo = this.poolInfos[key];
      const shouldSetAprZero = poolInfo.disabled;

      const pairStat = this.stat?.pairs[key];
      const poolAprTotal = shouldSetAprZero ? 0 : this.getPoolAprTotal(pairStat);

      const disabled = poolInfo.disabled;
      let score: number;
      if (poolInfo.farm === 'Spectrum') {
        score = 2000000;
      } else if (disabled) {
        score = -1;
      } else {
        score = (poolInfo.highlight ? 1000000 : 0) + (pairStat?.multiplier || 0);
      }

      const vault: Vault = {
        baseSymbol,
        denomSymbol,
        baseDecimals: this.getDecimals(baseTokenContract),
        baseUnit: this.getUnits(baseTokenContract),
        denomDecimals: this.getDecimals(denomTokenContract),
        denomUnit: this.getUnits(denomTokenContract),
        baseAssetInfo: isNativeToken(baseTokenContract)
          ? { native_token: { denom: baseTokenContract } }
          : { token: { contract_addr: baseTokenContract } },
        denomAssetInfo: isNativeToken(denomTokenContract)
          ? { native_token: { denom: denomTokenContract } }
          : { token: { contract_addr: denomTokenContract } },
        lpToken: this.pairInfos[key]?.liquidity_token,
        pairStat,
        poolInfo,
        pairInfo: this.pairInfos[key],
        name: `${baseSymbol}-${denomSymbol} LP`,
        unitDisplay: `${baseSymbol}-${denomSymbol} ${poolInfo.dex} LP`,
        shortUnitDisplay: `LP`,
        score,
        disabled,
        poolAprTotal,
      };
      this.allVaults.push(vault);
    }
  }

  async fetchGovPoolDetails() {

  }

  getPoolAprTotal(pairStat: PairStat) {
    return pairStat?.poolAprs?.reduce((accumulator, poolAPR) => accumulator + poolAPR.apr, 0) || 0;
  }

  findPoolAPRBySymbol(pairStat: PairStat, symbol: string) {
    return pairStat.poolAprs.find(poolAPR => poolAPR.rewardSymbol === symbol);
  }

  getDecimals = (denom: string) => {
    const chainInfo = getChainInfo(CONFIG.CHAIN_ID);
    if (denom === chainInfo.stakeCurrency.coinMinimalDenom) {
      return chainInfo.stakeCurrency.coinDecimals;
    } else if (isNativeToken(denom)) {
      return CONFIG.DIGIT;
    } else if (!isNaN(this.tokenInfos[denom]?.decimals)) {
      return this.tokenInfos[denom]?.decimals;
    } else {
      return CONFIG.DIGIT;
    }
  }

  getUnits = (denom: string) => {
    return 10 ** this.getDecimals(denom);
  }

  private cleanSymbol(symbol: string) {
    return symbol;
  }

  private async refreshGovStat(stat: Stat) {
    // TODO until SPEC and GOV are live
    // const poolTask = this.refreshSPECPool();
    //
    // const state = await this.gov.query({state: {}});
    // stat.govStaked = state.total_staked;
    // stat.govPoolCount = state.pools.length;
    //
    // await poolTask;
    // stat.govTvl = times(stat.govStaked, this.specPrice);
    // stat.tvl = plus(stat.tvl, stat.govTvl);
  }

  @memoize(30000)
  async ensureAstroportData() {
    const apollo = this.apollo.use(this.terrajs.settings.astroport_gql);
    const poolsQuery = apollo.query<any>({
      variables: {
        chains: [this.terrajs.settings.chainID],
        limit: 500,
        sortField: 'TVL'
      },
      query: ASTROPORT_POOLS_GQL,
      errorPolicy: 'all'
    });
    const ulunaPriceQuery = apollo.query<any>({
      variables: {
        chainId: this.terrajs.settings.chainID,
        tokenAddress: Denom.INJ
      },
      query: ASTROPORT_PRICE_GQL,
      errorPolicy: 'all'
    });
    let tasks: Promise<any>[];
    if (this.terrajs.isMainnet) {
      tasks = [poolsQuery.toPromise()];
    } else {
      tasks = [poolsQuery.toPromise(), ulunaPriceQuery.toPromise()];
    }
    const [poolResponse, ulunaPriceResponse] = await Promise.all(tasks);
    this.astroportPoolsData = poolResponse.data;
    if (!this.terrajs.isMainnet) {
      this.ulunaUSDPrice = ulunaPriceResponse?.data?.token?.priceUsd || 0;
    }
  }
}
