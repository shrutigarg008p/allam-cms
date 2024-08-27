import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SpecialCompetitionComponent } from './special-competition.component';
import { ListSpecialComponent} from './list/list-special.component';
import { EditSpecialCompetitionComponent} from './edit/edit-special-competition.component';
import{ ViewDailyCompetitionComponent } from './view/view-daily-competition.component';

const routes: Routes = [
  {
    path: '',
    component: ListSpecialComponent,
    data: {
      breadcrumb: 'special-competition',
      icon: 'icofont-table bg-c-blue',
      breadcrumb_caption: '',
      status: false
    }
  },
  {
    path: 'add',
    component: SpecialCompetitionComponent,
    data: {
      breadcrumb: 'special-competition',
      icon: 'icofont-table bg-c-blue',
      breadcrumb_caption: '',
      status: false
    }
  },
  {
    path: 'edit/:id',
    component: EditSpecialCompetitionComponent,
    data: {
      breadcrumb: 'special-competition',
      icon: 'icofont-table bg-c-blue',
      breadcrumb_caption: '',
      status: false
    }
  },
  {
    path: 'list',
    component: ViewDailyCompetitionComponent,
    data: {
      breadcrumb: 'special-view',
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
export class SpecialCompetitionRoutingModule { }
