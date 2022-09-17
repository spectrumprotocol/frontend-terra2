import {Component, OnInit} from '@angular/core';
import {SpectrumAirdropService} from '../../services/api/spectrum-airdrop.service';
import {TerrajsService} from '../../services/terrajs.service';
import {ConfigResponse} from '../../services/api/spectrum_simple_airdrop/config_response';
import {catchError, Subscription, throwError} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {ModalService} from '../../services/modal.service';

@Component({
  selector: 'app-airdrop',
  templateUrl: './airdrop.component.html',
  styleUrls: ['./airdrop.component.scss']
})
export class AirdropComponent implements OnInit {

  configResponse: ConfigResponse = null;
  airdropInputAddress: string;
  userAirdropDetail: any;
  POSTDEPEG_LP_RATIO = 417115488643 / 926892707624;
  ONE_POSTDEPEG_CAN_CLAIM = 1;
  claimedAll = false;
  loading = false;
  notFound = false;
  searchAddress: string;
  private connected: Subscription;

  constructor(
    private airdropService: SpectrumAirdropService,
    private terrajs: TerrajsService,
    private httpClient: HttpClient,
    private modal: ModalService,
  ) {
  }

  get claimPeriodEnded() {
    return this.configResponse?.to_timestamp > Date.now();
  }

  ngOnInit(): void {
    if (this.terrajs.isConnected) {
      this.airdropInputAddress = this.terrajs.address;
    } else {
      this.connected = this.terrajs.connected.subscribe(async isConnected => {
        if (isConnected && this.terrajs.address) {
          this.airdropInputAddress = this.terrajs.address;
        }
      });
    }

  }

  checkAirdrop() {
    if (this.airdropInputAddress.trim().length !== 44) {
      return;
    }
    this.loading = true;
    this.searchAddress = this.airdropInputAddress.trim();
    const jsonUrl = `${window.location.origin}/assets/airdrop/${this.searchAddress.charAt(6)}_airdrop.json`;
    this.httpClient.get<any>(jsonUrl).pipe(
      catchError((error) => {
        console.error(error);
        this.userAirdropDetail = null;
        this.loading = false;
        this.notFound = true;
        return throwError(() => new Error('Unable to load airdrop json'));
      })
    ).subscribe(airdropJson => {
      const userAirdropDetail = airdropJson.find(record => record.address === this.searchAddress);
      if (userAirdropDetail) {
        this.userAirdropDetail = userAirdropDetail;
        this.loading = false;
        this.notFound = false;
      } else {
        this.userAirdropDetail = null;
        this.loading = false;
        this.notFound = true;
      }
    });

  }

  async claim() {
    if (this.terrajs.address !== this.userAirdropDetail.address) {
      await this.modal.alert('Connected wallet address must be the same as input address');
    } else {
      await this.airdropService.handle({
        claim: {
          claim_amount: this.userAirdropDetail.amount,
          merkle_proof: this.userAirdropDetail.merkle_proof,
          root_index: this.userAirdropDetail.index
        }
      });
    }
  }

  sumAirdropAmount(userAirdropDetail: any): number {
    return +userAirdropDetail.post_spec + +userAirdropDetail.post_gov + +userAirdropDetail.post_lp * this.POSTDEPEG_LP_RATIO + +userAirdropDetail.post_vault * this.POSTDEPEG_LP_RATIO;
  }
}
