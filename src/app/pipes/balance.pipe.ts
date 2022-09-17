import {Pipe, PipeTransform} from '@angular/core';
import {PoolResponse} from '../services/api/terraswap_pair/pool_response';
import {balance_transform} from '../services/calc/balance_calc';
import {ConfigService} from "../services/config.service";

@Pipe({
  name: 'balance'
})
export class BalancePipe implements PipeTransform {

  constructor(
    private config: ConfigService
  ) {
  }

  transform(value: any, poolResponse: PoolResponse, poolResponseB?: PoolResponse): string {
    return balance_transform(this.config.STABLE_COIN_DENOMS, value, poolResponse, poolResponseB);
  }

}
