import { Component, ViewChild } from '@angular/core';
import { MdbModalRef } from 'mdb-angular-ui-kit/modal';
import MobileDetect from 'mobile-detect';
import { getExtensions } from '@terra-money/wallet-controller/operators/getExtensions';
import { firstValueFrom } from 'rxjs';
import { ExtensionInfo } from '@terra-money/wallet-controller/modules/extension-router/multiChannel';
import { NetworkInfo } from '@terra-money/wallet-provider';
import { NgForm } from '@angular/forms';
import { CONFIG } from '../../consts/config';
import { KeplrExtensionConnector } from './keplr-extension-connector';
import { LCDClient } from '@terra-money/terra.js';

interface InstallableExtension {
  name: string;
  identifier: string;
  icon: string;
  url: string;
}

@Component({
  selector: 'app-connect-options',
  templateUrl: './connect-options.component.html',
  styleUrls: ['./connect-options.component.scss'],
})
export class ConnectOptionsComponent {
  types: string[];
  lcdClient: LCDClient;
  walletExtensions: ExtensionInfo[] = [];
  walletExtensionsForInstall: InstallableExtension[] = [];
  isPhoneOrTablet: boolean;
  viewOnlyAddress: string;
  @ViewChild('formViewOnly') formViewOnly: NgForm;

  constructor(private modalRef: MdbModalRef<ConnectOptionsComponent>) {
    this.setInstallableExtensions();
    const md = new MobileDetect(window.navigator.userAgent);
    this.isPhoneOrTablet = md.phone() !== null || md.tablet() !== null;
  }

  static ensureKeplr(extensions: ExtensionInfo[], extensionToInstall: InstallableExtension[], lcdClient: LCDClient) {
    if (window.keplr && window.getOfflineSigner) {
      if (!extensions.find(it => it.identifier === 'keplr')) {
        extensions.push({
          name: 'Keplr',
          identifier: 'keplr',
          icon: '/assets/keplr.png',
          connector: () => new KeplrExtensionConnector(lcdClient)
        });
      }
    } else {
      if (!extensionToInstall.find(it => it.identifier === 'keplr')) {
        extensionToInstall.push({
          name: 'Keplr',
          identifier: 'keplr',
          icon: '/assets/keplr.png',
          url: 'https://chrome.google.com/webstore/detail/keplr/dmkamcknogkgcdfhhbddcghachkejeap',
        });
      }
    }
  }

  private async setInstallableExtensions() {
    if (CONFIG.CHAIN_ID === 'phoenix-1' || CONFIG.CHAIN_ID === 'pisco-1') {
      this.walletExtensionsForInstall = await firstValueFrom(getExtensions());
      this.walletExtensions = window.terraWallets ?? [];
    }
    ConnectOptionsComponent.ensureKeplr(this.walletExtensions, this.walletExtensionsForInstall, this.lcdClient);
  }

  connect(type: string, identifier: string) {
    this.modalRef.close({ type, identifier });
  }

  connectViewOnly(networkName: string) {
    if (this.formViewOnly.invalid) {
      return;
    }
    const stateReadOnly = {
      network: {
        name: networkName
      } as NetworkInfo,
      wallets: [
        {
          terraAddress: this.viewOnlyAddress
        }
      ]
    };
    this.modalRef.close({ type: 'READONLY_CUSTOM_IMP', stateReadOnly });
  }

  findWalletExtensionIdentifier(identifier: string) {
    return !!this.walletExtensions.find((w) => w.identifier === identifier);
  }
}
