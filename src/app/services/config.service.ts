import { Injectable } from '@angular/core';
import { TerrajsService } from './terrajs.service';
import { Denom } from '../consts/denom';
import { CONFIG } from '../consts/config';


@Injectable({
  providedIn: 'root'
})
export class ConfigService {

  STABLE_COIN_DENOMS: Set<string>;
  NATIVE_TOKEN_DENOMS: Set<string>;
  contractOnNetwork: string;

  constructor(
    public terrajs: TerrajsService,
  ) {
    this.refreshContractOnNetwork();
  }

  refreshContractOnNetwork() {
    if (CONFIG.IS_TERRA) {
      if (this.terrajs.isMainnet) {
        this.STABLE_COIN_DENOMS = new Set([this.terrajs.settings.axlUsdcToken, this.terrajs.settings.axlUsdtToken]);
        this.NATIVE_TOKEN_DENOMS = new Set([...this.STABLE_COIN_DENOMS, Denom.LUNA, this.terrajs.settings.stLUNAToken]);
      } else {
        this.STABLE_COIN_DENOMS = new Set([this.terrajs.settings.stbToken, this.terrajs.settings.stblToken]);
        this.NATIVE_TOKEN_DENOMS = new Set([Denom.LUNA]);
      }
    } else {
      if (this.terrajs.isMainnet) {
        // TODO: Add this
      } else {
        this.STABLE_COIN_DENOMS = new Set([this.terrajs.settings.usdcToken]);
        this.NATIVE_TOKEN_DENOMS = new Set([Denom.INJ]);
      }
    }
    this.contractOnNetwork = this.terrajs.networkName;

  }

}
