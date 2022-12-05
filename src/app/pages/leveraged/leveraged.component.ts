import {Component, HostListener, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Subscription} from 'rxjs';
import {TerrajsService} from '../../services/terrajs.service';
import {InfoService} from '../../services/info.service';
import {debounce} from 'utils-decorators';
import {PairStat, PoolInfo} from '../../services/farm_info/farm-info.service';
import {CONFIG} from '../../consts/config';
import {PairInfo} from '../../services/api/terraswap_factory/pair_info';
import {GoogleAnalyticsService} from 'ngx-google-analytics';
import {MdbModalService} from 'mdb-angular-ui-kit/modal';
import {MdbDropdownDirective} from 'mdb-angular-ui-kit/dropdown';
import { AssetInfo } from '../../services/api/astroport_pair/pair_info';

export interface Vault {
  baseSymbol: string;
  denomSymbol: string;
  baseDecimals: number;
  baseUnit: number;
  baseAssetInfo: AssetInfo;
  denomDecimals: number;
  denomUnit: number;
  denomAssetInfo: AssetInfo;
  lpToken: string;
  pairInfo: PairInfo;
  poolInfo: PoolInfo;
  pairStat: PairStat;
  name: string;
  unitDisplay: string;
  shortUnitDisplay: string;
  score: number;
  disabled: boolean;
  poolAprTotal: number;
}

export type SORT_BY = 'multiplier' | 'apy' | 'dpr' | 'tvl';

@Component({
  selector: 'app-leveraged-vault',
  templateUrl: './leveraged.component.html',
  styleUrls: ['./leveraged.component.scss']
})
export class LeveragedVaultComponent implements OnInit, OnDestroy {
  public innerWidth: any;
  loading = true;
  vaults: Vault[] = [];
  search: string;
  showDepositedPoolOnly = false;
  defaultSortBy: SORT_BY = 'multiplier';
  defaultActiveFarm = 'Active farms';
  sortBy: SORT_BY = this.defaultSortBy;
  activeFarm = this.defaultActiveFarm;
  UNIT = CONFIG.UNIT;
  myTvl = 0;
  height: number;
  isGrid: boolean;
  farmInfoDropdownList: string[];
  shouldBeGrid: boolean;
  @ViewChild('dropdownFarmFilter') dropdownFarmFilter: MdbDropdownDirective;
  @ViewChild('dropdownSortBy') dropdownSortBy: MdbDropdownDirective;
  private connected: Subscription;
  private heightChanged: Subscription;
  private onTransaction: Subscription;
  private lastSortBy: SORT_BY;
  private lastActiveFarm: string;

  private BLACKLIST: Set<string> = new Set(['']);


  constructor(
    public info: InfoService,
    public terrajs: TerrajsService,
    private modalService: MdbModalService,
    protected $gaService: GoogleAnalyticsService,
  ) {
    this.onResize(null);
  }

  async ngOnInit() {
    this.farmInfoDropdownList = [...new Set(this.info.farmInfos.filter(farmInfo => !this.BLACKLIST.has(farmInfo.farm)).map(farmInfo => farmInfo.farm))];
    this.showDepositedPoolOnly = localStorage.getItem('deposit') === 'true';
    this.loading = true;
    this.connected = this.terrajs.connected
      .subscribe(async connected => {
        this.loading = true;
        this.info.refreshSPECPool();
        await this.info.initializeVaultData(connected);
        this.refresh(true);
        this.loading = false;
        this.height = await this.terrajs.getHeight();
        this.lastSortBy = undefined;
      });

    this.onTransaction = this.terrajs.transactionComplete.subscribe(async () => {
      const tasks: Promise<any>[] = [];
      tasks.push(this.info.refreshNativeTokens());
      tasks.push(this.info.refreshRewardInfos());
      await Promise.all(tasks);
      if (this.showDepositedPoolOnly) {
        this.refresh();
      }
      await this.info.updateMyTvl();
    });
    this.heightChanged = this.terrajs.heightChanged.subscribe(async i => {
      if (this.loading || !i || document.hidden) {
        return;
      }
      if (i % 5 === 0) {
        await Promise.all([this.info.refreshSPECPool(), this.info.retrieveCachedStat(true)]);
        if (this.terrajs.isConnected) {
          await this.info.refreshRewardInfos();
          if (this.showDepositedPoolOnly) {
            this.refresh();
          }
          await this.info.updateMyTvl();
        }
      }
    });
  }

  setIsGrid(isGrid: boolean) {
    if (isGrid) {
      this.isGrid = true;
      localStorage.setItem('isGrid', 'true');
    } else {
      this.isGrid = false;
      localStorage.setItem('isGrid', 'false');
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.updateShouldBeGrid();
    if (this.shouldBeGrid || localStorage.getItem('isGrid') !== 'false') {
      this.isGrid = true;
    } else {
      this.isGrid = false;
    }
  }

  updateShouldBeGrid() {
    this.innerWidth = window.innerWidth;
    if (+this.innerWidth <= 575) {
      this.shouldBeGrid = true;
    } else {
      this.shouldBeGrid = false;
    }
  }

  ngOnDestroy() {
    this.connected.unsubscribe();
    this.heightChanged.unsubscribe();
    this.onTransaction.unsubscribe();
  }

  memoize(name: string) {
    if (name === 'deposit') {
      localStorage.setItem('deposit', `${this.showDepositedPoolOnly}`);
    }
  }

  @debounce(250)
  refresh(resetFilterOnEmpty?: boolean) {
    let vaults = this.activeFarm === 'Active farms'
      ? this.info.allVaults.filter(vault => !vault.disabled || (this.terrajs.isConnected && +this.info.rewardInfos[vault.poolInfo.key]?.bond_amount > 10))
      : this.activeFarm === 'Disabled farms'
        ? this.info.allVaults.filter(vault => vault.disabled)
        : this.info.allVaults.filter(vault => vault.poolInfo.farm === this.activeFarm && !vault.disabled);
    if (this.lastSortBy !== this.sortBy || this.lastActiveFarm !== this.activeFarm || !this.search) {
      switch (this.sortBy) {
        case 'multiplier':
          vaults.sort((a, b) => b.score - a.score);
          break;
        case 'apy':
          vaults.sort((a, b) => (b.pairStat?.poolApy || 0) - (a.pairStat?.poolApy || 0));
          break;
        case 'dpr':
          vaults.sort((a, b) => (b.pairStat?.dpr || 0) - (a.pairStat?.dpr || 0));
          break;
        case 'tvl':
          vaults.sort((a, b) => (+b.pairStat?.tvl || 0) - (+a.pairStat?.tvl || 0));
          break;
      }
      this.lastSortBy = this.sortBy;
      this.lastActiveFarm = this.activeFarm;
    }
    if (this.showDepositedPoolOnly) {
      const oldVaults = vaults;
      vaults = vaults.filter(it => +this.info.rewardInfos?.[it.poolInfo.key]?.bond_amount >= 10);
      if (vaults.length === 0 && resetFilterOnEmpty) {
        this.showDepositedPoolOnly = false;
        vaults = oldVaults;
      }
    }
    if (this.search) {
      vaults = vaults.filter(it => `${it.baseSymbol}${it.denomSymbol}`.toLowerCase().includes(this.search.replace(/-/g, '').toLowerCase()));
    }
    this.vaults = vaults;
    this.dropdownFarmFilter.hide();
    this.dropdownSortBy.hide();
  }

  vaultId = (_: number, item: Vault) => item.poolInfo.key;

}
