import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {TerrajsService} from '../services/terrajs.service';
import {Clipboard} from '@angular/cdk/clipboard';
import {ModalService} from '../services/modal.service';
import {TruncatePipe} from '../pipes/truncate.pipe';
import {InfoService} from '../services/info.service';
import {Subscription, switchMap, tap} from 'rxjs';
import {MdbDropdownDirective} from 'mdb-angular-ui-kit/dropdown';
import {WasmService} from '../services/api/wasm.service';

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
            await this.info.refreshBalance({native_token: true, spec: true});
          }
        })
      ).subscribe()
    );
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

    this.wasm.instantiate(778,
        {
          commission_bps: 30,
          pair_contract: 'terra1c7g9pmz2xxe66g8ujpe5tlmj3pawjp290f57cl43j6vswkdtrvwqkgme9q',
          pair_proxies: [
            [
              {
                token: {
                  contract_addr: 'terra1nsuqsk6kh58ulczatwev87ttq2z6r3pusulg9r24mfj2fvtzd4uq3exn26'
                }
              },
              'terra13rj43lsucnel7z8hakvskr7dkfj27hd9aa06pcw4nh7t66fgt7qshrpmaw'
            ]
          ],
          slippage_tolerance: '0.01'
        }, 'Spectrum ROAR-LUNA Compound Proxy');

    this.wasm.instantiate(942,
        {
          base_reward_token: 'terra1nsuqsk6kh58ulczatwev87ttq2z6r3pusulg9r24mfj2fvtzd4uq3exn26',
          compound_proxy: '...',
          controller: 'terra1h5tnsa8520qlgg2gp3gw2u46qqtdf0qyhdfvpz',
          fee: '0.05',
          fee_collector: 'terra10y08s37a8uralncpqredva58e4aqfxc5kpz9yaf5rv48rzqtvsmqpy0f5h',
          liquidity_token: 'terra1qmr5wagmeej33hsnqdmqyvkq6rg3sfkvflmu6gd6drhtjfpx4y5sew88s4',
          name: 'Spectrum Astroport ROAR-LUNA LP cToken',
          owner: 'terra1yqxkeu93ss3p2ddgkahjsh7pvk0nzzxqkuua49lxaecxutprye8st273wq',
          pair: 'terra1c7g9pmz2xxe66g8ujpe5tlmj3pawjp290f57cl43j6vswkdtrvwqkgme9q',
          staking_contract: 'terra1vf9ceekuxx8kycm7yv6hs96hgwsmrzt4la6s84skrgvfu7t09huqqdg09d',
          symbol: 'clpRoarLuna'
        }, 'Spectrum ROAR-LUNA Farm');
  }



  private async initWallet(): Promise<boolean> {
    return await this.terrajs.checkInstalled();
  }

  private getWalletText() {
    return this.truncate.transform(this.terrajs.address);
  }

}
