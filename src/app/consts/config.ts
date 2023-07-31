import { Any } from '@terra-money/terra.proto/google/protobuf/any';
import { AccAddress, Account, BaseAccount, PublicKey, SimplePublicKey } from '@terra-money/terra.js';
import { bech32 } from 'bech32';
import { ChainInfo } from '@keplr-wallet/types';
import { Bech32Address } from '@keplr-wallet/cosmos';

export const TERRA2_MAINNET_CHAINID = 'phoenix-1';
export const TERRA2_TESTNET_CHAINID = 'pisco-1';
export const INJECTIVE_MAINNET_CHAINID = 'injective-1';
export const INJECTIVE_TESTNET_CHAINID = 'injective-888';
export const NEUTRON_MAINNET_CHAINID = 'neutron-1';
export const NEUTRON_TESTNET_CHAINID = 'pion-1';
export const SEI_TESTNET_CHAINID = 'atlantic-2';

export const INJECTIVE_MAINNET_RPC = 'https://tm.injective.network';
export const INJECTIVE_MAINNET_REST = 'https://lcd.injective.network';
export const INJECTIVE_TESTNET_RPC = 'https://k8s.testnet.tm.injective.network:443';
export const INJECTIVE_TESTNET_REST = 'https://k8s.testnet.lcd.injective.network';
export const TERRA2_MAINNET_RPC = 'https://mainnet-rpc-router.axelar-dev.workers.dev/chain/terra';
export const TERRA2_MAINNET_REST = 'https://phoenix-lcd.terra.dev';
export const TERRA2_TESTNET_RPC = 'https://terra-testnet-rpc.polkachu.com';
export const TERRA2_TESTNET_REST = 'https://pisco-lcd.terra.dev';
export const NEUTRON_MAINNET_RPC = 'https://rpc-neutron.keplr.app';
export const NEUTRON_MAINNET_REST = 'https://lcd-neutron.keplr.app';
export const NEUTRON_TESTNET_RPC = 'https://rpc-palvus.pion-1.ntrn.tech';
export const NEUTRON_TESTNET_REST = 'https://rest-palvus.pion-1.ntrn.tech';
export const SEI_TESTNET_RPC = 'https://rpc.wallet.atlantic-2.sei.io';
export const SEI_TESTNET_REST = 'https://rest.wallet.atlantic-2.sei.io';

interface Brand {
  brand: string;
  icon: string;
  finderName: string;
  finderUrl(finder: string, network: string, address: string): string;
}

type ChainInfoEx = ChainInfo & Brand;

