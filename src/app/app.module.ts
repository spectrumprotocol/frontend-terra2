import {BrowserModule} from '@angular/platform-browser';
import {APP_INITIALIZER, LOCALE_ID, NgModule, ɵLocaleDataIndex} from '@angular/core';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {VaultComponent} from './pages/vault/vault.component';
import {MenubarComponent} from './menubar/menubar.component';
import {HttpClientModule} from '@angular/common/http';
import {ClipboardModule} from '@angular/cdk/clipboard';
import {ModalComponent} from './services/modal/modal.component';
import {NotifyComponent} from './services/notify/notify.component';
import {LoaderComponent} from './services/loader/loader.component';
import {TerrajsService} from './services/terrajs.service';
import {DigitComponent} from './components/digit/digit.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MaxValidator} from './directives/max.directive';
import {MinValidator} from './directives/min.directive';
import {AutofocusDirective} from './directives/autofocus.directive';
import {JsonValidator} from './directives/json.directive';
import {TruncatePipe} from './pipes/truncate.pipe';
import {TimeagoPipe} from './pipes/timeago.pipe';
import {ShortNumPipe} from './pipes/short-num.pipe';
import {DecimalPipe, NumberFormatStyle, NumberSymbol, PercentPipe, registerLocaleData} from '@angular/common';
import {PrettyJsonModule} from 'angular2-prettyjson';
import {JsonParsePipe} from './pipes/json-parse.pipe';
import {TxPostComponent} from './services/tx-post/tx-post.component';
import locale from '@angular/common/locales/en';
import {AssetCardComponent} from './pages/vault/asset-card/asset-card.component';
import {VaultDialogComponent} from './pages/vault/asset-card/vault-dialog/vault-dialog.component';
import {GraphQLModule} from './graphql.module';
import {UrlPipe} from './pipes/url.pipe';
import {UnitPipe} from './pipes/unit.pipe';
import {FARM_INFO_SERVICE} from './services/farm_info/farm-info.service';
import {RewardInfoPipe} from './pipes/reward-info.pipe';
import {NgxGoogleAnalyticsModule, NgxGoogleAnalyticsRouterModule} from 'ngx-google-analytics';
import {CONFIG} from './consts/config';
import {FooterComponent} from './footer/footer.component';
import {LpSplitPipe} from './pipes/lp-split.pipe';
import {PricePipe} from './pipes/price.pipe';
import {ToDatePipe} from './pipes/to-date.pipe';
import {BalancePipe} from './pipes/balance.pipe';
import {LpBalancePipe} from './pipes/lp-balance.pipe';
import {ConnectOptionsComponent} from './services/connect-options/connect-options.component';
import {WalletOptionsComponent} from './services/wallet-options/wallet-options.component';
import {YourTvlComponent} from './pages/vault/your-tvl/your-tvl.component';
import {NgxChartsModule} from '@swimlane/ngx-charts';
import {NgxSliderModule} from '@angular-slider/ngx-slider';
import {FloorPipe} from './pipes/floor.pipe';
import {MdbTooltipModule} from 'mdb-angular-ui-kit/tooltip';
import {MdbDropdownModule} from 'mdb-angular-ui-kit/dropdown';
import {MdbTabsModule} from 'mdb-angular-ui-kit/tabs';
import {MdbCollapseModule} from 'mdb-angular-ui-kit/collapse';
import {MdbFormsModule} from 'mdb-angular-ui-kit/forms';
import {MdbValidationModule} from 'mdb-angular-ui-kit/validation';
import {MdbModalService} from 'mdb-angular-ui-kit/modal';
import {LpEarningPipe} from './pipes/lp-earning.pipe';
import {MdbCheckboxModule} from 'mdb-angular-ui-kit/checkbox';
import {DashboardComponent} from './pages/dashboard/dashboard.component';
import {CurrencyPipe} from './pipes/currency.pipe';
import {
  AstroportAstroLunaFarmInfoService
} from './services/farm_info/astroport/testnet_only/astroport-astro-luna-farm-info.service';
import {ApolloModule} from 'apollo-angular';
import {
  AstroportStblStbFarmInfoService
} from './services/farm_info/astroport/testnet_only/astroport-stbl-stb-farm-info.service';
import {
  AstroportVkrLunaFarmInfoService
} from './services/farm_info/astroport/testnet_only/astroport-vkr-luna-farm-info.service';
import {
  AstroportStbLunaFarmInfoService
} from './services/farm_info/astroport/testnet_only/astroport-stb-luna-farm-info.service';
import {
  AstroportAstroAxlUsdcFarmInfoService
} from './services/farm_info/astroport/mainnet_only/astroport-astro-axl-usdc-farm-info.service';
import {
  AstroportAxlUsdcAxlUsdtFarmInfoService
} from './services/farm_info/astroport/mainnet_only/astroport-axl-usdc-axl-usdt-farm-info.service';
import {
  AstroportAxlUsdcLunaFarmInfoService
} from './services/farm_info/astroport/mainnet_only/astroport-axl-usdc-luna-farm-info.service';
import {
  AstroportLunaxLunaFarmInfoService
} from './services/farm_info/astroport/mainnet_only/astroport-lunax-luna-farm-info.service';
import {
  AstroportVkrAxlUsdcFarmInfoService
} from './services/farm_info/astroport/mainnet_only/astroport-vkr-axl-usdc-farm-info.service';
import {AirdropComponent} from './pages/airdrop/airdrop.component';
import {
  AstroportTptLunaFarmInfoService
} from './services/farm_info/astroport/mainnet_only/astroport-tpt-luna-farm-info.service';
import {PercentSuperscriptPipe} from './pipes/percent-superscript.pipe';
import {
  AstroportAmpLunaLunaFarmInfoService
} from './services/farm_info/astroport/mainnet_only/astroport-ampluna-luna-farm-info.service';
import {
  AstroportBLunaLunaFarmInfoService
} from './services/farm_info/astroport/mainnet_only/astroport-bluna-luna-farm-info.service';
import { AstroportRedLunaFarmInfoService } from './services/farm_info/astroport/mainnet_only/astroport-red-luna-farm-info.service';

