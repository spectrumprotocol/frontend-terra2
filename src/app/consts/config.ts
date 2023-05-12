import { Any } from "@injectivelabs/core-proto-ts/cjs/google/protobuf/any";
import { AccAddress, Account, BaseAccount, PublicKey, SimplePublicKey } from "@terra-money/terra.js";
import { bech32 } from 'bech32';

export const CONFIG = {
  DIGIT: 6,
  UNIT: 1000000,  // 10^DIGIT
  TERRASWAP_COMMISSION: '0.003', // https://docs.terraswap.io/docs/introduction/trading_fees/
  ASTROPORT_XYK_COMMISSION: '0.002', // 0.001 for xASTRO holder https://docs.astroport.fi/astroport/tokenomics/astroport-tokenomics/fees
  ASTROPORT_STABLE_COMMISSION: '0.00025', // 0.00025 for xASTRO stakers
  ASTROPORT_XYK_COMMISSION_TOTAL: '0.003',
  ASTROPORT_STABLE_COMMISSION_TOTAL: '0.0005',
  GOOGLE_ANALYTICS_ID: 'G-F7M9C5B1BY',
  SLIPPAGE_TOLERANCE: '0.01',
  COMPOUND_TIMES_PER_YEAR: 365,
  BOND_ASSETS_MIN_RECEIVE_SLIPPAGE_TOLERANCE: 0.01,
  CHAIN_ID: process.env.CHAIN_ID || 'phoenix-1', // 'phoenix-1', // 'injective-1',
  IS_TERRA: false,
};

export const TERRA2_MAINNET_CHAINID = 'phoenix-1';
export const TERRA2_TESTNET_CHAINID = 'pisco-1';
export const INJECTIVE_MAINNET_CHAINID = 'injective-1';
export const INJECTIVE_TESTNET_CHAINID = 'injective-888';

CONFIG.IS_TERRA = CONFIG.CHAIN_ID === TERRA2_MAINNET_CHAINID || CONFIG.CHAIN_ID === TERRA2_TESTNET_CHAINID;

// HACK

if (CONFIG.CHAIN_ID.startsWith('injective')) {
  const oldAccountFromData = Account.fromData;
  Account.fromData = (data: any, isClassic?: boolean) => {
    if (data['@type'] === '/injective.types.v1beta1.EthAccount') {
      return BaseAccount.fromData(data.base_account, isClassic);
    }
    return oldAccountFromData(data, isClassic);
  };

  const oldAccAddressValidate = AccAddress.validate;
  AccAddress.validate = (data) => {
    const terraAddr = toChainAddress(data, 'terra');
    return oldAccAddressValidate(terraAddr);
  };

  const oldPublicKeyFromProto = PublicKey.fromProto;
  PublicKey.fromProto = (data) => {
    if (data.typeUrl === '/injective.crypto.v1beta1.ethsecp256k1.PubKey') {
      return new InjectivePublicKey(Buffer.from(data.value).toString('base64'));
    }
    return oldPublicKeyFromProto(data);
  }
}

function toChainAddress(addr: string, prefix: string) {
  if (addr.startsWith(prefix)) {
    return addr;
  }
  const data = bech32.decode(addr);
  return bech32.encode(prefix, data.words);
};

export class InjectivePublicKey extends SimplePublicKey {
  constructor(key: string) {
    super(key);
  }

  override packAny(): Any {
    const any = super.packAny();
    any.typeUrl = '/injective.crypto.v1beta1.ethsecp256k1.PubKey';
    return any;
  }
}
