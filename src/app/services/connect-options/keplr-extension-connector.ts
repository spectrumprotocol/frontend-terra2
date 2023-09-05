import { Keplr, Key, OfflineAminoSigner, OfflineDirectSigner } from '@keplr-wallet/types';
import {
  TerraWebExtensionConnector, WebExtensionStates, WebExtensionStatus,
  WebExtensionTxResult, WebExtensionTxStatus, WebExtensionPostPayload,
  TerraWebExtensionFeatures
} from '@terra-money/web-extension-interface';
import { Observer, Subscribable, Subject } from 'rxjs';
import { CONFIG, InjectivePublicKey } from '../../consts/config';
import { AuthInfo, CreateTxOptions, Fee, LCDClient, ModeInfo, MsgExecuteContract, SignDoc, SignerInfo, SimplePublicKey, Tx, TxBody } from '@terra-money/terra.js';
import { getChainInfo } from './chain-info';
import { AuthInfo as ProtoAuthInfo, Tx as ProtoTx } from '@terra-money/terra.proto/cosmos/tx/v1beta1/tx';
import { ExtensionOptionsWeb3Tx } from '@keplr-wallet/proto-types/ethermint/types/v1/web3';
import { EthermintChainIdHelper } from '@keplr-wallet/cosmos';
import { getEip712TypedDataBasedOnChainId } from '@keplr-wallet/stores/build/account/utils';
import { InjectiveWasmxV1Beta1Tx } from '@injectivelabs/core-proto-ts';
import { Any } from '@terra-money/terra.proto/google/protobuf/any';
import { ModalService } from '../modal.service';

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
    private modal: ModalService,
  ) { }

  supportFeatures(): TerraWebExtensionFeatures[] {
    return ['post'];
  }

  async open(hostWindow: Window, statesObserver: Observer<WebExtensionStates>) {
    try {
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
        // await this.signer.getAccounts(); can yield error => ERROR Error: Uncaught (in promise): Error: No Ethereum public key. Initialize Ethereum app on Ledger by selecting the chain in the extension
        // Error: No Ethereum public key. Initialize Ethereum app on Ledger by selecting the chain in the extension

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
    } catch (e) {
      console.error('KeplrExtensionConnector open error::', e);
      await this.modal.alert(e.toString(), {iconType: 'danger'});
    }

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

    const isInjective = CONFIG.CHAIN_ID.startsWith('injective');
    const isEip712 = this.key.isNanoLedger && isInjective;
    if (isEip712) {
      tx.timeoutHeight = Number.MAX_SAFE_INTEGER;
      tx.msgs = tx.msgs.map(it => {
        if (it instanceof MsgExecuteContract) {
          return new MsgExecuteContractCompat(it);
        } else {
          return it;
        }
      });
      delete tx.fee.payer;
    }
    const txBody = new TxBody(tx.msgs, tx.memo, tx.timeoutHeight);
    const pubkey = isInjective
      ? new InjectivePublicKey(Buffer.from(account.pubkey).toString('base64'))
      : new SimplePublicKey(Buffer.from(account.pubkey).toString('base64'));
    const signDirect = !this.key.isNanoLedger;
    const modeInfo = signDirect
      ? new ModeInfo(new ModeInfo.Single(ModeInfo.SignMode.SIGN_MODE_DIRECT))
      : new ModeInfo(new ModeInfo.Single(ModeInfo.SignMode.SIGN_MODE_LEGACY_AMINO_JSON));
    const signerInfo = new SignerInfo(pubkey, accountInfo.getSequenceNumber(), modeInfo);
    const authInfo = new AuthInfo([signerInfo], tx.fee);
    const signDoc = new SignDoc(CONFIG.CHAIN_ID, accountInfo.getAccountNumber(), accountInfo.getSequenceNumber(), authInfo, txBody);

    if (signDirect) {
      const signature = await this.signer.signDirect(terraAddress, signDoc.toProto());
      const protoAuthInfo = ProtoAuthInfo.decode(signature.signed.authInfoBytes);
      authInfo.fee = Fee.fromProto(protoAuthInfo.fee);
      const signedTx = new Tx(txBody, authInfo, [signature.signature.signature]);
      return this.lcdClient.tx.broadcastSync(signedTx);
    } else if (isEip712) {
      const types = getEip712TypedDataBasedOnChainId(CONFIG.CHAIN_ID, {
        aminoMsgs: [], protoMsgs: [], rlpTypes: this.getEip712Types(tx.msgs[0])
      });
      const data = signDoc.toAmino();
      const signature = await window.keplr.experimentalSignEIP712CosmosTx_v0(
        CONFIG.CHAIN_ID,
        terraAddress,
        types,
        data,
      );

      const signedFee = signature.signed.fee;
      authInfo.fee = Fee.fromData({
        amount: signedFee.amount.map(it => it),
        gas_limit: signedFee.gas,
        granter: signedFee.granter,
        payer: undefined,
      });
      const txBodyProto = txBody.toProto();
      const web3Tx = ExtensionOptionsWeb3Tx.fromPartial({
        typedDataChainId: EthermintChainIdHelper.parse(
          CONFIG.CHAIN_ID
        ).ethChainId.toString(),
      });
      txBodyProto.extensionOptions = [Any.fromPartial({
        typeUrl: '/injective.types.v1beta1.ExtensionOptionsWeb3Tx',
        value: ExtensionOptionsWeb3Tx.encode(web3Tx).finish()
      })];
      const signedTx = {
        toBytes() {
          return ProtoTx.encode({
            body: txBodyProto,
            authInfo: authInfo.toProto(),
            signatures: [Buffer.from(signature.signature.signature, 'base64')],
          }).finish();
        }
      } as any;
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

  private getEip712Types(msg: any): Record<string, {
    name: string;
    type: string;
  }[]> {
    if (msg instanceof MsgExecuteContractCompat) {
      return {
        MsgValue: [
          { name: 'sender', type: 'string' },
          { name: 'contract', type: 'string' },
          { name: 'msg', type: 'string' },
          { name: 'funds', type: 'string' },
        ]
      };
    } else {
      throw new Error('Type not support');
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

class MsgExecuteContractCompat extends MsgExecuteContract {
  constructor(msg: MsgExecuteContract) {
    super(msg.sender, msg.contract, msg.execute_msg, msg.coins);
  }

  toAmino(): MsgExecuteContract.Amino {
    return {
      type: 'wasmx/MsgExecuteContractCompat',
      value: {
        sender: this.sender,
        contract: this.contract,
        msg: JSON.stringify(this.execute_msg),
        funds: this.coins.toString() || '0',
      },
    } as any;
  }

  toProto(): MsgExecuteContract.Proto {
    return InjectiveWasmxV1Beta1Tx.MsgExecuteContractCompat.fromPartial({
      sender: this.sender,
      contract: this.contract,
      msg: JSON.stringify(this.execute_msg),
      funds: this.coins.toString() || '0',
    }) as any;
  }

  packAny(): Any {
    return Any.fromPartial({
      typeUrl: '/injective.wasmx.v1.MsgExecuteContractCompat',
      value: InjectiveWasmxV1Beta1Tx.MsgExecuteContractCompat.encode(this.toProto() as any).finish()
    });
  }
}