export const chainInfos: Record<string, ChainInfoEx> = {
  [INJECTIVE_MAINNET_CHAINID]: {
    rpc: INJECTIVE_MAINNET_RPC, // 'https://k8s.global.mainnet.tm.injective.network:443',
    rest: INJECTIVE_MAINNET_REST, // 'https://k8s.global.mainnet.lcd.injective.network:443',
    chainId: INJECTIVE_MAINNET_CHAINID,
    chainName: 'Injective',
    brand: 'Injective',
    icon: '/assets/INJ.png',
    finderName: 'Injective Explorer',
    finderUrl(finder, _, address) {
      return `${finder}/account/${address}`
    },
    stakeCurrency: {
      coinDenom: 'INJ',
      coinMinimalDenom: 'inj',
      coinDecimals: 18,
      coinGeckoId: 'injective-protocol',
    },
    walletUrl: 'https://hub.injective.network/',
    walletUrlForStaking: 'https://hub.injective.network/',
    bip44: {
      coinType: 60,
    },
    bech32Config: Bech32Address.defaultBech32Config('inj'),
    currencies: [
      {
        coinDenom: 'INJ',
        coinMinimalDenom: 'inj',
        coinDecimals: 18,
        coinGeckoId: 'injective-protocol',
      },
    ],
    feeCurrencies: [
      {
        coinDenom: 'INJ',
        coinMinimalDenom: 'inj',
        coinDecimals: 18,
        coinGeckoId: 'injective-protocol',
        gasPriceStep: {
          low: 500000000,
          average: 1000000000,
          high: 1500000000
        }
      },
    ],
    features: ['ibc-transfer', 'ibc-go', 'eth-address-gen', 'eth-key-sign'],
  },
  [INJECTIVE_TESTNET_CHAINID]: {
    rpc: INJECTIVE_TESTNET_RPC,
    rest: INJECTIVE_TESTNET_REST,
    chainId: INJECTIVE_TESTNET_CHAINID,
    chainName: 'Injective Testnet',
    brand: 'Injective',
    icon: '/assets/INJ.png',
    finderName: 'Injective Explorer',
    finderUrl(finder, _, address) {
      return `${finder}/account/${address}`
    },
    stakeCurrency: {
      coinDenom: 'INJ',
      coinMinimalDenom: 'inj',
      coinDecimals: 18,
      coinGeckoId: 'injective-protocol',
    },
    walletUrl: 'https://hub.injective.dev/',
    walletUrlForStaking: 'https://hub.injective.dev/',
    bip44: {
      coinType: 60,
    },
    bech32Config: Bech32Address.defaultBech32Config('inj'),
    currencies: [
      {
        coinDenom: 'INJ',
        coinMinimalDenom: 'inj',
        coinDecimals: 18,
        coinGeckoId: 'injective-protocol',
      },
    ],
    feeCurrencies: [
      {
        coinDenom: 'INJ',
        coinMinimalDenom: 'inj',
        coinDecimals: 18,
        coinGeckoId: 'injective-protocol',
        gasPriceStep: {
          low: 500000000,
          average: 1000000000,
          high: 1500000000
        }
      },
    ],
    coinType: 60,
    features: ['ibc-transfer', 'ibc-go', 'eth-address-gen', 'eth-key-sign'],
  },
  [TERRA2_MAINNET_CHAINID]: {
    rpc: TERRA2_MAINNET_RPC,
    rest: TERRA2_MAINNET_REST,
    chainId: TERRA2_MAINNET_CHAINID,
    chainName: 'Terra',
    brand: 'Terra',
    icon: '/assets/luna.png',
    finderName: 'Terra Finder',
    finderUrl(finder, network, address) {
      return `${finder}/${network}/account/${address}`;
    },
    stakeCurrency: {
      coinDenom: 'LUNA',
      coinMinimalDenom: 'uluna',
      coinDecimals: 6,
      coinGeckoId: 'terra-luna-2',
    },
    bip44: {
      coinType: 330,
    },
    bech32Config: Bech32Address.defaultBech32Config('terra'),
    currencies: [
      {
        coinDenom: 'LUNA',
        coinMinimalDenom: 'uluna',
        coinDecimals: 6,
        coinGeckoId: 'terra-luna-2',
      },
    ],
    feeCurrencies: [
      {
        coinDenom: 'LUNA',
        coinMinimalDenom: 'uluna',
        coinDecimals: 6,
        coinGeckoId: 'terra-luna-2',
        gasPriceStep: {
          low: 0.015,
          average: 0.015,
          high: 0.015,
        },
      },
    ],
    features: ['ibc-transfer', 'ibc-go'],
  },
  [TERRA2_TESTNET_CHAINID]: {
    rpc: TERRA2_TESTNET_RPC,
    rest: TERRA2_TESTNET_REST,
    chainId: TERRA2_TESTNET_CHAINID,
    chainName: 'Terra Testnet',
    brand: 'Terra',
    icon: '/assets/luna.png',
    finderName: 'Terra Finder',
    finderUrl(finder, network, address) {
      return `${finder}/${network}/account/${address}`;
    },
    stakeCurrency: {
      coinDenom: 'LUNA',
      coinMinimalDenom: 'uluna',
      coinDecimals: 6,
      coinGeckoId: 'terra-luna-2',
    },
    bip44: {
      coinType: 330,
    },
    bech32Config: Bech32Address.defaultBech32Config('terra'),
    currencies: [
      {
        coinDenom: 'LUNA',
        coinMinimalDenom: 'uluna',
        coinDecimals: 6,
        coinGeckoId: 'terra-luna-2',
      },
    ],
    feeCurrencies: [
      {
        coinDenom: 'LUNA',
        coinMinimalDenom: 'uluna',
        coinDecimals: 6,
        coinGeckoId: 'terra-luna-2',
        gasPriceStep: {
          low: 0.015,
          average: 0.015,
          high: 0.015,
        },
      },
    ],
    features: ['ibc-transfer', 'ibc-go'],
  },
  [NEUTRON_MAINNET_CHAINID]: {
    rpc: NEUTRON_MAINNET_RPC,
    rest: NEUTRON_MAINNET_REST,
    chainId: NEUTRON_MAINNET_CHAINID,
    chainName: 'Neutron',
    brand: 'Neutron',
    icon: '/assets/luna.png',
    finderName: 'Neutron Explorer',
    finderUrl(finder, network, address) {
      return `${finder}/${network}/account/${address}`;
    },
    chainSymbolImageUrl: 'https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/neutron/chain.png',
    stakeCurrency: {
      coinDenom: 'STAKE',
      coinMinimalDenom: 'ustake',
      coinDecimals: 6
    },
    bip44: {
      coinType: 118
    },
    bech32Config: {
      bech32PrefixAccAddr: 'neutron',
      bech32PrefixAccPub: 'neutronpub',
      bech32PrefixValAddr: 'neutronvaloper',
      bech32PrefixValPub: 'neutronvaloperpub',
      bech32PrefixConsAddr: 'neutronvalcons',
      bech32PrefixConsPub: 'neutronvalconspub'
    },
    currencies: [
      {
        coinDenom: 'NTRN',
        coinMinimalDenom: 'untrn',
        coinDecimals: 6,
        coinImageUrl: 'https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/neutron/untrn.png'
      },
      {
        coinDenom: 'STAKE',
        coinMinimalDenom: 'ustake',
        coinDecimals: 6
      }
    ],
    feeCurrencies: [
      {
        coinDenom: 'NTRN',
        coinMinimalDenom: 'untrn',
        coinDecimals: 6,
        gasPriceStep: {
          low: 0.01,
          average: 0.01,
          high: 0.01
        }
      },
      {
        coinDenom: 'ATOM',
        coinMinimalDenom: 'ibc/C4CFF46FD6DE35CA4CF4CE031E643C8FDC9BA4B99AE598E9B0ED98FE3A2319F9',
        coinDecimals: 6,
        gasPriceStep: {
          low: 0.005,
          average: 0.005,
          high: 0.005
        }
      },
      {
        coinDenom: 'USDC',
        coinMinimalDenom: 'ibc/F082B65C88E4B6D5EF1DB243CDA1D331D002759E938A0F5CD3FFDC5D53B3E349',
        coinDecimals: 6,
        gasPriceStep: {
          low: 0.05,
          average: 0.05,
          high: 0.05
        }
      }
    ],
    features: ['cosmwasm']
  },
  [NEUTRON_TESTNET_CHAINID]: {
    rpc: NEUTRON_TESTNET_RPC,
    rest: NEUTRON_TESTNET_REST,
    chainId: NEUTRON_TESTNET_CHAINID,
    chainName: 'Neutron Testnet',
    brand: 'Neutron',
    icon: '/assets/luna.png',
    finderName: 'Neutron Explorer',
    finderUrl(finder, network, address) {
      return `${finder}/${network}/account/${address}`;
    },
    chainSymbolImageUrl: 'https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/neutron/chain.png',
    stakeCurrency: {
      coinDenom: 'STAKE',
      coinMinimalDenom: 'ustake',
      coinDecimals: 6
    },
    bip44: {
      coinType: 118
    },
    bech32Config: {
      bech32PrefixAccAddr: 'neutron',
      bech32PrefixAccPub: 'neutronpub',
      bech32PrefixValAddr: 'neutronvaloper',
      bech32PrefixValPub: 'neutronvaloperpub',
      bech32PrefixConsAddr: 'neutronvalcons',
      bech32PrefixConsPub: 'neutronvalconspub'
    },
    currencies: [
      {
        coinDenom: 'NTRN',
        coinMinimalDenom: 'untrn',
        coinDecimals: 6
      }
    ],
    feeCurrencies: [
      {
        coinDenom: 'NTRN',
        coinMinimalDenom: 'untrn',
        coinDecimals: 6,
        gasPriceStep: {
          low: 0.01,
          average: 0.01,
          high: 0.01
        }
      }
    ],
    features: []
  },
  [SEI_TESTNET_CHAINID]: {
    rpc: SEI_TESTNET_RPC,
    rest: SEI_TESTNET_REST,
    chainId: SEI_TESTNET_CHAINID,
    chainName: 'Sei Testnet',
    brand: 'Sei',
    icon: '/assets/luna.png',
    finderName: 'Sei Explorer',
    finderUrl(finder, _, address) {
      return `${finder}/account/${address}`
    },
    chainSymbolImageUrl: 'https://raw.githubusercontent.com/neutron-org/chain-registry/master/testnets/seitestnet/images/sei.png',
    bip44: {
      coinType: 118
    },
    stakeCurrency: {
      coinDenom: 'SEI',
      coinMinimalDenom: 'usei',
      coinDecimals: 6
    },
    bech32Config: {
      bech32PrefixAccAddr: 'sei',
      bech32PrefixAccPub: 'seipub',
      bech32PrefixValAddr: 'seivaloper',
      bech32PrefixValPub: 'seivaloperpub',
      bech32PrefixConsAddr: 'seivalcons',
      bech32PrefixConsPub: 'seivalconspub'
    },
    currencies: [
      {
        coinDenom: 'SEI',
        coinMinimalDenom: 'usei',
        coinDecimals: 6
      }
    ],
    feeCurrencies: [
      {
        coinDenom: 'SEI',
        coinMinimalDenom: 'usei',
        coinDecimals: 6,
        gasPriceStep: {
          low: 0.01,
          average: 0.02,
          high: 0.03
        }
      }
    ]
  }
};

