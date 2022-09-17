import {Injectable} from '@angular/core';
import {ExecuteOptions, TerrajsService} from '../terrajs.service';
import {FarmExecuteMsg} from './spectrum_astroport_farm/execute_msg';
import {QueryMsg} from './spectrum_astroport_farm/query_msg';
import {RewardInfoResponse} from './spectrum_astroport_farm/reward_info_response';
import {StateInfo} from './spectrum_astroport_farm/state_info';
import {WasmService} from './wasm.service';
import {InstantiateMsg} from './spectrum_astroport_farm/instantiate_msg';

@Injectable({
  providedIn: 'root'
})
export class SpectrumAstroportGenericFarmService {

  constructor(
    private terrajs: TerrajsService,
    private wasm: WasmService,
  ) {
  }

  query(contract: string, msg: Extract<QueryMsg, { config: unknown }>): Promise<InstantiateMsg>;
  query(contract: string, msg: Extract<QueryMsg, { reward_info: unknown }>): Promise<RewardInfoResponse>;
  query(contract: string, msg: Extract<QueryMsg, { state: unknown }>): Promise<StateInfo>;
  query(contract: string, msg: QueryMsg): Promise<any> {
    return this.wasm.query(contract, msg);
  }

  handle(contract: string, msg: FarmExecuteMsg, opts?: ExecuteOptions) {
    return this.wasm.execute(contract, msg, opts);
  }
}
