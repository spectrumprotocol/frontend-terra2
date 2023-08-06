import { Keplr, Key, OfflineAminoSigner, OfflineDirectSigner } from '@keplr-wallet/types';
import {
  TerraWebExtensionConnector, WebExtensionStates, WebExtensionStatus,
  WebExtensionTxResult, WebExtensionTxStatus, WebExtensionPostPayload,
  TerraWebExtensionFeatures
} from '@terra-money/web-extension-interface';
import { Observer, Subscribable, Subject } from 'rxjs';
import { CONFIG, InjectivePublicKey } from '../../consts/config';
import { AuthInfo, CreateTxOptions, Fee, LCDClient, ModeInfo, SignDoc, SignerInfo, SimplePublicKey, Tx, TxBody } from '@terra-money/terra.js';
import { getChainInfo } from './chain-info';
import { AuthInfo as ProtoAuthInfo } from '@terra-money/terra.proto/cosmos/tx/v1beta1/tx';

declare global {
  interface Window {
    keplr?: Keplr;
    getOfflineSigner?: (chainId: string) => OfflineAminoSigner & OfflineDirectSigner;
  }
}

export class KeplrExtensionConnector implements TerraWebExtensionConnector {
  private signer: OfflineAminoSigner & OfflineDirectSigner;
  private key: Key;

  constructor(
    private lcdClient: LCDClient,
  ) { }

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
      this.signer = hostWindow.getOfflineSigner(chainID);
      this.key = await hostWindow.keplr.getKey(chainID);
      const accounts = await this.signer.getAccounts();

      statesObserver.next({
        type: WebExtensionStatus.READY,
        focusedWalletAddress: accounts[0]?.address,
        wallets: accounts.map(it => ({
          name: it.address,
          terraAddress: it.address,
          design: chainID
        })),
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
  }
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
    const accountInfo = await this.lcdClient.auth.accountInfo(terraAddress);
    const accounts = await this.signer.getAccounts();
    const account = accounts.find(it => it.address === terraAddress);
    if (!account) {
      throw new Error('Failed to retrieve account from signer');
    }

    const txBody = new TxBody(tx.msgs, tx.memo, tx.timeoutHeight);
    const pubkey = CONFIG.CHAIN_ID.startsWith('injective')
      ? new InjectivePublicKey(Buffer.from(account.pubkey).toString('base64'))
      : new SimplePublicKey(Buffer.from(account.pubkey).toString('base64'));
    const signDirect = this.signer.signDirect && !this.key.isNanoLedger;
    const modeInfo = signDirect
      ? new ModeInfo(new ModeInfo.Single(ModeInfo.SignMode.SIGN_MODE_DIRECT))
      : new ModeInfo(new ModeInfo.Single(ModeInfo.SignMode.SIGN_MODE_LEGACY_AMINO_JSON))
    const signerInfo = new SignerInfo(pubkey, accountInfo.getSequenceNumber(), modeInfo);
    const authInfo = new AuthInfo([signerInfo], tx.fee);
    const signDoc = new SignDoc(CONFIG.CHAIN_ID, accountInfo.getAccountNumber(), accountInfo.getSequenceNumber(), authInfo, txBody);
    
    if (signDirect) {
      const signature = await this.signer.signDirect(terraAddress, signDoc.toProto());
      const protoAuthInfo = ProtoAuthInfo.decode(signature.signed.authInfoBytes);
      authInfo.fee = Fee.fromProto(protoAuthInfo.fee);
      const signedTx = new Tx(txBody, authInfo, [signature.signature.signature]);
      return this.lcdClient.tx.broadcastSync(signedTx);
  } else {
      const signature = await this.signer.signAmino(terraAddress, signDoc.toAmino());
      const signedFee = signature.signed.fee;
      authInfo.fee = Fee.fromData({
        amount: signedFee.amount.map(it => it),
        gas_limit: signedFee.gas,
        granter: signedFee.granter,
        payer: signedFee.payer,
      });
      const signedTx = new Tx(txBody, authInfo, [signature.signature.signature]);
      return this.lcdClient.tx.broadcastSync(signedTx);
    }
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
