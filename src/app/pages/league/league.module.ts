import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LeagueCompetitionComponent } from './league.component';
import { ListLeagueComponent } from './list/list-league.component';
import { EditLeagueCompetitionComponent } from './edit/edit-league-competition.component';
import { ViewDailyCompetitionComponent } from './view/view-league-competition.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LeagueCompetitionRoutingModule } from './league-routing.module';
import { PipesModule } from '../../pipes/pipes.module';
import { LeagueService } from '../../services/league.service';
import { MultiFilesUploadComponent } from './multi-files-upload/multi-files-upload.component';
import { LoadingModule } from '../spinner/loading.module';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { NgxPaginationModule } from 'ngx-pagination';
import { DcService } from '../../services/dc.service';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { ImageCropperModule } from 'ngx-image-cropper';
import { from } from 'rxjs';

import { OwlDateTimeModule, OwlNativeDateTimeModule, OWL_DATE_TIME_LOCALE } from 'ng-pick-datetime';

@NgModule({
  declarations: [LeagueCompetitionComponent, ListLeagueComponent, 
    EditLeagueCompetitionComponent, ViewDailyCompetitionComponent, 
    MultiFilesUploadComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    LeagueCompetitionRoutingModule,
    PipesModule,
    Ng2SearchPipeModule,
    NgxPaginationModule,
    NgMultiSelectDropDownModule,
    OwlDateTimeModule, 
    OwlNativeDateTimeModule,
    LoadingModule,
    ImageCropperModule
  ], 
  providers : [ LeagueService, DcService]
})
export class LeagueCompetitionModule { }
