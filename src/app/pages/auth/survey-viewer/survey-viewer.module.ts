import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SurveyViewerRoutingModule } from './survey-viewer-routing.module';
import { SurveyViewerComponent } from './survey-viewer.component';
import { SurveyComponent } from './survey.component';
import {SharedModule} from '../../../shared/shared.module';

import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    SurveyViewerRoutingModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule
  ],
  declarations: [SurveyComponent, SurveyViewerComponent]
})
export class SurveyViewerModule { }