export type CHAIN_BRAND = string;

export const getChainIdToLoad = () => {
  switch (window.location.hostname) {
    case 'terra.spec.finance':
      return TERRA2_MAINNET_CHAINID;
    case 'injective.spec.finance':
      return INJECTIVE_MAINNET_CHAINID;
    default:
      return INJECTIVE_TESTNET_CHAINID;
  }
};

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
  CHAIN_ID: getChainIdToLoad(), // 'phoenix-1', // 'injective-1',
};

export const getCurrentChainBrand = (): CHAIN_BRAND => {
  return chainInfos[CONFIG.CHAIN_ID]?.brand;
};

export type CHAIN_ID_ENUM = string;

// HACK
if (CONFIG.CHAIN_ID.startsWith('injective')) {
  const oldAccountFromData = Account.fromData;
  Account.fromData = (data: any, isClassic?: boolean) => {
    if (data['@type'] === '/injective.types.v1beta1.EthAccount') {
      return BaseAccount.fromData(data.base_account, isClassic);
    }
    return oldAccountFromData(data, isClassic);
  };

  const oldPublicKeyFromProto = PublicKey.fromProto;
  PublicKey.fromProto = (data) => {
    if (data.typeUrl === '/injective.crypto.v1beta1.ethsecp256k1.PubKey') {
      return new InjectivePublicKey(Buffer.from(data.value).toString('base64'));
    }
    return oldPublicKeyFromProto(data);
  };
}

if (getCurrentChainBrand() !== 'Terra') {
  const oldAccAddressValidate = AccAddress.validate;
  AccAddress.validate = (data) => {
    const terraAddr = toChainAddress(data, 'terra');
    return oldAccAddressValidate(terraAddr);
  };
}

function toChainAddress(addr: string, prefix: string) {
  if (addr.startsWith(prefix)) {
    return addr;
  }
  const data = bech32.decode(addr);
  return bech32.encode(prefix, data.words);
}

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


export const getAddressPlaceHolder = (): string => {
  switch (getCurrentChainBrand()) {
    case 'Terra':
      return 'Input Terra Address';
    case 'Injective':
      return 'Input Injective Address';
    case 'Neutron':
      return 'Input Neutron Address';
    case 'Sei':
      return 'Input Sei Address';
  }
};

export const getAddressPattern = (): string => {
  switch (getCurrentChainBrand()) {
    case 'Terra':
      return '(^terra1[a-z0-9]{38}$)|(^terra1[a-z0-9]{58}$)';
    case 'Injective':
      return '(^inj1[a-z0-9]{38}$)|(^inj1[a-z0-9]{58}$)';
    case 'Neutron':
      return '(^neutron1[a-z0-9]{38}$)|(^neutron1[a-z0-9]{58}$)';
    case 'Sei':
      return '(^sei1[a-z0-9]{38}$)|(^sei1[a-z0-9]{58}$)';
  }
};
