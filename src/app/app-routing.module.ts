import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {VaultComponent} from './pages/vault/vault.component';
// import {TradeComponent} from './pages/trade/trade.component';
// import {TxHistoryComponent} from './pages/tx-history/tx-history.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import {AirdropComponent} from './pages/airdrop/airdrop.component';
import { LeveragedVaultComponent } from './pages/leveraged/leveraged.component';
import { LendComponent } from './pages/lend/lend.component';

const routes: Routes = [
  { path: 'vaults', component: VaultComponent },
  // { path: 'tx-history', component: TxHistoryComponent },
  // { path: 'gov', component: GovComponent },
  // { path: 'gov/poll/new', component: GovPollNewComponent },
  // { path: 'gov/poll/:id', component: GovPollDetailComponent },
  // { path: 'dashboard', component: DashboardComponent },
  { path: 'lend', component: LendComponent },
  { path: 'airdrop', component: AirdropComponent },
  { path: 'leverage', component: LeveragedVaultComponent },
  { path: '**', redirectTo: '/vaults' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})

export class AppRoutingModule { }
