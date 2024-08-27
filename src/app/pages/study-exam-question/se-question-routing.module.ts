import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SeQuestionComponent } from './se-question.component';
import { SeDashboardComponent } from './se-dashboard.component';

const routes: Routes = [
  {
    path: '',
    component: SeDashboardComponent,
    data: {
      breadcrumb: 'Study Exam',
      icon: 'icofont-table bg-c-blue',
      breadcrumb_caption: '',
      status: false
    }
  },
  {
    path: 'type/:quiz_type',
    component: SeQuestionComponent,
    data: {
      breadcrumb: 'Study Exam Question Type',
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
export class SeQuestionRoutingModule { }
