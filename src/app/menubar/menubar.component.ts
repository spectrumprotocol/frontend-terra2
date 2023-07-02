import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { TerrajsService } from '../services/terrajs.service';
import { Clipboard } from '@angular/cdk/clipboard';
import { ModalService } from '../services/modal.service';
import { TruncatePipe } from '../pipes/truncate.pipe';
import { InfoService } from '../services/info.service';
import { Subscription, switchMap, tap } from 'rxjs';
import { MdbDropdownDirective } from 'mdb-angular-ui-kit/dropdown';
import { Currency } from '@keplr-wallet/types';
import { getChainInfo } from '../services/connect-options/chain-info';
import { CONFIG, getCurrentChainBrand } from '../consts/config';
import { WasmService } from '../services/api/wasm.service';

@Component({
  selector: 'app-menubar',
  templateUrl: './menubar.component.html',
  styleUrls: ['./menubar.component.scss']
})
export class MenubarComponent implements OnInit, OnDestroy {

  @ViewChild('dropdown') dropdown: MdbDropdownDirective;
  tradeSpecUrl = `https://app.astroport.fi/swap?from=${this.terrajs.settings.axlUsdcToken}&to=${this.terrajs.settings.specToken}`;
  walletText = 'Connect Wallet';
  tnsName = null;
  private processes: Subscription;
  currency: Currency;

  get finderLink() {
    return getCurrentChainBrand() === 'Terra'
      ? `${this.terrajs.settings.finder}/${this.terrajs.networkName}/account/${this.terrajs.address}`
      : `${this.terrajs.settings.finder}/account/${this.terrajs.address}`;
  }

  get finderName() {
    return getCurrentChainBrand() === 'Terra'
      ? 'Terra Finder'
      : 'Injective Explorer';
  }

  get isTerra() {
    return getCurrentChainBrand() === 'Terra'
  }

  constructor(
    public terrajs: TerrajsService,
    public info: InfoService,
    private clipboard: Clipboard,
    private modelService: ModalService,
    private truncate: TruncatePipe,
    private wasm: WasmService,
  ) {
  }

  async ngOnInit() {
    // NOTE : Create a composite subscription, we will compose everything into it and unsub everything once on destroy.
    this.processes = new Subscription();
    this.processes.add(
      this.terrajs.connected.pipe(
        tap(async (connected) => {
          if (connected) {
            this.walletText = this.getWalletText();
          } else {
            this.walletText = 'Connect Wallet';
          }
        }),
        // NOTE : SwitchMap means "Subscribe, in a subscribe, we are passing control to "initWallet".
        // Observables and promises are fully interoperable
        switchMap(() => {
          // NOTE : Will wait until the first state who is not "initialized".
          return this.initWallet();
        }),
        tap(async (installed) => {
          if (!installed) {
            this.walletText = 'Please install Terra Station';
          } else if (this.terrajs.isConnected) {
            this.walletText = this.getWalletText();
            await this.info.refreshBalance({ native_token: true, spec: true });
          }
        })
      ).subscribe()
    );

    const chainInfo = getChainInfo(CONFIG.CHAIN_ID);
    this.currency = chainInfo.currencies[0];
  }

  ngOnDestroy(): void {
    this.processes.unsubscribe();
  }

  async connect() {
    await this.terrajs.connect();
    this.walletText = this.getWalletText();
  }

  async disconnect() {
    this.terrajs.disconnect();
    this.walletText = 'Connect Wallet';
  }

  async copy() {
    this.clipboard.copy(this.terrajs.address);
    this.modelService.notify('address copied');
    this.dropdown.hide();
  }

  private async initWallet(): Promise<boolean> {
    return await this.terrajs.checkInstalled();
  }

  private getWalletText() {
    return this.truncate.transform(this.terrajs.address);
  }

  async handleFiles(files: FileList) {
    const zlip = await import('pako');
    const file = files.item(0);
    const data = await file.arrayBuffer();
    const gzip = zlip.gzip(new Uint8Array(data));
    const base64 = Buffer.from(gzip).toString('base64');
    return this.wasm.storeCode(base64);
  }
}
