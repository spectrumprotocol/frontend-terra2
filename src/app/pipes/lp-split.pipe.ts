import {Pipe, PipeTransform} from '@angular/core';
import BigNumber from 'bignumber.js';
import {CONFIG} from '../consts/config';
import {AssetInfo, PoolResponse} from '../services/api/terraswap_pair/pool_response';
import {UnitPipe} from './unit.pipe';
import { InfoService } from '../services/info.service';

interface LpSplitData {
  baseSymbol: string;
  denomSymbol: string;
  baseDecimals: number;
  baseUnit: number;
  baseAssetInfo: AssetInfo;
  denomDecimals: number;
  denomUnit: number;
  denomAssetInfo: AssetInfo;
}

@Pipe({
  name: 'lpSplit'
})
export class LpSplitPipe implements PipeTransform {

  constructor(
    private unitPipe: UnitPipe,
    private info: InfoService,
  ) {
  }

  transform(lp: number, poolResponse: PoolResponse, data: LpSplitData, digitsInfo?: string): string {
    if (typeof lp !== 'number' || !poolResponse) {
      return undefined;
    }
    const fullLp = new BigNumber(lp).times(CONFIG.UNIT);
    const amount1 = fullLp
      .times(poolResponse.assets[0].amount)
      .div(poolResponse.total_share)
      .toString();
    const amount2 = fullLp
      .times(poolResponse.assets[1].amount)
      .div(poolResponse.total_share)
      .toString();
    const asset0Token = poolResponse.assets[0].info.token?.['contract_addr'] || poolResponse.assets[0].info.native_token?.['denom'];
    const baseToken = data.baseAssetInfo.token?.['contract_addr'] || data.baseAssetInfo.native_token?.['denom'];
    if (asset0Token === baseToken) {
      return `${this.unitPipe.transform(amount1, data.baseDecimals, digitsInfo)} ${data.baseSymbol} + ${this.unitPipe.transform(amount2, data.denomDecimals, digitsInfo)} ${data.denomSymbol}`;
    } else {
      return `${this.unitPipe.transform(amount2, data.baseDecimals, digitsInfo)} ${data.baseSymbol} + ${this.unitPipe.transform(amount1, data.denomDecimals, digitsInfo)} ${data.denomSymbol}`;
    }
  }

}
