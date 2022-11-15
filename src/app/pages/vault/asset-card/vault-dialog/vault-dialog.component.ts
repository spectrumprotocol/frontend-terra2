import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NgForm, NgModel } from '@angular/forms';
import { Coin, MsgExecuteContract } from '@terra-money/terra.js';
import { fade } from '../../../../consts/animations';
import { CONFIG } from '../../../../consts/config';
import { toBase64 } from '../../../../libs/base64';
import { floorSixDecimal, gt, ceilSixDecimal, times } from '../../../../libs/math';
import { TerrajsService } from '../../../../services/terrajs.service';
import { Vault } from '../../vault.component';
import { GoogleAnalyticsService } from 'ngx-google-analytics';
import { CompoundStat, InfoService } from '../../../../services/info.service';
import { Subscription } from 'rxjs';
import BigNumber from 'bignumber.js';
import { debounce, memoizeAsync } from 'utils-decorators';
import { LpBalancePipe } from '../../../../pipes/lp-balance.pipe';
import { TokenService } from '../../../../services/api/token.service';
import { TerraSwapService } from '../../../../services/api/terraswap.service';
import { Denom } from '../../../../consts/denom';
import { MdbModalRef } from 'mdb-angular-ui-kit/modal';
import { TerraSwapRouterService } from '../../../../services/api/terraswap-router.service';
import { AstroportService } from '../../../../services/api/astroport.service';
import { PercentPipe } from '@angular/common';
import { AstroportRouterService } from '../../../../services/api/astroport-router.service';
import { RewardInfoPipe } from '../../../../pipes/reward-info.pipe';
import { LpSplitPipe } from '../../../../pipes/lp-split.pipe';
import { LpEarningPipe } from '../../../../pipes/lp-earning.pipe';
import { ConfigService } from '../../../../services/config.service';
import { Decimal } from '../../../../services/api/astroport_router/execute_msg';
import { FarmExecuteMsg } from '../../../../services/api/spectrum_astroport_farm/execute_msg';
import { SpectrumCompoundProxyService } from '../../../../services/api/spectrum-compound-proxy.service';
import { Asset } from '../../../../services/api/terraswap_pair/pool_response';
import { UiUtilsService } from '../../../../services/ui-utils.service';
import { PercentSuperscriptPipe } from '../../../../pipes/percent-superscript.pipe';
import { TimeagoPipe } from 'src/app/pipes/timeago.pipe';
import { UnitPipe } from '../../../../pipes/unit.pipe';
import { WasmService } from '../../../../services/api/wasm.service';
import { SpectrumAstroportGenericFarmService } from '../../../../services/api/spectrum-astroport-generic-farm.service';
import { Clipboard } from '@angular/cdk/clipboard';
import { ModalService } from '../../../../services/modal.service';

const DEPOSIT_FEE = '0';
export type DEPOSIT_WITHDRAW_MODE_ENUM = 'tokentoken' | 'lp';
export type WITHDRAW_INPUT_TYPE = 'lp' | 'ctoken';

@Component({
  selector: 'app-vault-dialog',
  templateUrl: './vault-dialog.component.html',
  styleUrls: ['./vault-dialog.component.scss'],
  animations: [fade],
  providers: [LpBalancePipe, PercentPipe, RewardInfoPipe, LpSplitPipe, LpEarningPipe, PercentSuperscriptPipe, TimeagoPipe, UnitPipe]
})
export class VaultDialogComponent implements OnInit, OnDestroy {
  vault: Vault;
  @ViewChild('formDeposit') formDeposit: NgForm;
  @ViewChild('formWithdraw') formWithdraw: NgForm;
  @ViewChild('depositTokenAAmtTokenTokenCtl') depositTokenAAmtTokenTokenCtl: NgModel;
  @ViewChild('depositTokenBAmtTokenTokenCtl') depositTokenBAmtTokenTokenCtl: NgModel;

