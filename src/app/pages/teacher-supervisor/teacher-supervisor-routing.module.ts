import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TeacherSupervisorComponent } from './teacher-supervisor.component';
import { QuestionComponent } from './question/question.component';

const routes: Routes = [
  {
    path: '',
    component: TeacherSupervisorComponent,
    data: {
      breadcrumb: 'General Competition',
      icon: 'icofont-table bg-c-blue',
      breadcrumb_caption: '',
      status: false
    }
  },
  {
    path: 'question/:teacher_id',
    component: QuestionComponent,
    data: {
      breadcrumb: 'Review Question',
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
export class TeacherSupervisorRoutingModule { }
