import {Injectable} from '@angular/core';
import {TerrajsService} from './terrajs.service';
import {Denom} from '../consts/denom';


@Injectable({
  providedIn: 'root'
})
export class ConfigService {

  STABLE_COIN_DENOMS: Set<string>;
  NATIVE_TOKEN_DENOMS: Set<string>;
  NATIVE_TOKEN_SYMBOLS: Set<string>;
  contractOnNetwork: string;

  constructor(
    public terrajs: TerrajsService,
  ) {
    this.refreshContractOnNetwork();
  }

  refreshContractOnNetwork() {
    this.STABLE_COIN_DENOMS = new Set([this.terrajs.settings.axlUsdcToken, this.terrajs.settings.axlUsdtToken]);
    this.NATIVE_TOKEN_DENOMS = new Set([...this.STABLE_COIN_DENOMS, Denom.LUNA]);
    this.NATIVE_TOKEN_SYMBOLS = new Set(['USDC', 'USDT', 'axlUSDC', 'axlUSDT', 'LUNA']);
    this.contractOnNetwork = this.terrajs.networkName;
  }

}
