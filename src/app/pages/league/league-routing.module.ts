import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LeagueCompetitionComponent } from './league.component';
import { ListLeagueComponent } from './list/list-league.component';
import { EditLeagueCompetitionComponent } from './edit/edit-league-competition.component';
import { ViewDailyCompetitionComponent } from './view/view-league-competition.component';
  import { from } from 'rxjs';

const routes: Routes = [
  {
    path: 'add',
    component: LeagueCompetitionComponent,
    data: {
      breadcrumb: 'League-competition',
      icon: 'icofont-table bg-c-blue',
      breadcrumb_caption: '',
      status: false
    }
  },
  {
    path: 'list',
    component: ViewDailyCompetitionComponent,
    data: {
      breadcrumb: 'League-competition',
      icon: 'icofont-table bg-c-blue',
      breadcrumb_caption: '',
      status: false
    }
  },
  {
    path: 'edit/:id',
    component: EditLeagueCompetitionComponent,
    data: {
      breadcrumb: 'League-competition',
      icon: 'icofont-table bg-c-blue',
      breadcrumb_caption: '',
      status: false
    }
  },
  {
    path: '',
    component: ListLeagueComponent,
    data: {
      breadcrumb: 'List League Component',
      icon: 'icofont-table bg-c-blue',
      breadcrumb_caption: 'List League',
      status: false
    },
    children: [
      { path: 'group', component: ListLeagueComponent, data: { viewOption: 'group', breadcrumb:'Grouping', status: false } },
      { path: 'list-dash', component: ListLeagueComponent, data: { viewOption: 'list', breadcrumb:'List', status: false } },
      { path: 'update/:id', component: ListLeagueComponent, data: { viewOption: 'update' } },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LeagueCompetitionRoutingModule { }
