import { Bech32Address } from '@keplr-wallet/cosmos';
import { ChainInfo } from '@keplr-wallet/types';
import {
  INJECTIVE_MAINNET_CHAINID,
  INJECTIVE_TESTNET_CHAINID,
  NEUTRON_MAINNET_CHAINID,
  NEUTRON_TESTNET_CHAINID,
  SEI_TESTNET_CHAINID,
  TERRA2_MAINNET_CHAINID,
  TERRA2_TESTNET_CHAINID
} from 'src/app/consts/config';

export function getChainInfo(chainId: string): ChainInfo {
  switch (chainId) {
    case INJECTIVE_MAINNET_CHAINID:
      return {
        rpc: 'https://tm.injective.network', // 'https://k8s.global.mainnet.tm.injective.network:443',
        rest: 'https://lcd.injective.network', // 'https://k8s.global.mainnet.lcd.injective.network:443',
        chainId: INJECTIVE_MAINNET_CHAINID,
        chainName: 'Injective',
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
      };
    case INJECTIVE_TESTNET_CHAINID:
      return {
        rpc: 'https://k8s.testnet.tm.injective.network:443',
        rest: 'https://k8s.testnet.lcd.injective.network',
        chainId: INJECTIVE_TESTNET_CHAINID,
        chainName: 'Injective Testnet',
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
      };
    case TERRA2_MAINNET_CHAINID:
      return {
        rpc: 'https://mainnet-rpc-router.axelar-dev.workers.dev/chain/terra',
        rest: 'https://phoenix-lcd.terra.dev',
        chainId: TERRA2_MAINNET_CHAINID,
        chainName: 'Terra',
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
      };
    case TERRA2_TESTNET_CHAINID:
      return {
        rpc: 'https://terra-testnet-rpc.polkachu.com',
        rest: 'https://pisco-lcd.terra.dev',
        chainId: TERRA2_TESTNET_CHAINID,
        chainName: 'Terra Testnet',
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
      };
    case NEUTRON_MAINNET_CHAINID:
      return {
        rpc: 'https://rpc-neutron.keplr.app',
        rest: 'https://lcd-neutron.keplr.app',
        chainId: NEUTRON_MAINNET_CHAINID,
        chainName: 'Neutron',
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
      };
      case NEUTRON_TESTNET_CHAINID:
        return {
          rpc: 'https://rpc-palvus.pion-1.ntrn.tech',
          rest: 'https://rest-palvus.pion-1.ntrn.tech',
          chainId: NEUTRON_TESTNET_CHAINID,
          chainName: 'Neutron Testnet',
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
        };
      case SEI_TESTNET_CHAINID:
        return {
          rpc: 'https://rpc.wallet.atlantic-2.sei.io',
          rest: 'https://rest.wallet.atlantic-2.sei.io',
          chainId: SEI_TESTNET_CHAINID,
          chainName: 'Sei Testnet',
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
        };
  }
}
