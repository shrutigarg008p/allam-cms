import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserReportRoutingModule } from './user-report-routing.module'
import { UserReportComponent } from './user-report.component';
import { OwlDateTimeModule, OwlNativeDateTimeModule, OWL_DATE_TIME_LOCALE } from 'ng-pick-datetime';
import { LoadingModule } from '../spinner/loading.module';
import { PipesModule } from '../../pipes/pipes.module'
import { from } from 'rxjs';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { NgxPaginationModule } from 'ngx-pagination';
import { DcService } from '../../services/dc.service';

@NgModule({
  declarations: [UserReportComponent],
  imports: [
    CommonModule,
    FormsModule,
    UserReportRoutingModule,
    OwlDateTimeModule,
    OwlNativeDateTimeModule,
    LoadingModule,
    PipesModule,
    Ng2SearchPipeModule,
    NgxPaginationModule,
  ],
  providers: [ DcService]
})
export class UserReportModule { }
