import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {StudyExamDownloadComponent} from './studyexam-downlad.component';

const routes: Routes = [
  {
    path: '',
    component: StudyExamDownloadComponent,
    data: {
      title: 'Study Exam Download Component'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StudyExamDownloadRoutingModule { }
