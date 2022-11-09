import BigNumber from 'bignumber.js';
import { div } from '../../libs/math';
import { PoolResponse } from '../api/terraswap_pair/pool_response';
import { getStablePrice } from '../../libs/stable';
import { InfoService } from '../info.service';
import { ConfigService } from "../config.service";
import {Denom} from '../../consts/denom';

export const balance_transform = (config: ConfigService, value: any, poolResponse: PoolResponse, poolResponseB?: PoolResponse) => {
  if (typeof value !== 'string' && typeof value !== 'number' || !poolResponse) {
    return undefined;
  }
  const asset0IsStableCoin = config.terrajs.isMainnet ? config.STABLE_COIN_DENOMS.has(poolResponse.assets[0].info.native_token?.['denom']) : config.STABLE_COIN_DENOMS.has(poolResponse.assets[0].info.token?.['contract_addr']);
  const asset1IsStableCoin = config.terrajs.isMainnet ? config.STABLE_COIN_DENOMS.has(poolResponse.assets[1].info.native_token?.['denom']) : config.STABLE_COIN_DENOMS.has(poolResponse.assets[1].info.token?.['contract_addr']);

  if (asset0IsStableCoin) {
    return new BigNumber(value)
      .times(poolResponse.assets[0].amount)
      .div(poolResponse.assets[1].amount)
      .toString();
  } else if (asset1IsStableCoin) {
    return new BigNumber(value)
      .times(poolResponse.assets[1].amount)
      .div(poolResponse.assets[0].amount)
      .toString();
  } else if (poolResponseB) {
    const basePrice = balance_transform(config, '1', poolResponseB);
    const baseAsset = poolResponseB.assets.find(asset => !config.STABLE_COIN_DENOMS.has(asset.info.native_token?.['denom']));
    const [assetA, assetB] = poolResponse.assets[0].info.token?.['contract_addr'] === baseAsset.info.token?.['contract_addr']
      ? [poolResponse.assets[0], poolResponse.assets[1]]
      : [poolResponse.assets[1], poolResponse.assets[0]];
    const assetPerBaseAsset = div(assetA.amount, assetB.amount);
    return new BigNumber(value)
      .times(assetPerBaseAsset)
      .times(basePrice)
      .toString();
  } else {
    return null;
  }
};

export const lp_balance_transform = (lp: any, info: InfoService, config: ConfigService, key: string) => {
  if ((typeof lp !== 'string' && typeof lp !== 'number') || !info.poolResponses[key]) {
    return undefined;
  }
  const poolResponse = info.poolResponses[key];
  const stableCoinDenoms = config.STABLE_COIN_DENOMS;

  if (stableCoinDenoms.has(poolResponse.assets[0].info.native_token?.['denom'])) {
    if (stableCoinDenoms.has(poolResponse.assets[1].info.native_token?.['denom'])) {
      const amount1 = new BigNumber(lp)
        .times(poolResponse.assets[0].amount)
        .div(poolResponse.total_share);
      const amount2 = new BigNumber(lp)
        .times(poolResponse.assets[1].amount)
        .div(poolResponse.total_share);
      return amount1.plus(amount2).toString();
    } else {
      return new BigNumber(lp)
        .times(poolResponse.assets[0].amount)
        .div(poolResponse.total_share)
        .times(2)
        .toString();
    }
  } else if (stableCoinDenoms.has(poolResponse.assets[1].info.native_token?.['denom'])) {
    return new BigNumber(lp)
      .times(poolResponse.assets[1].amount)
      .div(poolResponse.total_share)
      .times(2)
      .toString();
  } else {
    const dex = key.split('|')[0];
    const nativeToken = info.terrajs.isMainnet ? info.terrajs.settings.axlUsdcToken : info.terrajs.settings.stbToken;

    const asset1Token: string = poolResponse.assets[1].info.token
      ? poolResponse.assets[1].info.token?.['contract_addr']
      : poolResponse.assets[1].info.native_token?.['denom'];
    const token1Price = balance_transform(config, '1',
      info.poolResponses[`${dex}|${asset1Token}|${nativeToken}`] || info.poolResponses[`${dex}|${nativeToken}|${asset1Token}`]);
    if (token1Price) {
      if (info.pairInfos[key].pair_type?.['stable']) {
        const amp = info.ampStablePairs[key];
        const asset0Price = getStablePrice(+poolResponse.assets[0].amount, +poolResponse.assets[1].amount, +amp);
        const asset0Swap = new BigNumber(lp)
          .times(poolResponse.assets[0].amount)
          .div(poolResponse.total_share)
          .times(asset0Price)
          .integerValue(BigNumber.ROUND_DOWN);
        return new BigNumber(lp)
          .times(poolResponse.assets[1].amount)
          .div(poolResponse.total_share)
          .plus(asset0Swap)
          .times(token1Price)
          .toString();
      } else {
        return new BigNumber(lp)
          .times(poolResponse.assets[1].amount)
          .div(poolResponse.total_share)
          .times(token1Price)
          .times(2)
          .toString();
      }
    }

    const asset0Token: string = poolResponse.assets[0].info.token
      ? poolResponse.assets[0].info.token?.['contract_addr']
      : poolResponse.assets[0].info.native_token?.['denom'];
    const token0Price = balance_transform(config, '1',
      info.poolResponses[`${dex}|${asset0Token}|${nativeToken}`] || info.poolResponses[`${dex}|${nativeToken}|${asset0Token}`]);
    if (token0Price) {
      if (info.pairInfos[key].pair_type?.['stable']) {
        const amp = info.ampStablePairs[key];
        const asset1Price = getStablePrice(+poolResponse.assets[1].amount, +poolResponse.assets[0].amount, +amp);
        const asset1Swap = new BigNumber(lp)
          .times(poolResponse.assets[1].amount)
          .div(poolResponse.total_share)
          .times(asset1Price)
          .integerValue(BigNumber.ROUND_DOWN);
        return new BigNumber(lp)
          .times(poolResponse.assets[0].amount)
          .div(poolResponse.total_share)
          .plus(asset1Swap)
          .times(token0Price)
          .toString();
      } else {
        return new BigNumber(lp)
          .times(poolResponse.assets[0].amount)
          .div(poolResponse.total_share)
          .times(token0Price)
          .times(2)
          .toString();
      }
    }
    return null;
  }
};
