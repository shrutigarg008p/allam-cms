import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SpecialCompetitionComponent } from './special-competition.component';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SpecialCompetitionRoutingModule } from './special-competition-routing.module';
import { ListSpecialComponent} from './list/list-special.component';
import { EditSpecialCompetitionComponent} from './edit/edit-special-competition.component';
import { ViewDailyCompetitionComponent} from './view/view-daily-competition.component';
import { PipesModule } from '../../pipes/pipes.module';
import { LoadingModule } from '../spinner/loading.module';
import { DcService } from '../../services/dc.service';
import { ImageCropperModule } from 'ngx-image-cropper';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { NgxPaginationModule } from 'ngx-pagination';
import { from } from 'rxjs';
import { OwlDateTimeModule, OwlNativeDateTimeModule, OWL_DATE_TIME_LOCALE } from 'ng-pick-datetime';

@NgModule({
  declarations: [SpecialCompetitionComponent, ListSpecialComponent, EditSpecialCompetitionComponent, ViewDailyCompetitionComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SpecialCompetitionRoutingModule,
    PipesModule,
    Ng2SearchPipeModule,
    NgxPaginationModule,
    OwlDateTimeModule, 
    OwlNativeDateTimeModule,
    LoadingModule,
    ImageCropperModule
  ],
  providers : [ DcService ]
})
export class SpecialCompetitionModule { }
