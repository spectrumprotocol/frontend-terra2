import { Injectable } from '@angular/core';
import { ExecuteOptions, TerrajsService } from '../terrajs.service';
import { ExecuteMsg } from './astroport_generator/execute_msg';
import { QueryMsg } from './astroport_generator/query_msg';
import { WasmService } from './wasm.service';

@Injectable({
  providedIn: 'root'
})
export class AstroportFactoryService {

  constructor(
    private terrajs: TerrajsService,
    private wasm: WasmService,
  ) { }

  query(msg: QueryMsg): Promise<any> {
    return this.wasm.query(this.terrajs.settings.astroportGenerator, msg);
  }

  handle(msg: ExecuteMsg, opts?: ExecuteOptions) {
    return this.wasm.execute(this.terrajs.settings.astroportGenerator, msg, opts);
  }
}
