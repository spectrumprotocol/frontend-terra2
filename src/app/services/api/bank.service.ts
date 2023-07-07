import { Injectable } from '@angular/core';
import { Coin, Coins, MsgSend } from '@terra-money/terra.js';
import { APIParams, PaginationOptions } from '@terra-money/terra.js/dist/client/lcd/APIRequester';
import { TerrajsService } from '../terrajs.service';

@Injectable({
  providedIn: 'root'
})
export class BankService {

  constructor(
    private terrajs: TerrajsService,
  ) { }

  async balances(address?: string, pagination?: Partial<PaginationOptions & APIParams>): Promise<Coins> {
    // tslint:disable-next-line:prefer-const
    let [coins, pager] = await this.terrajs.lcdClient.bank.spendableBalances(address || this.terrajs.address, pagination);
    if (pager.next_key) {
      const next_coins = await this.balances(address, { 'pagination.key': pager.next_key });
      coins = coins.add(next_coins);
    }
    return coins;
  }

  // example how to use transfer
  // const abc = Coins.fromData([{
  //   denom: this.terrajs.settings.astroToken,
  //   amount: '1'
  // }]);
  // await this.bank.transfer(this.terrajs.address, abc.toData());
  transfer(to_address: string, amount: Coins.Data ) {
    return this.terrajs.post(MsgSend.fromData({
      '@type': '/cosmos.bank.v1beta1.MsgSend', amount, from_address: this.terrajs.address, to_address,
    }));
  }
}
