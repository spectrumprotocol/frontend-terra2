import { Bech32Address } from "@keplr-wallet/cosmos";
import { ChainInfo } from "@keplr-wallet/types";

export function getChainInfo(chainId: string): ChainInfo {
  switch (chainId) {
    case 'injective-1':
      return {
        rpc: 'https://tm.injective.network', // 'https://k8s.global.mainnet.tm.injective.network:443',
        rest: 'https://lcd.injective.network', //'https://k8s.global.mainnet.lcd.injective.network:443',
        chainId: 'injective-1',
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
    case 'injective-888':
      return {
        rpc: 'https://k8s.testnet.tm.injective.network:443',
        rest: 'https://k8s.testnet.lcd.injective.network',
        chainId: 'injective-888',
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
    case 'phoenix-1':
      return {
        rpc: "https://mainnet-rpc-router.axelar-dev.workers.dev/chain/terra",
        rest: "https://phoenix-lcd.terra.dev",
        chainId: "phoenix-1",
        chainName: "Terra",
        stakeCurrency: {
          coinDenom: "LUNA",
          coinMinimalDenom: "uluna",
          coinDecimals: 6,
          coinGeckoId: "terra-luna-2",
        },
        bip44: {
          coinType: 330,
        },
        bech32Config: Bech32Address.defaultBech32Config("terra"),
        currencies: [
          {
            coinDenom: "LUNA",
            coinMinimalDenom: "uluna",
            coinDecimals: 6,
            coinGeckoId: "terra-luna-2",
          },
        ],
        feeCurrencies: [
          {
            coinDenom: "LUNA",
            coinMinimalDenom: "uluna",
            coinDecimals: 6,
            coinGeckoId: "terra-luna-2",
            gasPriceStep: {
              low: 0.015,
              average: 0.015,
              high: 0.015,
            },
          },
        ],
        features: ["ibc-transfer", "ibc-go"],
      };
    case 'pisco-1':
      return {
        rpc: "https://terra-testnet-rpc.polkachu.com",
        rest: "https://pisco-lcd.terra.dev",
        chainId: "pisco-1",
        chainName: "Terra Testnet",
        stakeCurrency: {
          coinDenom: "LUNA",
          coinMinimalDenom: "uluna",
          coinDecimals: 6,
          coinGeckoId: "terra-luna-2",
        },
        bip44: {
          coinType: 330,
        },
        bech32Config: Bech32Address.defaultBech32Config("terra"),
        currencies: [
          {
            coinDenom: "LUNA",
            coinMinimalDenom: "uluna",
            coinDecimals: 6,
            coinGeckoId: "terra-luna-2",
          },
        ],
        feeCurrencies: [
          {
            coinDenom: "LUNA",
            coinMinimalDenom: "uluna",
            coinDecimals: 6,
            coinGeckoId: "terra-luna-2",
            gasPriceStep: {
              low: 0.015,
              average: 0.015,
              high: 0.015,
            },
          },
        ],
        features: ["ibc-transfer", "ibc-go"],
      };
  }
}
