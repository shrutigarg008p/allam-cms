import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AdminReferendumRoutingModule } from './admin-referendum-routing.module';
import { AdminReferendumComponent } from './admin-referendum.component';
import { PreviewReferendumComponent } from './preview-referendum.component';
import { PreviewSurveyComponent } from './preview-survey.component';
@NgModule({
  declarations: [AdminReferendumComponent, PreviewReferendumComponent, PreviewSurveyComponent],
  imports: [
    CommonModule,
    AdminReferendumRoutingModule,
    FormsModule
  ]
})
export class AdminReferendumModule { }
