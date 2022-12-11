import {Component, OnDestroy, OnInit} from '@angular/core';
import {TerrajsService} from '../../services/terrajs.service';
import {debounce} from 'utils-decorators';
import {Subscription} from 'rxjs';
import { InfoService } from 'src/app/services/info.service';
import { CONFIG } from 'src/app/consts/config';
import { LendingPool, LeverageService } from 'src/app/services/leverage.service';
import { LendingBankService } from 'src/app/services/api/lending-bank.service';

export type SORT_BY = 'apr' | 'tvl';

@Component({
  selector: 'app-lend',
  templateUrl: './lend.component.html',
  styleUrls: ['./lend.component.scss']
})
export class LendComponent implements OnInit, OnDestroy {
  loading = true;
  notFound = false;
  searchAddress: string;
  pools: LendingPool[] = [];
  balances: Record<string, string> = {};
  defaultSortBy: SORT_BY = 'tvl';
  sortBy: SORT_BY = this.defaultSortBy;
  UNIT = CONFIG.UNIT;
  private connected: Subscription;
  private heightChanged: Subscription;
  private onTransaction: Subscription;

  constructor(
    public terrajs: TerrajsService,
    public info: InfoService,
    private leverageService: LeverageService,
    private lendingBankService: LendingBankService,
  ) {
  }

  poolId = (_: number, item: LendingPool) => item.baseSymbol;

  ngOnInit(): void {
    this.connected = this.terrajs.connected.subscribe(() => {
      this.refresh();
    });

    this.onTransaction = this.terrajs.transactionComplete.subscribe(() => {
      this.refresh();
    });

    this.heightChanged = this.terrajs.heightChanged.subscribe((i) => {
      if (this.loading || !i || document.hidden) {
        return;
      }

      if (i % 5 === 0) {
        this.refresh();
      }
    });
  }

  ngOnDestroy() {
    this.connected.unsubscribe();
    this.heightChanged.unsubscribe();
    this.onTransaction.unsubscribe();
  }

  @debounce(250)
  async refresh() {
    await this.leverageService.initialize();
    await this.refreshBalances();

    const pools = [...this.leverageService.lendingPools];
    pools.sort((a, b) => +a.totalSupply - +b.totalSupply);

    this.pools = pools;
    this.loading = false;
  }

  async refreshBalances() {
    if (this.terrajs.connected) {
      const tasks = this.leverageService.lendingPools.map(async (pool) => {
        const ibToken = pool.ibTokenContract;
        const balance = await this.lendingBankService.queryUnderlyingLiquidity(
          ibToken,
          this.info.tokenBalances[ibToken]
        );

        this.balances[ibToken] = balance;
      });

      await Promise.all(tasks);
    }
  }
}
