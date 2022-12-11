import { Injectable } from '@angular/core';
import { TerrajsService } from '../terrajs.service';
import { Market } from './lending_bank/market';
import { MarketsListResponse } from './lending_bank/markets_list_response';
import { AssetInfoBaseFor_String, Uint128 } from './lending_bank/query_msg';
import { WasmService } from './wasm.service';

@Injectable({
  providedIn: 'root'
})
export class LendingBankService {
  constructor(
    private terrajs: TerrajsService,
    private wasm: WasmService,
  ) {}

  get contract() {
    return this.terrajs.settings.lendingBank;
  }

  queryMarkets(): Promise<MarketsListResponse> {
    return this.wasm.query(this.contract, { markets_list: {} });
  }

  queryMarket(asset: AssetInfoBaseFor_String): Promise<Market> {
    return this.wasm.query(this.contract, { market: { asset_info: asset } });
  }

  queryUnderlyingLiquidity(token: string, amount: Uint128): Promise<Uint128> {
    return this.wasm.query(this.contract, {
      underlying_liquidity_amount: {
        ib_token_address: token,
        amount_scaled: amount,
      },
    });
  }

  queryUnderlyingDebt(asset: AssetInfoBaseFor_String, amount: Uint128): Promise<Uint128> {
    return this.wasm.query(this.contract, {
      underlying_debt_amount: {
        asset_info: asset,
        amount_scaled: amount,
      },
    });
  }
}
