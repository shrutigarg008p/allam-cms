import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportComponent } from './report.component';
import { ReportRoutingModule } from './report.routing.module';
import { DcService } from '../../services/dc.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { OwlDateTimeModule, OwlNativeDateTimeModule, OWL_DATE_TIME_LOCALE } from 'ng-pick-datetime';
import { LoadingModule } from '../spinner/loading.module';
import { ChartsModule } from 'ng2-charts';


@NgModule({
  declarations: [ReportComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ReportRoutingModule,
    OwlDateTimeModule,
    OwlNativeDateTimeModule,
    LoadingModule,
    ChartsModule
  ],
  providers:[DcService]
})
export class ReportsModule { }
