import { Injectable } from '@angular/core';
import { CONFIG } from '../consts/config';
import { Denom } from '../consts/denom';
import { div, gt } from '../libs/math';
import { LendingBankService } from './api/lending-bank.service';
import { AssetInfoBaseFor_String } from './api/lending_bank/execute_msg';
import { TokenService } from './api/token.service';
import { InfoService, TokenInfo } from './info.service';
import { TerrajsService } from './terrajs.service';

export interface LendingPool {
  name: string;
  baseAssetInfo: AssetInfoBaseFor_String;
  baseTokenContract: string;
  ibTokenContract: string;
  baseSymbol: string;
  ibTokenSymbol: string;
  baseDecimals: number;
  ibTokenDecimals: number;
  baseUnit: number;
  ibTokenUnit: number;
  score: number;
  disabled: boolean;
  poolAprTotal: number;
  totalBorrow: string;
  totalSupply: string;
  utilization: number;
}

@Injectable({
  providedIn: 'root'
})
export class LeverageService {
  tokenInfos: Record<string, TokenInfo> = {}; // TODO: share this with info service
  lendingPools: LendingPool[] = [];

  constructor(
    private terrajs: TerrajsService,
    private infoService: InfoService,
    private lendingBankService: LendingBankService,
    private tokenService: TokenService,
  ) {}

  async initialize() {
    await this.refreshLendingPools();
    await this.refreshBalances();
  }

  async refreshLendingPools() {
    const pools: LendingPool[] = [];

    const marketsResponse = await this.lendingBankService.queryMarkets();
    const markets = marketsResponse?.markets_list ?? [];

    const tokens = new Set<string>();

    for (const marketInfo of markets) {
      const asset = marketInfo.asset_info;
      const ibToken = marketInfo.ib_token_address;

      if ('cw20' in asset && !this.tokenInfos[asset.cw20]) {
        tokens.add(asset.cw20);
      }

      if (!this.tokenInfos[ibToken]) {
        tokens.add(ibToken);
      }
    }

    const queryTokenInfoTasks = [...tokens].map(async (token) => {
      const tokenInfo = await this.tokenService.info(token);

      this.tokenInfos[token] = {
        name: tokenInfo.name,
        symbol: tokenInfo.symbol,
        decimals: tokenInfo.decimals,
        unit: 10 ** tokenInfo.decimals,
        totalSupply: tokenInfo.total_supply,
      };
    });

    await Promise.all(queryTokenInfoTasks);

    const queryMarketTasks = markets.map(async (marketInfo) => {
      const asset = marketInfo.asset_info;
      const ibTokenContract = marketInfo.ib_token_address;

      const market = await this.lendingBankService.queryMarket(asset);
      const [totalSupply, totalBorrow] = await Promise.all([
        this.lendingBankService.queryUnderlyingLiquidity(ibTokenContract, this.tokenInfos[ibTokenContract].totalSupply),
        this.lendingBankService.queryUnderlyingDebt(asset, market.debt_total_scaled)
      ]);

      const utilization = gt(totalSupply, 0) ? +div(totalBorrow, totalSupply) : 0;

      const baseTokenContract = 'cw20' in asset ? asset.cw20 : asset.native;
      const baseSymbol = 'cw20' in asset ? this.tokenInfos[asset.cw20].symbol : Denom.display[asset.native];
      const baseDecimals = 'cw20' in asset ? this.tokenInfos[asset.cw20].decimals : CONFIG.DIGIT;
      const baseUnit = 'cw20' in asset ? this.tokenInfos[asset.cw20].unit : CONFIG.UNIT;

      const ibTokenSymbol = this.tokenInfos[ibTokenContract].symbol;
      const ibTokenDecimals = this.tokenInfos[ibTokenContract].decimals;
      const ibTokenUnit = this.tokenInfos[ibTokenContract].unit;

      pools.push({
        name: baseSymbol,
        baseAssetInfo: asset,
        baseTokenContract,
        ibTokenContract,
        baseSymbol,
        ibTokenSymbol,
        baseDecimals,
        ibTokenDecimals,
        baseUnit,
        ibTokenUnit,
        score: 100,
        disabled: !market.active,
        poolAprTotal: +market.liquidity_rate,
        totalSupply,
        totalBorrow,
        utilization,
      });
    });

    await Promise.all(queryMarketTasks);

    this.lendingPools = pools;
  }

  async refreshBalances() {
    if (!this.terrajs.connected) {
      return;
    }

    await Promise.all([
      this.infoService.refreshNativeTokens(),
      ...Object.keys(this.tokenInfos).map(token => this.infoService.refreshTokenBalance(token)),
    ]);
  }
}
