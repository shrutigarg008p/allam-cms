import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {ListReferendumComponent} from './list/list-referendum.component';

import {AudienceReferendumComponent} from './audience/audience-referendum.component';
import {SurveyCreateComponent} from './survey-create/survey-create.component';
import {DownloadReferendumComponent} from './download/download-referendum.component';
import {SurveyAnalysisComponent} from './analysis/survey-analysis.component';
//import {SurveyViewerComponent} from './survey-viewer/survey-viewer.component';
import {AddReferendumComponent} from './add/add-referendum.component';
import {EditReferendumComponent} from './edit/edit-referendum.component';

const routes: Routes = [
  {
    path: '',
    component: ListReferendumComponent,
    data: {
      breadcrumb: 'referendum',
      icon: 'icofont-table bg-c-blue',
      breadcrumb_caption: '',
      status: false
    }
  },
  {
    path: 'audience-referendum/:id',

    component: AudienceReferendumComponent,
    data: {
      breadcrumb: 'Add audience referendum',
      icon: 'icofont-table bg-c-blue',
      breadcrumb_caption: 'add audience referendum',
      status: false
    }
  },
  {
    path: 'add-referendum',
    component: AddReferendumComponent,
    data: {
      breadcrumb: 'Add Referendum',
      icon: 'icofont-table bg-c-blue',
      breadcrumb_caption: 'add Referendum',
      status: false
    }
  },
  {
    path: 'create-survey/:name/:id',
    component: SurveyCreateComponent,
    data: {
      breadcrumb: 'create survey',
      icon: 'icofont-table bg-c-blue',
      breadcrumb_caption: 'create survey',
      status: false
    }
  },
  {
    path: 'edit-referendum/:referendumId',
    component: EditReferendumComponent,
    data: {
      breadcrumb: 'Edit Referendum',
      icon: 'icofont-table bg-c-blue',
      breadcrumb_caption: 'Edit Referendum',
      status: false
    }
  },
  {
    path: 'download-referendum/:referendumId',
    component: DownloadReferendumComponent,
    data: {
      breadcrumb: 'Download Referendum',
      icon: 'icofont-table bg-c-blue',
      breadcrumb_caption: 'Download Referendum',
      status: false
    }
  },
  {
    path: 'analysis-referendum/:id',
    component: SurveyAnalysisComponent,
    data: {
      breadcrumb: 'Analysis Referendum',
      icon: 'icofont-table bg-c-blue',
      breadcrumb_caption: 'Analysis Referendum',
      status: false
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReferendumRoutingModule { }
