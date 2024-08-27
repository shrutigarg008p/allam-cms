import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DailyCompetitionComponent } from './daily-competition.component';
import { ListDailyComponent } from './list/list-daily.component';
import { EditDailyCompetitionComponent } from './edit/edit-daily-competition.component';
import { ViewDailyCompetitionComponent } from './view/view-daily-competition.component';

const routes: Routes = [
  {
    path: 'add',
    component: DailyCompetitionComponent,
    data: {
      breadcrumb: 'daily-competition',
      icon: 'icofont-table bg-c-blue',
      breadcrumb_caption: '',
      status: false
    }
  },
  {
    path: '',
    component: ListDailyComponent,
    data: {
      breadcrumb: 'daily-list',
      icon: 'icofont-table bg-c-blue',
      breadcrumb_caption: '',
      status: false
    }
  },
  {
    path: 'edit/:id',
    component: EditDailyCompetitionComponent,
    data: {
      breadcrumb: 'daily-edit',
      icon: 'icofont-table bg-c-blue',
      breadcrumb_caption: '',
      status: false
    }
  },
  {
    path: 'list',
    component: ViewDailyCompetitionComponent,
    data: {
      breadcrumb: 'daily-view',
      icon: 'icofont-table bg-c-blue',
      breadcrumb_caption: '',
      status: false
    },
    children: [
      //{ path: 'group', component: ListLeagueComponent, data: { viewOption: 'group', breadcrumb:'Grouping', status: false } },
      //{ path: 'list', component: ListLeagueComponent, data: { viewOption: 'list', breadcrumb:'List', status: false } },
      { path: 'update/:id', component: ViewDailyCompetitionComponent, data: { viewOption: 'update' } },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DailyCompetitionRoutingModule { }
