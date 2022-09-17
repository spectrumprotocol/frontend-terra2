import { Pipe, PipeTransform } from '@angular/core';
import {RewardInfoResponseItem} from '../services/farm_info/farm-info.service';

// const secondsPerYear = 365 * 24 * 60 * 60;

@Pipe({
  name: 'lpEarning'
})
export class LpEarningPipe implements PipeTransform {

  constructor(
    // private decimalPipe: DecimalPipe,
  ) { }

  transform(rewardInfo: Partial<RewardInfoResponseItem>): number {
    if (!rewardInfo || !rewardInfo.deposit_amount) {
      return undefined;
    }

    const depositAmount = +rewardInfo.deposit_amount || 0;
    const bondAmount = +rewardInfo.bond_amount || 0;
    if (depositAmount >= bondAmount) {
      return undefined;
    }

    return bondAmount - depositAmount;
    // const earning = (bondAmount - depositAmount) / CONFIG.UNIT;
    // return `+${this.decimalPipe.transform(earning)}`;
    // const secondsDeposit = Date.now() / 1000 - rewardInfo.deposit_time;
    // const earningPerYear = earning * secondsPerYear / secondsDeposit;
    // const apr = earningPerYear * 100 / depositAmount;
    // return `+${this.decimalPipe.transform(earning, '1.0-5')} (${this.decimalPipe.transform(apr, '1.0-2')}% LP APR)`;
  }
}
