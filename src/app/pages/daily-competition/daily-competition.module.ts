import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DailyCompetitionComponent } from './daily-competition.component';
import { MultiStepFormComponent } from '../multi-step-form/multi-step-form.component';
import { AccountDetailsComponent } from './account-details.component';
import { DataDetailsComponent } from './data-details.component';
import { DateTimeComponent } from './date-time.component';


import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DailyCompetitionRoutingModule } from './daily-competition-routing.module';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { NgxPaginationModule } from 'ngx-pagination';

import { PipesModule } from '../../pipes/pipes.module';
import { DcService } from '../../services/dc.service';
import { ListDailyComponent } from './list/list-daily.component';
import { EditDailyCompetitionComponent } from './edit/edit-daily-competition.component';
import { ViewDailyCompetitionComponent } from './view/view-daily-competition.component';
import { LoadingModule } from '../spinner/loading.module';
import { ImageCropperModule } from 'ngx-image-cropper';

import { OwlDateTimeModule, OwlNativeDateTimeModule, OWL_DATE_TIME_LOCALE } from 'ng-pick-datetime';

@NgModule({
  declarations: [MultiStepFormComponent, DailyCompetitionComponent, 
    AccountDetailsComponent, DataDetailsComponent, DateTimeComponent, 
    ListDailyComponent, EditDailyCompetitionComponent, 
    ViewDailyCompetitionComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DailyCompetitionRoutingModule,
    NgxPaginationModule,
    Ng2SearchPipeModule,
    PipesModule,
    OwlDateTimeModule, 
    OwlNativeDateTimeModule,
    LoadingModule,
    ImageCropperModule
  ],
  providers : [ DcService, {provide: OWL_DATE_TIME_LOCALE, useValue: 'en-IN'} ]
})
export class DailyCompetitionModule { }
