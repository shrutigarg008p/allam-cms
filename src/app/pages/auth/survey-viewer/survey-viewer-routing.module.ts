import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {SurveyViewerComponent} from './survey-viewer.component';

const routes: Routes = [
  {
    path: '',
    component: SurveyViewerComponent,
    data: {
      title: 'Survey Viewer Component'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SurveyViewerRoutingModule { }
