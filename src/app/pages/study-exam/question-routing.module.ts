import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {StudyexamComponent} from './studyexam.component';
import {DashboardComponent} from './dashboard.component';
import { SingleCompetitiveComponent } from './competitive/single-competitive.component';
import { SingleCurriculumComponent } from './curriculum/single-curriculum.component';

import { BulkCompetitiveComponent } from './competitive/bulk-competitive.component';
import { BulkCurriculumComponent } from './curriculum/bulk-curriculum.component';

const routes: Routes = [
  {
    path: '',
    component: DashboardComponent,
    data: {
      breadcrumb: 'Study Exam',
      icon: 'icofont-table bg-c-blue',
      breadcrumb_caption: '',
      status: false
    }
  },
  {
    path: 'create',
    component: StudyexamComponent,
    data: {
      breadcrumb: 'Study Exam',
      icon: 'icofont-table bg-c-blue',
      breadcrumb_caption: '',
      status: false
    }
  },
  {
    path: 'create/:quiz_temp_id',
    component: StudyexamComponent,
    data: {
      breadcrumb: 'Study Exam',
      icon: 'icofont-table bg-c-blue',
      breadcrumb_caption: '',
      status: false
    }
  },
  {
    path: 'curriculum-single',
    component: SingleCurriculumComponent,
    data: {
      breadcrumb: 'Study Exam',
      icon: 'icofont-table bg-c-blue',
      breadcrumb_caption: '',
      status: false
    }
  },
  {
    path: 'competitive-single-old',
    component: SingleCompetitiveComponent,
    data: {
      breadcrumb: 'Study Exam',
      icon: 'icofont-table bg-c-blue',
      breadcrumb_caption: '',
      status: false
    }
  },
  {
    path: 'competitive-single/:quiz_temp_id',
    component: SingleCompetitiveComponent,
    data: {
      breadcrumb: 'Study Exam',
      icon: 'icofont-table bg-c-blue',
      breadcrumb_caption: '',
      status: false
    }
  },
  {
    path: 'curriculum-bulk',
    component: BulkCurriculumComponent,
    data: {
      breadcrumb: 'Study Exam',
      icon: 'icofont-table bg-c-blue',
      breadcrumb_caption: '',
      status: false
    }
  },
  {
    path: 'curriculum-bulk/:quiz_temp_id',
    component: BulkCurriculumComponent,
    data: {
      breadcrumb: 'Study Exam',
      icon: 'icofont-table bg-c-blue',
      breadcrumb_caption: '',
      status: false
    }
  },
  {
    path: 'competitive-bulk',
    component: BulkCompetitiveComponent,
    data: {
      breadcrumb: 'Study Exam',
      icon: 'icofont-table bg-c-blue',
      breadcrumb_caption: '',
      status: false
    }
  },
  {
    path: 'competitive-bulk/:quiz_temp_id',
    component: BulkCompetitiveComponent,
    data: {
      breadcrumb: 'Study Exam',
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
export class QuestionRoutingModule { }