  UNIT: number = CONFIG.UNIT;
  SLIPPAGE = CONFIG.SLIPPAGE_TOLERANCE;
  // naming convention: actual input field, input mode
  depositTokenAAmtTokenToken: number;
  excessTokenAAmtTokenToken: number;
  depositLPAmtLP: number;
  depositTokenBAmtTokenToken: number;
  depositTokenAmtSingleToken: number;
  tokenAToBeStatic = true;
  lpBalanceInfo: string;
  iLInfo: string;
  depositType: 'compound' | 'speclp';
  depositMode: DEPOSIT_WITHDRAW_MODE_ENUM;
  withdrawMode: DEPOSIT_WITHDRAW_MODE_ENUM;
  withdrawInputType: WITHDRAW_INPUT_TYPE = 'lp';
  withdrawAmtLPInput: number;
  withdrawAmtCTokenPreviewFromLP: string;
  withdrawAmtLPPreviewFromCToken: string;
  withdrawAmtCTokenInput: number;
  grossLpTokenToken: string;
  netCToken: string;
  depositFeeTokenToken: string;
  netLpTokenToken: string;
  depositFeeLp: string;
  netLpLp: string;
  grossLpUSD: string;
  netLpUSD: string;
  depositFeeUSD: string;
  tokenPrice: string;
  tokenPriceNonUSDDenomInUSD: string;
  swapHintPrices: { [p: string]: Decimal } = {};
  basedTokenPrice: string;
  bufferLuna = 1.25 * CONFIG.UNIT;
  rewardSymbolsPrint = '';
  freeTokenTokenRatio = false;
  swap_asset_a_amount: string;
  swap_asset_b_amount: string;
  return_a_amount: string;
  return_b_amount: string;
  depositTokenAAmtTokenTokenIsFocus = false;
  depositTokenBAmtTokenTokenIsFocus = false;
  compoundStat: CompoundStat;
  lastCompound: string;
  earlyWithdrawal = false;
  private heightChanged: Subscription;
  APRAPYTooltipHTML = '';

  constructor(
    public modalRef: MdbModalRef<VaultDialogComponent>,
    public terrajs: TerrajsService,
    protected $gaService: GoogleAnalyticsService,
    public info: InfoService,
    private tokenService: TokenService,
    private percentPipe: PercentPipe,
    private rewardInfoPipe: RewardInfoPipe,
    private lpSplitPipe: LpSplitPipe,
    public lpEarningPipe: LpEarningPipe,
    public config: ConfigService,
    private spectrumCompoundProxyService: SpectrumCompoundProxyService,
    public uiUtil: UiUtilsService,
    private percentSuperscriptPipe: PercentSuperscriptPipe,
    private timeagoPipe: TimeagoPipe,
    private unitPipe: UnitPipe,
    private spectrumAstroportGenericFarmService: SpectrumAstroportGenericFarmService,
    private wasm: WasmService,
    private clipboard: Clipboard,
    private modalService: ModalService
  ) {
  }

  get keySingleToken_Denom() {
    return `${this.vault.poolInfo.dex}|${this.vault.poolInfo.baseTokenContract}|${this.vault.poolInfo.denomTokenContract}`;
  }

  get shouldShowAPRFromAstroportData() {
    return this.vault.poolInfo.dex === 'Astroport' && this.vault.poolInfo.farmType === 'LP' && !this.vault.poolInfo.notUseAstroportGqlApr;
  }

  get showFreeRatioMessage() {
    return +this.swap_asset_a_amount > 0 || +this.swap_asset_b_amount > 0 || +this.return_a_amount > 0 || +this.return_b_amount > 0;
  }

  get disableDepositButton() {
    if (!this.formDeposit) {
      // prevent error when deposit form is not yet completely initialized
      return true;
    }
    if (this.depositMode === 'tokentoken') {
      return !this.depositType || this.formDeposit?.invalid || (!this.depositTokenAAmtTokenToken && !this.depositTokenBAmtTokenToken);
    }
    return !this.depositType || this.formDeposit?.invalid;
  }

  get disableWithdrawButton() {
    if (!this.formWithdraw) {
      // prevent error when deposit form is not yet completely initialized
      return true;
    }
    if (this.withdrawInputType === 'lp') {
      return !this.withdrawMode || this.formWithdraw?.invalid || !this.withdrawAmtLPInput;
    }
    else if (this.withdrawInputType === 'ctoken') {
      return !this.withdrawMode || this.formWithdraw?.invalid || !this.withdrawAmtCTokenInput || !this.withdrawAmtLPPreviewFromCToken;
    }
  }

