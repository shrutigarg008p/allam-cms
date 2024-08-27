import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReferendumRoutingModule } from './referendum-routing.module';
import { ListReferendumComponent } from './list/list-referendum.component';

import { AudienceReferendumComponent } from './audience/audience-referendum.component';
import { SurveyCreateComponent } from './survey-create/survey-create.component';
import { SurveyCreatorComponent } from './survey-create/survey.creator.component';
import { DownloadReferendumComponent } from './download/download-referendum.component';
import { SurveyAnalysisComponent } from './analysis/survey-analysis.component';
import { SurveyAnalyticsComponent } from './analysis/survey.analytics.component';
//import { SurveyViewerComponent } from './survey-viewer/survey-viewer.component';
//import { SurveyComponent } from './survey-viewer/survey.component';
import { SharedModule } from '../../shared/shared.module';

//import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AddReferendumComponent } from './add/add-referendum.component';
import { EditReferendumComponent } from './edit/edit-referendum.component';
//import { BrowserModule } from '@angular/platform-browser';

import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { NgxPaginationModule } from 'ngx-pagination';
import { PipesModule } from "../../pipes/pipes.module";
import { AgGridModule } from 'ag-grid-angular';

@NgModule({
  imports: [
    CommonModule,
    ReferendumRoutingModule,
    SharedModule,
    //BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    Ng2SearchPipeModule,
    NgxPaginationModule,
    PipesModule,
    AgGridModule.withComponents([])
  ],
  declarations: [
  ListReferendumComponent,

  AudienceReferendumComponent,
  SurveyCreateComponent,
  SurveyCreatorComponent,
  DownloadReferendumComponent,
  AddReferendumComponent,
  EditReferendumComponent,
  SurveyAnalysisComponent,
  SurveyAnalyticsComponent

  ]
})
export class ReferendumModule { }
