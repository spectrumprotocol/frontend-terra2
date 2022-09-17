import {Injectable} from '@angular/core';
import {ExecuteOptions} from '../terrajs.service';
import {QueryMsg} from './spectrum_compound_proxy/query_msg';
import {WasmService} from './wasm.service';
import {InstantiateMsg} from './spectrum_compound_proxy/instantiate_msg';
import {CompoundSimulationResponse} from './spectrum_compound_proxy/compound_simulation_response';
import {CompoundProxyExecuteMsg} from './spectrum_compound_proxy/execute_msg';

@Injectable({
  providedIn: 'root'
})
export class SpectrumCompoundProxyService {

  constructor(
    private wasm: WasmService,
  ) {
  }

  query(address: string, msg: Extract<QueryMsg, { config: unknown }>): Promise<InstantiateMsg>;
  query(address: string, msg: Extract<QueryMsg, { compound_simulation: unknown }>): Promise<CompoundSimulationResponse>;
  query(address: string, msg: QueryMsg): Promise<any> {
    return this.wasm.query(address, msg);
  }

  handle(address: string, msg: CompoundProxyExecuteMsg, opts?: ExecuteOptions) {
    return this.wasm.execute(address, msg, opts);
  }
}