  ngOnInit() {
    this.buildRewardSymbolsPrint();
    if (this.vault.poolInfo.farmType === 'LP') {
      this.depositMode = 'tokentoken';
      this.withdrawMode = 'tokentoken';
    }
    this.heightChanged = this.terrajs.heightChanged.subscribe(async () => {
      if (this.terrajs.isConnected) {
        if (this.vault.poolInfo.farmType === 'LP') {
          const tasks: Promise<any>[] = [];
          tasks.push(this.info.refreshPoolResponse(this.vault.poolInfo.key));
          await Promise.all(tasks);
          if (this.depositTokenAAmtTokenToken && this.tokenAToBeStatic) {
            this.depositTokenATokenTokenChanged(true);
          } else if (this.depositTokenBAmtTokenToken && !this.tokenAToBeStatic) {
            this.depositTokenBTokenTokenChanged(true);
          }
          if (this.withdrawAmtLPInput) {
            this.withdrawAmtChanged('lp');
          }
          if (this.withdrawAmtCTokenInput) {
            this.withdrawAmtChanged('ctoken');
          }
        }
        this.refreshLpBalanceInfo();
      }
    });
    this.refreshData();
  }

  refreshAPRAPYTooltipHTML() {
    let html = '<div class="apyapr-tooltip">';
    this.vault.pairStat.poolAprs.forEach(poolApr => {
      if (poolApr.apr > 0) {
        html += `<div class="d-flex">
                    <div>${poolApr.rewardSymbol} APR</div>
                    <div class="margin-left-auto">${this.percentPipe.transform(poolApr.apr)}</div>
                </div>`;
      }
    });

    if (this.vault.poolAprTotal > 0) {
      html += `<div class="d-flex">
                    <div>Rewards APR</div>
                    <div class="margin-left-auto">${this.percentPipe.transform(this.vault.poolAprTotal)}</div>
            </div>`;
    }
    if (this.vault.pairStat?.tradeApy > 0 && this.vault.poolInfo.farmType === 'LP') {
      html += `<div class="d-flex">
                    <div>Trade APY</div>
                    <div class="margin-left-auto">${this.percentPipe.transform(this.vault.pairStat.tradeApy)}</div>
            </div>`;
    }
    // if (this.shouldShowAPRFromAstroportData) {
    //   html += `<div class="d-flex">
    //                 <div>(APR from Astroport data)</div>
    //                 <div class="margin-left-auto"></div>
    //         </div>`;
    // }
    if (this.vault.pairStat?.poolApy > 0) {
      html += `<div class="d-flex">
                    <div>Compound APY (incl. fee)</div>
                    <div class="margin-left-auto">${this.percentSuperscriptPipe.transform(this.vault.pairStat?.poolApy)}</div>
            </div>`;
    }
    this.APRAPYTooltipHTML = html;
  }

  async refreshData() {
    if (this.vault.poolInfo.forceDepositType) {
      this.depositType = this.vault.poolInfo.forceDepositType as any;
    }
    this.refreshLpBalanceInfo();
    this.refreshiLInfo();
    this.refreshAPRAPYTooltipHTML();
    this.refreshLastCompound();
  }

  async refreshiLInfo() {
    const deposit_costs = this.info.rewardInfos[this.vault.poolInfo.key]?.deposit_costs;
    const gainedLp = +this.info.rewardInfos[this.vault.poolInfo.key]?.bond_amount - +this.info.rewardInfos[this.vault.poolInfo.key]?.deposit_amount;
    if (deposit_costs && gainedLp) {
      const total_share = this.info.poolResponses[this.vault.poolInfo.key].total_share;
      const token0FromGainedLp = new BigNumber(gainedLp).times(this.info.poolResponses[this.vault.poolInfo.key].assets[0].amount).div(total_share).toNumber();
      const token1FromGainedLp = new BigNumber(gainedLp).times(this.info.poolResponses[this.vault.poolInfo.key].assets[1].amount).div(total_share).toNumber();
      const token0Change = +deposit_costs[0] - token0FromGainedLp;
      const token1Change = +deposit_costs[1] - token1FromGainedLp;
      const token0ChangeUnit = this.unitPipe.transform(token0Change, this.vault.baseDecimals);
      const token1ChangeUnit = this.unitPipe.transform(token1Change, this.vault.denomDecimals);
      const token0Sign = token0Change > 0 ? '+' : '';
      const token1Sign = token1Change > 0 ? '+' : '';

      this.iLInfo = `${token0Sign}${token0ChangeUnit} ${this.vault.baseSymbol}, ${token1Sign}${token1ChangeUnit} ${this.vault.denomSymbol}`;
    }
  }

