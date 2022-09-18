import {Pipe, PipeTransform} from '@angular/core';
import BigNumber from 'bignumber.js';
import {CONFIG} from '../consts/config';
import {PoolResponse} from '../services/api/terraswap_pair/pool_response';
import {UnitPipe} from './unit.pipe';
import {Vault} from '../pages/vault/vault.component';

@Pipe({
  name: 'lpSplit'
})
export class LpSplitPipe implements PipeTransform {

  constructor(
    private unitPipe: UnitPipe,
  ) {
  }

  transform(lp: number, poolResponse: PoolResponse, vault: Vault, digitsInfo?: string): string {
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
    const baseToken = vault.baseAssetInfo?.['token']?.['contract_addr'] || vault.baseAssetInfo?.['native_token']?.['denom'];
    if (asset0Token === baseToken) {
      return `${this.unitPipe.transform(amount1, vault.baseDecimals, digitsInfo)} ${vault.baseSymbol} + ${this.unitPipe.transform(amount2, vault.denomDecimals, digitsInfo)} ${vault.denomSymbol}`;
    } else {
      return `${this.unitPipe.transform(amount2, vault.baseDecimals, digitsInfo)} ${vault.baseSymbol} + ${this.unitPipe.transform(amount1, vault.denomDecimals, digitsInfo)} ${vault.denomSymbol}`;
    }
  }

}
