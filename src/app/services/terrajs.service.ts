import {Injectable, OnDestroy} from '@angular/core';
import {Coin, LCDClient, Msg, SyncTxBroadcastResult} from '@terra-money/terra.js';
import {ISettings, networks} from '../consts/networks';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject, firstValueFrom, interval, Subject, Subscription} from 'rxjs';
import {filter, startWith} from 'rxjs/operators';
import {
  ConnectType,
  getChainOptions,
  WalletController,
  WalletInfo,
  WalletStates,
  WalletStatus,
} from '@terra-money/wallet-provider';
import {ModalService} from './modal.service';
import {throttleAsync} from 'utils-decorators';
import {MdbModalService} from 'mdb-angular-ui-kit/modal';
import BigNumber from 'bignumber.js';

export const BLOCK_TIME = 6500; // 6.5s
export const DEFAULT_NETWORK = 'mainnet';

export type Result = SyncTxBroadcastResult.Data;

export interface PostResponse {
  id: number;
  origin: string;
  success: boolean;
  result?: Result;
  error?: { code: number; message?: string; };
}

export interface GetResponse {
  query_result: object;
}

export interface NetworkInfo {
  name: string;
  chainID: string;
  lcd: string;
  fcd?: string;
  ws?: string;
}

export interface ExecuteOptions {
  coin?: Coin.Data;
}

interface ConnectedState {
  status: WalletStatus;
  network: NetworkInfo;
  wallets?: WalletInfo[];
}

@Injectable({
  providedIn: 'root'
})
export class TerrajsService implements OnDestroy {
  connected = new BehaviorSubject(false);
  settings: ISettings = networks[DEFAULT_NETWORK];
  address: string;
  networkName: string = DEFAULT_NETWORK;
  extensionCurrentNetworkName: string;
  network: NetworkInfo;
  isConnected: boolean;
  lcdClient: LCDClient;
  walletController: WalletController;
  heightChanged = interval(BLOCK_TIME).pipe(startWith(0));
  USE_NEW_BASE64_API = true; // useful for development and debug
  latestBlockRefreshTime: number;
  transactionComplete = new Subject();
  private height = 0;
  private posting = false;
  private subscription: Subscription;
  isReadOnly = false;

  constructor(
    private httpClient: HttpClient,
    private modal: ModalService,
    private modalService: MdbModalService,
  ) {
    getChainOptions().then(chainOptions => {
      this.walletController = new WalletController({
        defaultNetwork: chainOptions.defaultNetwork,
        walletConnectChainIds: chainOptions.walletConnectChainIds,
        connectorOpts: {
          bridge: 'https://walletconnect.terra.dev/'
        },
        waitingChromeExtensionInstallCheck: 1000
      });
    });
    this.subscription = this.heightChanged.subscribe(() => this.height++);
  }