  async refreshLpBalanceInfo() {
    this.lpBalanceInfo = '';
    if (this.vault.poolInfo.key !== this.info.SPEC_KEY) {
      this.lpBalanceInfo += `${this.rewardInfoPipe.transform(this.info.rewardInfos[this.vault.poolInfo.key])} `;
    }
    if (this.info.rewardInfos[this.vault.poolInfo.key]?.bond_amount) {
      const lpAmount = this.unitPipe.transform(this.info.rewardInfos[this.vault.poolInfo.key]?.bond_amount)
      const lpSplitText = this.lpSplitPipe.transform(+this.info.rewardInfos[this.vault.poolInfo.key]?.bond_amount / this.UNIT,
        this.info.poolResponses[this.vault.poolInfo.key],
        this.vault,
        '1.0-2'
      );
      this.lpBalanceInfo += `${lpAmount} LP (${lpSplitText})`;
    }
  }

  async refreshLastCompound() {
    const depositTime = +this.info.rewardInfos[this.vault.poolInfo.key]?.deposit_time;
    this.compoundStat = this.info.compoundStat?.[this.vault.poolInfo.farmContract];
    if (this.compoundStat) {
      const lastCompoundTime = new Date(this.compoundStat.txTimestamp).getTime();
      if (lastCompoundTime / 1000 > depositTime) {
        this.lastCompound = this.timeagoPipe.transform(lastCompoundTime);
      } else {
        this.lastCompound = 'Pending';
      }
    }
    this.earlyWithdrawal = (new Date().getTime() / 1000) - depositTime < 86400;
  }

  ngOnDestroy() {
    this.heightChanged.unsubscribe();
  }

  setMaxDepositTokenATokenToken() {
    this.tokenAToBeStatic = true;
    if (this.vault.poolInfo.baseTokenContract === Denom.LUNA && +this.info.tokenBalances?.[this.vault.poolInfo.baseTokenContract] > this.bufferLuna) {
      this.depositTokenAAmtTokenToken = +floorSixDecimal(+this.info.tokenBalances?.[this.vault.poolInfo.baseTokenContract] - this.bufferLuna) / this.vault.baseUnit;
    } else {
      this.depositTokenAAmtTokenToken = +floorSixDecimal(+this.info.tokenBalances?.[this.vault.poolInfo.baseTokenContract] / this.vault.baseUnit);
    }
    this.depositTokenATokenTokenChanged(true);
  }

  setMaxWithdrawAmount(type: WITHDRAW_INPUT_TYPE) {
    const rewardInfo = this.info.rewardInfos?.[this.vault.poolInfo.key];
    if (rewardInfo) {
      if (type === 'lp') {
        this.withdrawAmtLPInput = +rewardInfo.bond_amount / CONFIG.UNIT;
      } else if (type === 'ctoken') {
        this.withdrawAmtCTokenInput = +rewardInfo.bond_share / CONFIG.UNIT;
      }
    }
    this.withdrawAmtChanged(type);
  }

  @debounce(100)
  async depositTokenATokenTokenChanged(forced: boolean, event?: any) {
    if (!forced && !event) {
      // input from HTML has event, input from ngModel changes does not have event, trick to prevent bounce
      return;
    }
    if (event) {
      this.tokenAToBeStatic = true;
    }
    if (!this.depositTokenAAmtTokenToken && !this.freeTokenTokenRatio) {
      this.resetTokenTokenFormAndOutputs();
    }
    if (this.freeTokenTokenRatio) {
      this.fillZeroInputTokenABAmtTokenToken();
    }
    this.depositTokenBAmtTokenTokenCtl.control.markAsTouched();
    this.refreshDataTokenToken(true);
  }

  onFreeRatioChanged(event?: Event) {
    if (!this.freeTokenTokenRatio) {
      this.depositTokenATokenTokenChanged(true);
    }
  }

  focusInDepositTokenABAmtTokenToken(AorB: string) {
    if (AorB === 'A') {
      this.depositTokenAAmtTokenTokenIsFocus = true;
      if (this.depositTokenAAmtTokenToken === 0) {
        this.depositTokenAAmtTokenToken = null;
      }
    }
    if (AorB === 'B') {
      this.depositTokenBAmtTokenTokenIsFocus = true;
      if (this.depositTokenBAmtTokenToken === 0) {
        this.depositTokenBAmtTokenToken = null;
      }
    }
  }

