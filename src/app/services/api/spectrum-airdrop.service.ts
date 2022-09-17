import { Injectable } from '@angular/core';
import { ExecuteOptions, TerrajsService } from '../terrajs.service';
import { ConfigResponse } from './spectrum_simple_airdrop/config_response';
import { ExecuteMsg } from './spectrum_simple_airdrop/execute_msg';
import { QueryMsg } from './spectrum_simple_airdrop/query_msg';
import { StateResponse } from './spectrum_simple_airdrop/state_response';
import { UserInfoResponse } from './spectrum_simple_airdrop/user_info_response';
import { WasmService } from './wasm.service';

@Injectable({
  providedIn: 'root'
})
export class SpectrumAirdropService {

  constructor(
    private wasm: WasmService,
    private terrajs: TerrajsService
  ) { }

  query(msg: Extract<QueryMsg, { config: unknown }>): Promise<ConfigResponse>;
  query(msg: Extract<QueryMsg, { state: unknown }>): Promise<StateResponse>;
  query(msg: Extract<QueryMsg, { user_info: unknown }>): Promise<UserInfoResponse>;
  query(msg: QueryMsg): Promise<any> {
    return this.wasm.query(this.terrajs.settings.airdrop, msg);
  }

  handle(msg: ExecuteMsg, opts?: ExecuteOptions) {
    return this.wasm.execute(this.terrajs.settings.airdrop, msg, opts);
  }
}