// alter default decimal to 6
locale[ɵLocaleDataIndex.NumberFormats][NumberSymbol.Decimal] = '#,##0.######';
locale[ɵLocaleDataIndex.NumberFormats][NumberFormatStyle.Percent] = '#,##0.##%';
registerLocaleData(locale, 'en');

@NgModule({
  declarations: [
    AppComponent,
    VaultComponent,
    MenubarComponent,
    FooterComponent,
    ModalComponent,
    NotifyComponent,
    LoaderComponent,
    DigitComponent,
    MaxValidator,
    MinValidator,
    AutofocusDirective,
    JsonValidator,
    TruncatePipe,
    TimeagoPipe,
    ShortNumPipe,
    JsonParsePipe,
    TxPostComponent,
    AssetCardComponent,
    UrlPipe,
    UnitPipe,
    RewardInfoPipe,
    LpSplitPipe,
    PricePipe,
    ToDatePipe,
    BalancePipe,
    LpBalancePipe,
    ConnectOptionsComponent,
    WalletOptionsComponent,
    YourTvlComponent,
    FloorPipe,
    VaultDialogComponent,
    LpEarningPipe,
    DashboardComponent,
    CurrencyPipe,
    AirdropComponent,
    PercentSuperscriptPipe
  ],
  imports: [
    ApolloModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    BrowserModule,
    ClipboardModule,
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule,
    PrettyJsonModule,
    GraphQLModule,
    NgxGoogleAnalyticsModule.forRoot(CONFIG.GOOGLE_ANALYTICS_ID),
    NgxGoogleAnalyticsRouterModule,
    NgxChartsModule,
    NgxSliderModule,
    MdbTooltipModule,
    MdbDropdownModule,
    MdbTabsModule,
    MdbCollapseModule,
    MdbFormsModule,
    MdbValidationModule,
    MdbCheckboxModule,
  ],
  providers: [
    MdbModalService,
    {
      provide: APP_INITIALIZER,
      useFactory: (terrajs: TerrajsService) => async () => {
        await terrajs.initLcdClient(); // for this.terrajs.lcdClient.wasm.contractQuery to work
        setTimeout(() => terrajs.connect(true), 2500);
      },
      deps: [TerrajsService],
      multi: true
    },
    {provide: FARM_INFO_SERVICE, useClass: AstroportAstroAxlUsdcFarmInfoService, multi: true},
    {provide: FARM_INFO_SERVICE, useClass: AstroportAxlUsdcAxlUsdtFarmInfoService, multi: true},
    {provide: FARM_INFO_SERVICE, useClass: AstroportAxlUsdcLunaFarmInfoService, multi: true},
    {provide: FARM_INFO_SERVICE, useClass: AstroportLunaxLunaFarmInfoService, multi: true},
    {provide: FARM_INFO_SERVICE, useClass: AstroportVkrAxlUsdcFarmInfoService, multi: true},
    {provide: FARM_INFO_SERVICE, useClass: AstroportTptLunaFarmInfoService, multi: true},
    {provide: FARM_INFO_SERVICE, useClass: AstroportAmpLunaLunaFarmInfoService, multi: true},
    {provide: FARM_INFO_SERVICE, useClass: AstroportBLunaLunaFarmInfoService, multi: true},
    {provide: FARM_INFO_SERVICE, useClass: AstroportRedLunaFarmInfoService, multi: true},

    {provide: FARM_INFO_SERVICE, useClass: AstroportAstroLunaFarmInfoService, multi: true},
    {provide: FARM_INFO_SERVICE, useClass: AstroportVkrLunaFarmInfoService, multi: true},
    {provide: FARM_INFO_SERVICE, useClass: AstroportStbLunaFarmInfoService, multi: true},
    {provide: FARM_INFO_SERVICE, useClass: AstroportStblStbFarmInfoService, multi: true},
    TruncatePipe,
    DecimalPipe,
    UnitPipe,
    BalancePipe,
    LpBalancePipe,
    ShortNumPipe,
    PercentSuperscriptPipe,
    PercentPipe,
    {provide: LOCALE_ID, useValue: 'en'},
  ],
  bootstrap: [AppComponent]
})

export class AppModule {
}