  focusOutDepositTokenABAmtTokenToken(AorB: string) {
    if (this.freeTokenTokenRatio) {
      if (AorB === 'A') {
        this.depositTokenAAmtTokenTokenIsFocus = false;
        if (this.depositTokenAAmtTokenToken === null) {
          this.depositTokenAAmtTokenToken = 0;
        }
      }
      if (AorB === 'B') {
        this.depositTokenBAmtTokenTokenIsFocus = false;
        if (this.depositTokenBAmtTokenToken === null) {
          this.depositTokenBAmtTokenToken = 0;
        }
      }
    }
  }

  fillZeroInputTokenABAmtTokenToken() {
    if (!this.depositTokenAAmtTokenTokenIsFocus && !this.depositTokenAAmtTokenToken) {
      this.depositTokenAAmtTokenToken = 0;
    }
    if (!this.depositTokenBAmtTokenTokenIsFocus && !this.depositTokenBAmtTokenToken) {
      this.depositTokenBAmtTokenToken = 0;
    }
  }

  resetTokenTokenFormAndOutputs() {
    this.depositTokenBAmtTokenToken = undefined;
    this.grossLpTokenToken = undefined;
    this.depositFeeTokenToken = undefined;
    this.netLpTokenToken = undefined;
    this.netCToken = undefined;
  }

  @debounce(100)
  async depositTokenBTokenTokenChanged(forced: boolean, event?: any) {
    if (!forced && !event) {
      // input from HTML has event, input from ngModel changes does not have event, trick to prevent bounce
      return;
    }
    if (event) {
      this.tokenAToBeStatic = false;
    }
    if (!this.depositTokenBAmtTokenToken && !this.freeTokenTokenRatio) {
      this.resetTokenTokenFormAndOutputs();
    }
    if (this.freeTokenTokenRatio) {
      this.fillZeroInputTokenABAmtTokenToken();
    }
    this.depositTokenAAmtTokenTokenCtl.control.markAsTouched();
    this.refreshDataTokenToken(false);
  }

  async doDeposit() {
    if (this.disableDepositButton) {
      return;
    }
    this.$gaService.event('CLICK_DEPOSIT_LP_VAULT', `${this.depositType}, ${this.depositMode}`, this.vault.baseSymbol + this.vault.denomSymbol);
    if (this.depositMode === 'tokentoken') {
      const assetBaseAmount = times(this.depositTokenAAmtTokenToken, this.vault.baseUnit);
      const assetDenomAmount = times(this.depositTokenBAmtTokenToken, this.vault.denomUnit);
      const assetBase = {
        amount: assetBaseAmount,
        info: this.vault.baseAssetInfo
      };
      const assetDenom = {
        amount: assetDenomAmount,
        info: this.vault.denomAssetInfo
      };

      const msgs: MsgExecuteContract[] = [];
      const coins: Coin[] = [];

      if (this.config.NATIVE_TOKEN_DENOMS.has(this.vault.poolInfo.baseTokenContract) && +assetBaseAmount > 0) {
        coins.push(new Coin(this.vault.poolInfo.baseTokenContract, assetBaseAmount));
      } else if (+assetBaseAmount > 0) {
        msgs.push(new MsgExecuteContract(
          this.terrajs.address,
          this.vault.poolInfo.baseTokenContract,
          {
            increase_allowance: {
              amount: assetBaseAmount,
              spender: this.vault.poolInfo.farmContract,
            }
          }
        ));
      }
      if (this.config.NATIVE_TOKEN_DENOMS.has(this.vault.poolInfo.denomTokenContract) && +assetDenomAmount > 0) {
        coins.push(new Coin(this.vault.poolInfo.denomTokenContract, assetDenomAmount));
      } else if (+assetDenomAmount > 0) {
        msgs.push(new MsgExecuteContract(
          this.terrajs.address,
          this.vault.poolInfo.denomTokenContract,
          {
            increase_allowance: {
              amount: assetDenomAmount,
              spender: this.vault.poolInfo.farmContract,
            }
          }
        ));
      }
      const assets = [];
      if (+assetBaseAmount > 0) {
        assets.push(assetBase);
      }
      if (+assetDenomAmount > 0) {
        assets.push(assetDenom);
      }
      msgs.push(new MsgExecuteContract(
        this.terrajs.address,
        this.vault.poolInfo.farmContract,
        {
          bond_assets: {
            assets,
            minimum_receive: ((1 - CONFIG.BOND_ASSETS_MIN_RECEIVE_SLIPPAGE_TOLERANCE) * +this.grossLpTokenToken).toFixed(0).toString(),
            no_swap: this.vault.poolInfo.poolType === 'stable' ||
              (this.vault.poolInfo.poolType === 'xyk' && (!this.freeTokenTokenRatio || !this.showFreeRatioMessage))
          }
        } as FarmExecuteMsg,
        coins
      ));
      await this.terrajs.post(msgs);
    } else if (this.depositMode === 'lp') {
      const lpAmount = times(this.depositLPAmtLP, CONFIG.UNIT);
      const farmContract = this.vault.poolInfo.farmContract;
      const msg = {
        send: {
          amount: lpAmount,
          contract: farmContract,
          msg: toBase64({
            bond: {}
          })
        }
      };
      await this.tokenService.handle(this.vault.lpToken, msg);
    }

    this.depositTokenAAmtTokenToken = undefined;
    this.depositTokenBAmtTokenToken = undefined;
    this.depositLPAmtLP = undefined;
    this.netCToken = undefined;

    this.netLpTokenToken = undefined;
    this.depositFeeTokenToken = undefined;
    this.netLpTokenToken = undefined;

    this.depositFeeLp = undefined;
    this.netLpLp = undefined;

    this.grossLpUSD = undefined;
    this.depositFeeUSD = undefined;
    this.netLpUSD = undefined;

    this.depositTokenAmtSingleToken = undefined;
    this.depositFeeLp = undefined;
    this.netLpLp = undefined;

    this.swap_asset_a_amount = undefined;
    this.swap_asset_b_amount = undefined;
    this.return_a_amount = undefined;
    this.return_b_amount = undefined;
  }

