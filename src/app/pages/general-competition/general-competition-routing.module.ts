import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { GeneralCompetitionComponent } from './general-competition.component';
import { AddGcComponent } from './add/add-gc.component';

const routes: Routes = [
  {
    path: '',
    component: GeneralCompetitionComponent,
    data: {
      breadcrumb: 'General Competition',
      icon: 'icofont-table bg-c-blue',
      breadcrumb_caption: '',
      status: false
    }
  },
  {
    path: 'add',
    component: AddGcComponent,
    data: {
      breadcrumb: 'Add GC',
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
export class GeneralCompetitionRoutingModule { }
