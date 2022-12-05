import {Component, OnInit} from '@angular/core';
import {TerrajsService} from '../../services/terrajs.service';
import {debounce} from 'utils-decorators';
import {catchError, Subscription, throwError} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {ModalService} from '../../services/modal.service';
import { AssetInfo } from '../../services/api/astroport_pair/pair_info';
import { InfoService } from 'src/app/services/info.service';
import { CONFIG } from 'src/app/consts/config';

export interface LendingPool {
  name: string;
  baseSymbol: string;
  ibToken: string;
  score: number;
  disabled: boolean;
  poolAprTotal: number;
  totalBorrow: number,
  totalSupply: number,
  utilization: number,
}

export type SORT_BY = 'apr' | 'tvl';

@Component({
  selector: 'app-lend',
  templateUrl: './lend.component.html',
  styleUrls: ['./lend.component.scss']
})
export class LendComponent implements OnInit {


  loading = false;
  notFound = false;
  searchAddress: string;
  pools: LendingPool[] = [
    {
      name: "LUNA",
      baseSymbol: "LUNA",
      ibToken: "xxx",
      score: 100,
      disabled: false,
      poolAprTotal: 0.28,
      totalSupply: 1000,
      totalBorrow: 100,
      utilization: 0.1,
    },
    {
      name: "VKR",
      baseSymbol: "VKR",
      ibToken: "xxx",
      score: 100,
      disabled: false,
      poolAprTotal: 0.01,
      totalSupply: 8000,
      totalBorrow: 780,
      utilization: 0.0975,
    }
  ];
  defaultSortBy: SORT_BY = 'tvl';
  sortBy: SORT_BY = this.defaultSortBy;
  UNIT = CONFIG.UNIT;
  private connected: Subscription;

  constructor(
    public terrajs: TerrajsService,
    public info: InfoService,
    private modal: ModalService,
  ) {
  }

  poolId = (_: number, item: LendingPool) => item.baseSymbol;

  ngOnInit(): void {
    if (this.terrajs.isConnected) {
    } else {
      this.connected = this.terrajs.connected.subscribe(async isConnected => {
        if (isConnected && this.terrajs.address) {

        }
      });
    }

  }

  @debounce(250)
  refresh(resetFilterOnEmpty?: boolean) {
  }
}