  getNativeDenom() {
    if (this.terrajs.network?.name === 'testnet') {
      return Denom.LUNA;
    } else {
      return this.terrajs.settings.axlUsdcToken;
    }
  }

  @debounce(250)
  async withdrawAmtChanged(type: WITHDRAW_INPUT_TYPE) {
    if (type === 'lp' && this.withdrawAmtLPInput) {
      this.calcGrossCToken(this.withdrawAmtLPInput, 'withdraw', type);
    } else if (type === 'ctoken' && this.withdrawAmtCTokenInput) {
      this.calcGrossCToken(this.withdrawAmtCTokenInput, 'withdraw', type);
    }
  }

  async doWithdraw() {
    if (this.formWithdraw.invalid) {
      return;
    }
    this.$gaService.event('CLICK_WITHDRAW_LP_VAULT', this.vault.poolInfo.farm.toUpperCase(), this.vault.baseSymbol + '-' + this.vault.denomSymbol);
    let unbondAmount = this.withdrawInputType === 'ctoken' ? times(this.withdrawAmtLPPreviewFromCToken, CONFIG.UNIT) : times(this.withdrawAmtLPInput, CONFIG.UNIT);
    if (this.withdrawInputType === 'ctoken' && gt(unbondAmount, this.info.rewardInfos[this.vault.poolInfo.key].bond_amount)) {
      unbondAmount = this.info.rewardInfos[this.vault.poolInfo.key].bond_amount;
    }
    const unbond = new MsgExecuteContract(
      this.terrajs.address,
      this.vault.poolInfo.farmContract,
      {
        unbond: {
          amount: unbondAmount,
        }
      } as FarmExecuteMsg
    );
    if (this.withdrawMode === 'tokentoken') {
      const withdrawLp = new MsgExecuteContract(
        this.terrajs.address,
        this.vault.pairInfo.liquidity_token,
        {
          send: {
            amount: unbondAmount,
            contract: this.vault.pairInfo.contract_addr,
            msg: toBase64({ withdraw_liquidity: {} }),
          }
        }
      );
      await this.terrajs.post([unbond, withdrawLp]);
    } else if (this.withdrawMode === 'lp') {
      await this.terrajs.post([unbond]);
    }
    this.withdrawAmtLPInput = undefined;
    this.withdrawAmtCTokenInput = undefined;
    this.withdrawAmtLPPreviewFromCToken = undefined;
    this.withdrawAmtCTokenPreviewFromLP = undefined;
  }

  async doClaimReward(all?: boolean) {
    this.$gaService.event('CLICK_CLAIM_REWARD', this.vault.poolInfo.farm, this.vault.baseSymbol + this.vault.denomSymbol);
    await this.terrajs.post([this.getWithdrawMsg(all)]);
  }

