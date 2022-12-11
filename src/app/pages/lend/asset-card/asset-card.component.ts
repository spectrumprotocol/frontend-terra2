import {Component, Input, OnInit} from '@angular/core';
import {fade} from '../../../consts/animations';
import {GoogleAnalyticsService} from 'ngx-google-analytics';
import {InfoService} from '../../../services/info.service';
import {LpBalancePipe} from '../../../pipes/lp-balance.pipe';
import {LendDialogComponent} from './lend-dialog/lend-dialog.component';
import {MdbModalRef, MdbModalService} from 'mdb-angular-ui-kit/modal';
import {CONFIG} from '../../../consts/config';
import {TerrajsService} from '../../../services/terrajs.service';
import {ConfigService} from '../../../services/config.service';
import { LendingPool } from 'src/app/services/leverage.service';

@Component({
  selector: 'app-lend-asset-card',
  templateUrl: './asset-card.component.html',
  styleUrls: ['./asset-card.component.scss'],
  animations: [fade],
  providers: [LpBalancePipe]
})
export class LendAssetCardComponent implements OnInit {
  @Input() pool: LendingPool;
  @Input() balance: string;

  UNIT = CONFIG.UNIT;

  modalRef: MdbModalRef<LendDialogComponent>;

  constructor(
    protected $gaService: GoogleAnalyticsService,
    public info: InfoService,
    private terrajs: TerrajsService,
    private modalService: MdbModalService,
    public config: ConfigService,
  ) {
  }

  ngOnInit() {
  }

  async openModal() {
    this.modalRef = this.modalService.open(LendDialogComponent, {
      modalClass: 'modal-vault-dialog modal-dialog',
      data: {
        pool: this.pool,
      }
    });
  }
}
