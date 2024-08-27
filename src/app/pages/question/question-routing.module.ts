import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {ListQuestionComponent} from './list/list-question.component';
import {AddQuestionComponent} from './add/add-question.component';
import {EditQuestionComponent} from './edit/edit-question.component';

const routes: Routes = [
  {
    path: '',
    component: ListQuestionComponent,
    data: {
      breadcrumb: 'question',
      icon: 'icofont-table bg-c-blue',
      breadcrumb_caption: '',
      status: false
    }
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
