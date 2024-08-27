import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {ListQuestionComponent} from './list/list-question.component';
import {AddQuestionComponent} from './add/add-question.component';
import {EditQuestionComponent} from './edit/edit-question.component';
import {StudyexamComponent} from './studyexam.component';
import {DashboardComponent} from './dashboard.component';
import { SingleCompetitiveComponent } from './competitive/single-competitive.component';
import { SingleCurriculumComponent } from './curriculum/single-curriculum.component';

import { BulkCompetitiveComponent } from './competitive/bulk-competitive.component';
import { BulkCurriculumComponent } from './curriculum/bulk-curriculum.component';



const routes: Routes = [
  {
    path: 'single-view',
    component: ListQuestionComponent,
    data: {
      breadcrumb: 'question',
      icon: 'icofont-table bg-c-blue',
      breadcrumb_caption: '',
      status: false
    }
  },
  {
    path: '',
    component: DashboardComponent,
  },
  {
    path: 'create',
    component: StudyexamComponent,
  },
  {
    path: 'curriculum-single',
    component: SingleCurriculumComponent,
  },
  {
    path: 'competitive-single-old',
    component: SingleCompetitiveComponent,
  },
  {
    path: 'competitive-single/:quiz_temp_id',
    component: SingleCompetitiveComponent,
  },
  {
    path: 'curriculum-bulk',
    component: BulkCurriculumComponent,
  },
  {
    path: 'curriculum-bulk/:quiz_temp_id',
    component: BulkCurriculumComponent,
  },
  {
    path: 'competitive-bulk',
    component: BulkCompetitiveComponent,
  },
  {
    path: 'add-question',
    component: AddQuestionComponent,
    data: {
      breadcrumb: 'Add question',
      icon: 'icofont-table bg-c-blue',
      breadcrumb_caption: 'add question',
      status: false
    }
  },
  {
    path: 'edit-question/:questionId',
    component: EditQuestionComponent,
    data: {
      breadcrumb: 'Edit question',
      icon: 'icofont-table bg-c-blue',
      breadcrumb_caption: 'Edit question',
      status: false
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class QuestionRoutingModule { }