  get isMainnet() {
    return this.networkName === 'mainnet';
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  async checkInstalled() {
    const types = await firstValueFrom((await this.getWalletController()).availableInstallTypes());
    return types.length === 0;
  }

  async getConnectTypes() {
    const types = firstValueFrom((await this.getWalletController()).availableConnectTypes());
    return (await types).filter(t => t !== 'READONLY');  }

  @throttleAsync(1) // to prevent first time getHeight from calling API tendermint.blockInfo() simultaneously
  async getHeight(force?: boolean): Promise<number> {
    if (this.height <= 1 || force || this.USE_NEW_BASE64_API) {
      // first time getHeight
      if (!this.lcdClient) {
        await this.initLcdClient();
      }
      if (!this.height || !this.latestBlockRefreshTime || this.latestBlockRefreshTime + BLOCK_TIME < Date.now() || force) {
        const blockInfo = await this.lcdClient.tendermint.blockInfo();
        this.height = +blockInfo.block.header.height;
        this.latestBlockRefreshTime = Date.now();
      }
    }
    return this.height;
  }

  async initLcdClient() {
    const gasPrices = await firstValueFrom(this.httpClient.get<Record<string, string>>(`${this.settings.fcd}/v1/txs/gas_prices`));
    this.lcdClient = new LCDClient({
      URL: this.settings.lcd,
      chainID: this.settings.chainID,
      gasPrices,
    });
  }

  async connect(auto?: boolean): Promise<void> {
    let connectCallbackData;
    if (this.isConnected) {
      return;
    }
    let terra_extension_router_session: any;
    const connectTypes = await this.getConnectTypes();
    if (auto) { // AUTO CONNECT AFTER APP INIT
      const terra_extension_router_session_raw = localStorage.getItem('__terra_extension_router_session__');
      const connect = localStorage.getItem('connect');
      if (!connect) {
        return;
      }
      if (connect === 'WALLETCONNECT') {
        connectCallbackData = {
          type: connect,
          identifier: null
        };
      } else if (connect === 'READONLY_CUSTOM_IMP'){
        const viewonly_state_raw = localStorage.getItem('readonly_state');
        connectCallbackData = {
          stateReadOnly: JSON.parse(viewonly_state_raw),
          type: connect
        };
        this.isReadOnly = true;
        await this.finalConnectStep(connectCallbackData.stateReadOnly, connectCallbackData.type);
      } else {
        terra_extension_router_session = JSON.parse(terra_extension_router_session_raw);
        connectCallbackData = terra_extension_router_session;
        connectCallbackData.type = connect;
      }
    } else { // CLICK CONNECT
      const installTypes = await firstValueFrom(this.walletController.availableInstallTypes());
      const types = connectTypes.concat(installTypes);
      const modal = await import('./connect-options/connect-options.component');
      const ref = this.modalService.open(modal.ConnectOptionsComponent, {
        data: {types}
      });
      connectCallbackData = await firstValueFrom(ref.onClose);
      if (!connectCallbackData?.type) {
        throw new Error('Nothing selected');
      }
      if (connectCallbackData.type === 'READONLY_CUSTOM_IMP' && connectCallbackData.stateReadOnly){
        this.isReadOnly = true;
        await this.finalConnectStep(connectCallbackData.stateReadOnly, connectCallbackData.type);
        return;
      }
    }
    // STEP 2
    if (!connectTypes.includes(connectCallbackData.type as ConnectType)) {
      if (auto) {
        return;
      }
      throw new Error('Cannot connect to wallet');
    }
    if (connectCallbackData && !(connectCallbackData.type === 'WALLETCONNECT' && auto)) {
      await this.walletController.connect(connectCallbackData.type, connectCallbackData.identifier);
    }
    const state: ConnectedState = await firstValueFrom(this.walletController.states()
      .pipe(filter((it: WalletStates) => it.status === WalletStatus.WALLET_CONNECTED))); // ONLY EXTENSION AND WALLET CONNECT, NOT CUSTOM READ ONLY
    await this.finalConnectStep(state, connectCallbackData.type);
  }

  async finalConnectStep(state: ConnectedState, connectType){
    const networkNameFromWallet = state.network.name === 'classic' ? 'mainnet' : state.network.name;
    this.settings = networks[networkNameFromWallet];
    if (!this.lcdClient || this.networkName !== state.network.name) {
      await this.initLcdClient();
    }
    this.address = state.wallets[0].terraAddress;
    this.network = state.network;
    this.extensionCurrentNetworkName = this.network.name;
    this.networkName = networkNameFromWallet;

    localStorage.setItem('connect', connectType);
    if (this.isReadOnly){
      localStorage.setItem('readonly_state', JSON.stringify(state));
    }
    this.isConnected = true;
    this.connected.next(true);
  }

  // @throttleAsync(20)
  // async get(path: string, params?: Record<string, string>, additionalHeaders?: Record<string, string>) {
  //   // const headers = new HttpHeaders({ 'Cache-Control': 'no-cache', 'Content-Type': 'application/json' });
  //   const headers = new HttpHeaders({'Content-Type': 'application/json'});
  //   if (additionalHeaders) {
  //     const keys = Object.keys(additionalHeaders);
  //     for (const key of keys) {
  //       headers.append(key, additionalHeaders[key]);
  //     }
  //   }
  //
  //   if (this.USE_NEW_BASE64_API) {
  //     const res = await this.httpClient.get<GetResponse>(`${this.settings.lcd}/${path}`, {
  //       params,
  //       headers,
  //     }).toPromise();
  //     return res.query_result as any;
  //   } else {
  //     const res = await this.httpClient.get<GetResponseOld>(`${this.settings.lcd}/${path}`, {
  //       params,
  //       headers,
  //     }).toPromise();
  //     this.height = +res.height;
  //     return res.result as any;
  //   }
  // }

  disconnect() {
    this.walletController.disconnect();
    localStorage.removeItem('rewardInfos');
    localStorage.removeItem('connect');
    localStorage.removeItem('address');
    localStorage.removeItem('readonly_state');
    location.reload();
  }

  async getFCD(path: string, params?: Record<string, string>, headers?: Record<string, string>) {
    const res = await firstValueFrom(this.httpClient.get<GetResponse>(`${this.settings.fcd}/${path}`, {
      params,
      headers,
    }));
    return res as any;
  }

  async post(msgs: Msg[] | Msg, confirmMsg?: string) {
    if (this.posting) {
      return;
    }
    try {
      this.posting = true;
      const modal = await import('./tx-post/tx-post.component');
      const ref = this.modalService.open(modal.TxPostComponent, {
        keyboard: false,
        ignoreBackdropClick: true,
        data: {
          msgs: msgs instanceof Array ? msgs : [msgs],
          confirmMsg
        }
      });
      const result = await firstValueFrom(ref.onClose);
      if (!result) {
        throw new Error('Transaction canceled');
      }
      this.transactionComplete.next(null);
    } finally {
      this.posting = false;
    }
  }

  async toDate(height: number) {
    const now = Date.now();
    await this.getHeight();
    return new Date(now + (height - this.height) * BLOCK_TIME);
  }

  async deductTax(denom: string, amount: string) {
    const [taxRate, taxCap] = await Promise.all([
      this.lcdClient.treasury.taxRate(),
      this.lcdClient.treasury.taxCap(denom)
    ]);
    const num = new BigNumber(amount);
    let tax = num.minus(num.div(1 + taxRate.toNumber()).integerValue(BigNumber.ROUND_DOWN));
    if (tax.gt(taxCap.amount.toString())) {
      tax = new BigNumber(taxCap.amount.toString());
    }
    return num.minus(tax).toString();
  }

  private async getWalletController() {
    while (!this.walletController) {
      await new Promise(ok => setTimeout(() => ok('')));
    }
    return this.walletController;
  }
}
