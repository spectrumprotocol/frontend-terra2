import { Keplr, OfflineAminoSigner, OfflineDirectSigner } from '@keplr-wallet/types';
import {
  TerraWebExtensionConnector, WebExtensionStates, WebExtensionStatus,
  WebExtensionTxResult, WebExtensionTxStatus, WebExtensionPostPayload,
  TerraWebExtensionFeatures
} from '@terra-money/web-extension-interface';
import { Observer, Subscribable, Subject } from 'rxjs';
import { CONFIG } from '../../consts/config';
import { AuthInfo, CreateTxOptions, LCDClient, Tx, TxBody } from '@terra-money/terra.js';
import { TxBody as TxBody_pb, AuthInfo as AuthInfo_pb } from '@terra-money/terra.proto/cosmos/tx/v1beta1/tx';
import { getChainInfo } from './chain-info';
import { AminoTypes, GasPrice, SigningStargateClient } from '@cosmjs/stargate';
import { registry, accountParser } from 'kujira.js/lib/esm/registry';
import { aminoTypes } from 'kujira.js/lib/esm/amino';
import { Decimal } from '@cosmjs/math';

declare global {
  interface Window {
    keplr?: Keplr;
    getOfflineSigner?: (chainId: string) => OfflineAminoSigner & OfflineDirectSigner;
  }
}

export class KeplrExtensionConnector implements TerraWebExtensionConnector {
  client: SigningStargateClient;
  aminoTypes: AminoTypes;
  chainID = CONFIG.CHAIN_ID;

  constructor(
    private lcdClient: LCDClient,
  ) {}

  supportFeatures(): TerraWebExtensionFeatures[] {
    return ['post'];
  }

  async open(hostWindow: Window, statesObserver: Observer<WebExtensionStates>) {
    const chainID = this.chainID;
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
        accountParser,
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
    const result = await this.client.sign(
      terraAddress,
      tx.msgs.map(it => this.aminoTypes.fromAmino(it.toAmino())),
      {
        amount: tx.fee.amount.toData(),
        gas: tx.fee.gas_limit.toString(),
        payer: tx.fee.payer,
        granter: tx.fee.granter,
      },
      tx.memo);
    
    const bc = await this.lcdClient.tx.broadcastSync(Tx.fromData({
      auth_info: AuthInfo.fromProto(AuthInfo_pb.decode(result.authInfoBytes)).toData(),
      signatures: result.signatures.map(it => Buffer.from(it).toString('base64')),
      body: TxBody.fromProto(TxBody_pb.decode(result.bodyBytes)).toData(),
    }));

    return {
      height: bc.height,
      raw_log: bc.raw_log,
      txhash: bc.txhash,
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
