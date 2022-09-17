import {Pipe, PipeTransform} from '@angular/core';
import {InfoService} from '../services/info.service';
import {lp_balance_transform} from '../services/calc/balance_calc';
import {ConfigService} from "../services/config.service";

@Pipe({
  name: 'lpBalance'
})
export class LpBalancePipe implements PipeTransform {

  constructor() {
  }

  transform(lp: any, info: InfoService, config: ConfigService, key: string): string {
    return lp_balance_transform(lp, info, config, key);
  }
}