  @debounce(250)
  async depositLPChanged(forced: boolean, event?: any) {
    if (!forced && !event) {
      // input from from HTML has event, input from ngModel changes does not have event, trick to prevent bounce
      return;
    }
    if (!this.depositLPAmtLP) {
      this.depositLPAmtLP = undefined;
      this.depositFeeLp = undefined;
      this.netLpLp = undefined;
    }
    const grossLp = new BigNumber(this.depositLPAmtLP);
    const depositFee = this.vault.poolInfo.farm === 'Spectrum'
      ? new BigNumber('0')
      : grossLp.multipliedBy(DEPOSIT_FEE);
    this.netLpLp = grossLp.minus(depositFee).toString();
    this.depositFeeLp = depositFee.toString();
    this.calcGrossCToken(new BigNumber(this.netLpLp).times(CONFIG.UNIT).toString(), 'deposit', 'lp');
  }

  setMaxDepositLP() {
    this.depositLPAmtLP = +this.info.lpTokenBalances?.[this.vault.lpToken] / CONFIG.UNIT;
    this.depositLPChanged(true);
  }

  @debounce(250)
  async depositUSDChanged(forced: boolean, event?: any) {

  }


  changeDepositMode(mode: DEPOSIT_WITHDRAW_MODE_ENUM) {
    setTimeout(() => this.depositMode = mode, 0);
  }

  setMaxDepositTokenBTokenToken() {
    this.tokenAToBeStatic = false;
    if (this.vault.poolInfo.denomTokenContract === Denom.LUNA && +this.info.tokenBalances?.[this.vault.poolInfo.denomTokenContract] > this.bufferLuna) {
      this.depositTokenBAmtTokenToken = +floorSixDecimal(+this.info.tokenBalances?.[this.vault.poolInfo.denomTokenContract] - this.bufferLuna) / +this.vault.denomUnit;
    } else {
      this.depositTokenBAmtTokenToken = +floorSixDecimal(+this.info.tokenBalances?.[this.vault.poolInfo.denomTokenContract] / +this.vault.denomUnit);
    }
    this.depositTokenBTokenTokenChanged(true);
  }

  @debounce(250)
  depositSingleTokenChanged(forced: boolean, event?: any) {
    if (!forced && !event) {
      // input from HTML has event, input from ngModel changes does not have event, trick to prevent bounce
      return;
    }
    if (!this.depositTokenAmtSingleToken) {
      this.depositTokenAmtSingleToken = undefined;
      this.depositFeeLp = undefined;
      this.netLpLp = undefined;
    }

    const grossLp = new BigNumber(this.depositTokenAmtSingleToken);
    const depositFee = grossLp.multipliedBy(DEPOSIT_FEE);
    this.netLpLp = grossLp.minus(depositFee).toString();
    this.depositFeeLp = depositFee.toString();
  }

  private buildRewardSymbolsPrint() {
    let isFirst = true;
    this.vault.poolInfo.rewardTokenContracts.forEach(rewardTokenContract => {
      if (!isFirst) {
        this.rewardSymbolsPrint += ', ';
      }
      this.rewardSymbolsPrint += this.info.tokenInfos[rewardTokenContract].symbol;
      isFirst = false;
    });
  }

  private async refreshDataTokenToken(inputFromA: boolean) {
    const [assetBase, assetDenom, isAssetABase] = this.findAssetBaseAndDenom();
    let amountBase: BigNumber;
    let amountDenom: BigNumber;
    const denomUnit = this.vault.denomUnit;
    if (inputFromA) {
      if (!this.freeTokenTokenRatio && this.depositTokenAAmtTokenToken > 0) {
        amountBase = new BigNumber(this.depositTokenAAmtTokenToken).times(this.vault.baseUnit);
        amountDenom = amountBase.times(assetDenom.amount).div(assetBase.amount).integerValue();
        this.depositTokenBAmtTokenToken = amountDenom.div(denomUnit)?.toNumber() || 0;
      }
    } else {
      if (!this.freeTokenTokenRatio && this.depositTokenBAmtTokenToken > 0) {
        amountDenom = new BigNumber(this.depositTokenBAmtTokenToken).times(denomUnit);
        amountBase = amountDenom.times(assetBase.amount).div(assetDenom.amount).integerValue();
        this.depositTokenAAmtTokenToken = amountBase.div(this.vault.baseUnit)?.toNumber() || 0;
      }
    }

    if (!this.freeTokenTokenRatio && !(this.depositTokenAAmtTokenToken && this.depositTokenBAmtTokenToken)) {
      return;
    }

    assetBase.amount = times(this.depositTokenAAmtTokenToken, this.vault.baseUnit);
    assetDenom.amount = times(this.depositTokenBAmtTokenToken, this.vault.denomUnit);

    const response = await this.spectrumCompoundProxyService.query(this.vault.poolInfo.compoundProxyContract, {
      compound_simulation: {
        rewards: [assetBase, assetDenom]
      }
    });
    this.grossLpTokenToken = response.lp_amount;
    if (this.vault.poolInfo.poolType === 'xyk') {
      if (isAssetABase) {
        this.swap_asset_a_amount = response.swap_asset_a_amount;
        this.swap_asset_b_amount = response.swap_asset_b_amount;
        this.return_a_amount = response.return_a_amount;
        this.return_b_amount = response.return_b_amount;
      } else {
        this.swap_asset_a_amount = response.swap_asset_b_amount;
        this.swap_asset_b_amount = response.swap_asset_a_amount;
        this.return_a_amount = response.return_b_amount;
        this.return_b_amount = response.return_a_amount;
      }
    }
    this.calcGrossCToken(response.lp_amount, 'deposit', 'lp');
  }

