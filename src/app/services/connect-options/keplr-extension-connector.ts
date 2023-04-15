import { Keplr, OfflineAminoSigner, OfflineDirectSigner } from '@keplr-wallet/types';
import {
  TerraWebExtensionConnector, WebExtensionStates, WebExtensionStatus,
  WebExtensionTxResult, WebExtensionTxStatus, WebExtensionPostPayload,
  TerraWebExtensionFeatures
} from '@terra-money/web-extension-interface';
import { Observer, Subscribable, Subject } from 'rxjs';
import { CONFIG } from '../../consts/config';
import { CreateTxOptions } from '@terra-money/terra.js';
import { getChainInfo } from './chain-info';
import { AminoTypes, SigningStargateClient } from '@cosmjs/stargate';
import { registry } from 'kujira.js/lib/esm/registry';
import { aminoTypes } from 'kujira.js/lib/esm/amino';

declare global {
  interface Window {
    keplr?: Keplr;
    getOfflineSigner?: (chainId: string) => OfflineAminoSigner & OfflineDirectSigner;
  }
}

export class KeplrExtensionConnector implements TerraWebExtensionConnector {
  client: SigningStargateClient;
  aminoTypes: AminoTypes;

  supportFeatures(): TerraWebExtensionFeatures[] {
    return ['post'];
  }

  async open(hostWindow: Window, statesObserver: Observer<WebExtensionStates>) {
    const chainID = CONFIG.CHAIN_ID;
    const chainInfo = getChainInfo(chainID);

    if (hostWindow.keplr && hostWindow.getOfflineSigner && chainInfo) {
      statesObserver.next({
        type: WebExtensionStatus.INITIALIZING,
      });

      await hostWindow.keplr.experimentalSuggestChain(chainInfo);
      await hostWindow.keplr.enable(chainID);
      const signer = hostWindow.getOfflineSigner(chainID);
      const accounts = await signer.getAccounts();

      this.aminoTypes = aminoTypes(chainInfo.bech32Config.bech32PrefixAccAddr) as any;
      this.client = await SigningStargateClient.connectWithSigner(chainInfo.rpc, signer, {
        registry: registry as any,
        aminoTypes: this.aminoTypes,
      });

      statesObserver.next({
        type: WebExtensionStatus.READY,
        focusedWalletAddress: accounts[0]?.address,
        wallets: accounts.map(it => ({ name: it.address, terraAddress: it.address, design: chainID })),
        network: {
          name: chainInfo.chainName.toLowerCase().includes('testnet') ? 'testnet' : 'mainnet',
          chainID,
          lcd: chainInfo.rest,
          walleconnectID: 0,
        },
      });
    } else {
      statesObserver.next({
        type: WebExtensionStatus.NO_AVAILABLE,
        isConnectorExists: true,
      });
    }
    statesObserver.complete();
  }
  close() {
    window.keplr?.disable(CONFIG.CHAIN_ID);
  };
  requestApproval() { }
  refetchStates() { }

  post(terraAddress: string, tx: CreateTxOptions): Subscribable<WebExtensionTxResult<WebExtensionPostPayload>> {
    const subject = new Subject<WebExtensionTxResult<WebExtensionPostPayload>>();
    this.postAsync(terraAddress, tx)
      .then(payload => {
        subject.next({
          status: WebExtensionTxStatus.SUCCEED,
          payload,
        });
        subject.complete();
      },
      error => subject.error(error));
    return subject;
  }
  private async postAsync(terraAddress: string, tx: CreateTxOptions): Promise<WebExtensionPostPayload> {
    const result = await this.client.signAndBroadcast(
      terraAddress,
      tx.msgs.map(it => this.aminoTypes.fromAmino(it.toAmino())),
      tx.fee
        ? {
          amount: tx.fee.amount.toData(),
          gas: tx.fee.gas_limit.toString(),
          payer: tx.fee.payer,
          granter: tx.fee.granter,
        }
        : 'auto',
      tx.memo);
    return {
      height: result.height,
      raw_log: result.rawLog,
      txhash: result.transactionHash,
    };
  }

  sign(): never {
    throw new Error('not support: sign');
  }
  signBytes(): never {
    throw new Error('not support: signBytes');
  }
  hasCW20Tokens(): never {
    throw new Error('not support: hasCW20Tokens');
  }
  addCW20Tokens(): never {
    throw new Error('not support: addCW20Tokens');
  }
  hasNetwork(): never {
    throw new Error('not support: hasNetwork');
  }
  addNetwork(): never {
    throw new Error('not support: addNetwork');
  }
}