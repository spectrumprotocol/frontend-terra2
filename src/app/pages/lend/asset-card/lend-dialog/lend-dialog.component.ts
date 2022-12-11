import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Coin, MsgExecuteContract } from '@terra-money/terra.js';
import { fade } from '../../../../consts/animations';
import { toBase64 } from '../../../../libs/base64';
import { times } from '../../../../libs/math';
import { TerrajsService } from '../../../../services/terrajs.service';
import { GoogleAnalyticsService } from 'ngx-google-analytics';
import { InfoService } from '../../../../services/info.service';
import { Subscription } from 'rxjs';
import { LpBalancePipe } from '../../../../pipes/lp-balance.pipe';
import { TokenService } from '../../../../services/api/token.service';
import { MdbModalRef } from 'mdb-angular-ui-kit/modal';
import { PercentPipe } from '@angular/common';
import { RewardInfoPipe } from '../../../../pipes/reward-info.pipe';
import { LpSplitPipe } from '../../../../pipes/lp-split.pipe';
import { LpEarningPipe } from '../../../../pipes/lp-earning.pipe';
import { ConfigService } from '../../../../services/config.service';
import { UiUtilsService } from '../../../../services/ui-utils.service';
import { PercentSuperscriptPipe } from '../../../../pipes/percent-superscript.pipe';
import { TimeagoPipe } from 'src/app/pipes/timeago.pipe';
import { UnitPipe } from '../../../../pipes/unit.pipe';
import { LendingPool } from 'src/app/services/leverage.service';
import { LendingBankService } from 'src/app/services/api/lending-bank.service';

@Component({
  selector: 'app-lend-dialog',
  templateUrl: './lend-dialog.component.html',
  styleUrls: ['./lend-dialog.component.scss'],
  animations: [fade],
  providers: [LpBalancePipe, PercentPipe, RewardInfoPipe, LpSplitPipe, LpEarningPipe, PercentSuperscriptPipe, TimeagoPipe, UnitPipe]
})
export class LendDialogComponent implements OnInit, OnDestroy {
  pool: LendingPool;
  @ViewChild('formDeposit') formDeposit: NgForm;
  @ViewChild('formWithdraw') formWithdraw: NgForm;

  depositAmount: number;
  withdrawAmount: number;
  balanceBaseToken: string;
  private heightChanged: Subscription;

  constructor(
    public modalRef: MdbModalRef<LendDialogComponent>,
    public terrajs: TerrajsService,
    protected $gaService: GoogleAnalyticsService,
    public info: InfoService,
    private tokenService: TokenService,
    public lpEarningPipe: LpEarningPipe,
    public config: ConfigService,
    public uiUtil: UiUtilsService,
    private lendingBankService: LendingBankService,
  ) {
  }

  get disableDepositButton() {
    if (!this.formDeposit) {
      // prevent error when deposit form is not yet completely initialized
      return true;
    }
    return this.formDeposit?.invalid || !this.depositAmount;
  }

  get disableWithdrawButton() {
    if (!this.formWithdraw) {
      // prevent error when deposit form is not yet completely initialized
      return true;
    }
    return this.formWithdraw?.invalid || !this.withdrawAmount;
  }

  ngOnInit() {
    this.heightChanged = this.terrajs.heightChanged.subscribe(async () => {
      if (this.terrajs.isConnected) {
        this.refreshBalance();
      }
    });
  }

  ngOnDestroy() {
    this.heightChanged.unsubscribe();
  }

  async refreshBalance() {
    const ibToken = this.pool.ibTokenContract;
    this.balanceBaseToken = await this.lendingBankService.queryUnderlyingLiquidity(ibToken, this.info.tokenBalances[ibToken]);
  }

  setMaxDepositAmount() {
    this.depositAmount = +this.info.tokenBalances[this.pool.baseTokenContract] / this.pool.baseUnit;
  }

  setMaxWithdrawAmount() {
    this.withdrawAmount = +this.balanceBaseToken / this.pool.baseUnit;
  }

  async doDeposit() {
    if (this.disableDepositButton) {
      return;
    }

    const token = this.pool.baseTokenContract;
    const amount = times(this.depositAmount, this.pool.baseUnit);

    if (this.config.NATIVE_TOKEN_DENOMS.has(token)) {
      const msg = new MsgExecuteContract(
        this.terrajs.address,
        this.lendingBankService.contract,
        {
          deposit_native: {
            denom: token,
          },
        },
        [new Coin(token, amount)]
      );
      await this.terrajs.post([msg]);
    } else {
      const msg = {
        send: {
          amount,
          contract: this.lendingBankService.contract,
          msg: toBase64({ deposit_cw20: {} }),
        },
      };
      await this.tokenService.handle(token, msg);
    }

    this.depositAmount = undefined;
  }

  async doWithdraw() {
    if (this.disableWithdrawButton) {
      return;
    }

    const amount = this.withdrawAmount === +this.balanceBaseToken
      ? null
      : times(this.withdrawAmount, this.pool.baseUnit);

    const msg = new MsgExecuteContract(
      this.terrajs.address,
      this.lendingBankService.contract,
      {
        withdraw: {
          amount,
          asset_info: this.pool.baseAssetInfo,
        },
      }
    );
    await this.terrajs.post([msg]);

    this.withdrawAmount = undefined;
  }
}
