import {Component, ViewChild} from '@angular/core';
import { MdbModalRef } from 'mdb-angular-ui-kit/modal';
import MobileDetect from 'mobile-detect';
import { getExtensions } from '@terra-money/wallet-controller/operators/getExtensions';
import { firstValueFrom } from 'rxjs';
import { ExtensionInfo } from '@terra-money/wallet-controller/modules/extension-router/multiChannel';
import {ConnectType, NetworkInfo} from '@terra-money/wallet-provider';
import {networks} from '../../consts/networks';
import {NgForm, NgModel} from '@angular/forms';

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
  walletExtensions: ExtensionInfo[];
  walletExtensionsForInstall: InstallableExtension[] = [];
  isPhoneOrTablet: boolean;
  viewOnlyAddress: string;
  @ViewChild('formViewOnly') formViewOnly: NgForm;

  constructor(private modalRef: MdbModalRef<ConnectOptionsComponent>) {
    firstValueFrom(getExtensions()).then((value) => {
      this.walletExtensionsForInstall = value;
    });
    this.walletExtensions = window.terraWallets ?? [];
    const md = new MobileDetect(window.navigator.userAgent);
    this.isPhoneOrTablet = md.phone() !== null || md.tablet() !== null;
  }

  connect(type: string, identifier: string) {
    this.modalRef.close({ type, identifier });
  }

  connectViewOnly(networkName: string) {
    if (this.formViewOnly.invalid){
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
