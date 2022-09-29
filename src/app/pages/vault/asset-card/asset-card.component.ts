import {Component, Input, OnInit} from '@angular/core';
import {fade} from '../../../consts/animations';
import {Vault} from '../vault.component';
import {GoogleAnalyticsService} from 'ngx-google-analytics';
import {InfoService} from '../../../services/info.service';
import {LpBalancePipe} from '../../../pipes/lp-balance.pipe';
import {VaultDialogComponent} from './vault-dialog/vault-dialog.component';
import {MdbModalRef, MdbModalService} from 'mdb-angular-ui-kit/modal';
import {CONFIG} from '../../../consts/config';
import {TerrajsService} from '../../../services/terrajs.service';
import {ConfigService} from '../../../services/config.service';
import {UiUtilsService} from '../../../services/ui-utils.service';

@Component({
  selector: 'app-asset-card',
  templateUrl: './asset-card.component.html',
  styleUrls: ['./asset-card.component.scss'],
  animations: [fade],
  providers: [LpBalancePipe]
})
export class AssetCardComponent implements OnInit {
  @Input() isGrid: boolean;
  @Input() vault: Vault;

  UNIT = CONFIG.UNIT;

  modalRef: MdbModalRef<VaultDialogComponent>;

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
    this.modalRef = this.modalService.open(VaultDialogComponent, {
      modalClass: 'modal-vault-dialog modal-dialog',
      data: {
        vault: this.vault
      }
    });
  }
}