  @memoizeAsync(60 * 1000)
  private async getTotalBondAmountAndFarmState() {
    const totalBondAmountTask = this.wasm.query(this.terrajs.settings.astroportGenerator, {
      deposit: {
        lp_token: this.vault.pairInfo.liquidity_token,
        user: this.vault.poolInfo.farmContract
      }
    });
    const farmStateTask = this.spectrumAstroportGenericFarmService.query(this.vault.poolInfo.farmContract, {
      state: {}
    });
    return await Promise.all([totalBondAmountTask, farmStateTask]);
  }

  private calcGrossCToken(amount: string | number, direction: 'deposit' | 'withdraw', type: WITHDRAW_INPUT_TYPE) {
    this.getTotalBondAmountAndFarmState().then((res) => {
      const totalBondAmount = res[0];
      const totalBondShare = res[1].total_bond_share;
      if (direction === 'deposit' && type === 'lp') {
        this.netCToken = floorSixDecimal(new BigNumber(amount).times(totalBondShare).div(totalBondAmount));
      }
      if (direction === 'withdraw' && type === 'lp') {
        this.withdrawAmtCTokenPreviewFromLP = ceilSixDecimal(new BigNumber(amount).times(totalBondShare).div(totalBondAmount));
      }
      if (direction === 'withdraw' && type === 'ctoken') {
        this.withdrawAmtLPPreviewFromCToken = floorSixDecimal(new BigNumber(amount).times(totalBondAmount).div(totalBondShare));
      }
    });
  }

  private findAssetBaseAndDenom(): [Asset, Asset, boolean] {
    const poolResponse = this.info.poolResponses[this.vault.poolInfo.key];
    const asset0Token: string = poolResponse.assets[0].info.token
      ? poolResponse.assets[0].info.token?.['contract_addr']
      : poolResponse.assets[0].info.native_token?.['denom'];
    return asset0Token === this.vault.poolInfo.baseTokenContract
      ? [poolResponse.assets[0], poolResponse.assets[1], true]
      : [poolResponse.assets[1], poolResponse.assets[0], false];
  }

  private toContractPrice(price: string, offer_decimals: number, ask_decimals: number) {
    return offer_decimals === ask_decimals
      ? price
      : times(price, 10 ** (offer_decimals - ask_decimals));
  }

  private toUIPrice(price: string, offer_decimals: number, ask_decimals: number) {
    return offer_decimals === ask_decimals
      ? price
      : times(price, 10 ** (ask_decimals - offer_decimals));
  }

  private getWithdrawMsg(all?: boolean): MsgExecuteContract {
    return null;
    // TODO until SPEC is finalized
    // return new MsgExecuteContract(
    //   this.terrajs.address,
    //   this.vault.poolInfo.farmContract,
    //   {
    //     withdraw: {
    //       asset_token: all ? undefined : this.vault.poolInfo.asset_token,
    //     }
    //   }
    // );
  }

  private getSwapHints(reverse?: boolean, swapHintPrices?: { [p: string]: Decimal }): [] {
    return [];
  }

  copyFarmAddress() {
    this.clipboard.copy(this.vault.poolInfo.farmContract);
    this.modalService.notify('cToken address copied');
  }
}
