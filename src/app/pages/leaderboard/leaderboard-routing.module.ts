import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LeaderboardComponent } from './leaderboard.component';

  import { from } from 'rxjs';

const routes: Routes = [
  {
    path: '',
    component: LeaderboardComponent,
    data: {
      breadcrumb: 'Leaderboard',
      icon: 'icofont-table bg-c-blue',
      breadcrumb_caption: '',
      status: false
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LeaderboardRoutingModule { }
