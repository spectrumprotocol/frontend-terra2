import { Injectable } from '@angular/core';
import { TerrajsService } from './terrajs.service';


@Injectable({
  providedIn: 'root'
})
export class ConfigService {

  STABLE_COIN_DENOMS: Set<string>;
  contractOnNetwork: string;

  constructor(
    public terrajs: TerrajsService,
  ) {
    this.refreshContractOnNetwork();
  }

  refreshContractOnNetwork() {
    this.STABLE_COIN_DENOMS = new Set([this.terrajs.settings.axlUsdcToken,
                                      this.terrajs.settings.axlUsdtToken,
                                      this.terrajs.settings.stbToken,
                                      this.terrajs.settings.stblToken,
                                      this.terrajs.settings.usdcToken
                                    ]);
    this.STABLE_COIN_DENOMS.delete('');
    this.STABLE_COIN_DENOMS.delete(undefined);
    this.contractOnNetwork = this.terrajs.networkName;

  }

}
