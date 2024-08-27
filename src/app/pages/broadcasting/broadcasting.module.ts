import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BroadcastingRoutingModule } from './broadcasting-routing.module';
import { BroadcastingComponent } from './broadcasting.component';
import { BroadcasterLiveComponent } from './broadcaster-live/broadcaster-live.component';
import { NgxAgoraModule } from 'ngx-agora';

//import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { NgxPaginationModule } from 'ngx-pagination';

import { PipesModule } from "../../pipes/pipes.module";

import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { environment } from '../../../environments/environment'

import { Pipe, PipeTransform} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser'

@Pipe({ name: 'safeHtml'})
export class SafeHtmlPipe implements PipeTransform  {
  constructor(private sanitized: DomSanitizer) {}
  transform(value) 
  {
    return this.sanitized.bypassSecurityTrustHtml(value);
  }
}

@NgModule({
  imports: [
    CommonModule,
    BroadcastingRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    Ng2SearchPipeModule,
    NgxPaginationModule,
    PipesModule,
    CKEditorModule,
    NgxAgoraModule.forRoot({ AppID: environment.agora.appId })
  ],
  declarations: [
    BroadcastingComponent,
    SafeHtmlPipe,
    BroadcasterLiveComponent
  ]
})
export class BroadcastingModule { }
