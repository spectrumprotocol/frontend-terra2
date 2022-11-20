import BigNumber from 'bignumber.js';
import { div } from '../../libs/math';
import { AssetInfo, PoolResponse } from '../api/terraswap_pair/pool_response';
import { getStablePrice } from '../../libs/stable';
import { InfoService } from '../info.service';
import { ConfigService } from "../config.service";

export const balance_transform = (stableCoinDenoms: Set<string>, value: any, poolResponse: PoolResponse, poolResponseB?: PoolResponse) => {
  if (typeof value !== 'string' && typeof value !== 'number' || !poolResponse) {
    return undefined;
  }
  const asset0IsStableCoin = isAssetStableCoin(stableCoinDenoms, poolResponse.assets[0].info);
  const asset1IsStableCoin = isAssetStableCoin(stableCoinDenoms, poolResponse.assets[1].info);

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
    const basePrice = balance_transform(stableCoinDenoms, '1', poolResponseB);
    const baseAsset = poolResponseB.assets.find(asset => !isAssetStableCoin(stableCoinDenoms, asset.info));
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

const isAssetStableCoin = (stableCoinDenoms: Set<string>, assetInfo: AssetInfo) => {
  return stableCoinDenoms.has(assetInfo.native_token?.['denom'] || assetInfo.token?.['contract_addr'])
};

export const lp_balance_transform = (lp: any, info: InfoService, config: ConfigService, key: string) => {
  if ((typeof lp !== 'string' && typeof lp !== 'number') || !info.poolResponses[key]) {
    return undefined;
  }
  const poolResponse = info.poolResponses[key];
  const stableCoinDenoms = config.STABLE_COIN_DENOMS;
  const asset0IsStableCoin = isAssetStableCoin(stableCoinDenoms, poolResponse.assets[0].info);
  const asset1IsStableCoin = isAssetStableCoin(stableCoinDenoms, poolResponse.assets[1].info);

  if (asset0IsStableCoin) {
    if (asset1IsStableCoin) {
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
  } else if (asset1IsStableCoin) {
    return new BigNumber(lp)
      .times(poolResponse.assets[1].amount)
      .div(poolResponse.total_share)
      .times(2)
      .toString();
  } else {
    const dex = key.split('|')[0];
    const [stableCoin] = stableCoinDenoms;

    const asset1Token: string = poolResponse.assets[1].info.token
      ? poolResponse.assets[1].info.token?.['contract_addr']
      : poolResponse.assets[1].info.native_token?.['denom'];
    const token1Price = balance_transform(stableCoinDenoms, '1',
      info.poolResponses[`${dex}|${asset1Token}|${stableCoin}`] || info.poolResponses[`${dex}|${stableCoin}|${asset1Token}`]);
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
    const token0Price = balance_transform(stableCoinDenoms, '1',
      info.poolResponses[`${dex}|${asset0Token}|${stableCoin}`] || info.poolResponses[`${dex}|${stableCoin}|${asset0Token}`]);
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
