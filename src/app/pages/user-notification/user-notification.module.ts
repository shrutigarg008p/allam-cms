import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UserNotificationRoutingModule } from './user-notification-routing.module'
import { UserNotificationComponent } from './user-notification.component';
import { OwlDateTimeModule, OwlNativeDateTimeModule, OWL_DATE_TIME_LOCALE } from 'ng-pick-datetime';
import { LoadingModule } from '../spinner/loading.module';
import { PipesModule } from '../../pipes/pipes.module'
import { from } from 'rxjs';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { NgxPaginationModule } from 'ngx-pagination';
import { DcService } from '../../services/dc.service';
import { ImageCropperModule } from 'ngx-image-cropper';

@NgModule({
  declarations: [UserNotificationComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    UserNotificationRoutingModule,
    OwlDateTimeModule,
    OwlNativeDateTimeModule,
    LoadingModule,
    PipesModule,
    Ng2SearchPipeModule,
    NgxPaginationModule,
    ImageCropperModule
  ],
  providers: [ DcService]
})
export class UserNotificationModule { }
