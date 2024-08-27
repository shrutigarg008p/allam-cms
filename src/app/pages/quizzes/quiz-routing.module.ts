import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {ListQuizComponent} from './list/list-quiz.component';
import {AddQuizComponent} from './add/add-quiz.component';
import {EditQuizComponent} from './edit/edit-quiz.component';

const routes: Routes = [
  {
    path: '',
    component: ListQuizComponent,
    data: {
      breadcrumb: 'quiz',
      icon: 'icofont-table bg-c-blue',
      breadcrumb_caption: '',
      status: false
    }
  },
  {
    path: 'add-quiz',
    component: AddQuizComponent,
    data: {
      breadcrumb: 'Add quiz',
      icon: 'icofont-table bg-c-blue',
      breadcrumb_caption: 'add Quiz',
      status: false
    }
  },
  {
    path: 'edit-quiz/:quizId',
    component: EditQuizComponent,
    data: {
      breadcrumb: 'Edit quiz',
      icon: 'icofont-table bg-c-blue',
      breadcrumb_caption: 'Edit quiz',
      status: false
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class QuizRoutingModule { }
