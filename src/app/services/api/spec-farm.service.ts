import { Injectable } from '@angular/core';
import { ExecuteOptions, TerrajsService } from '../terrajs.service';
import { ConfigResponse } from './spectrum_spec_farm/config_response';
import { ExecuteMsg } from './spectrum_spec_farm/execute_msg';
import { QueryMsg } from './spectrum_spec_farm/query_msg';
import { RewardInfoResponse } from './spectrum_spec_farm/reward_info_response';
import { StateResponse } from './spectrum_spec_farm/state_response';
import { WasmService } from './wasm.service';

@Injectable({
  providedIn: 'root'
})
export class SpecFarmService {

  constructor(
    private terrajs: TerrajsService,
    private wasm: WasmService,
  ) { }

  query(msg: Extract<QueryMsg, { config: unknown }>): Promise<ConfigResponse>;
  query(msg: Extract<QueryMsg, { reward_info: unknown }>): Promise<RewardInfoResponse>;
  query(msg: Extract<QueryMsg, { state: unknown }>): Promise<StateResponse>;
  query(msg: QueryMsg): Promise<any> {
    return this.wasm.query(this.terrajs.settings.specFarm, msg);
  }

  handle(msg: ExecuteMsg, opts?: ExecuteOptions) {
    return this.wasm.execute(this.terrajs.settings.specFarm, msg, opts);
  }
}
