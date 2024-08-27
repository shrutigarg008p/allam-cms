import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GeneralCompetitionRoutingModule } from './general-competition-routing.module';
import { GeneralCompetitionComponent } from './general-competition.component';
import { AddGcComponent } from './add/add-gc.component';


//import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { NgxPaginationModule } from 'ngx-pagination';

import { PipesModule } from "../../pipes/pipes.module";

import { CKEditorModule } from '@ckeditor/ckeditor5-angular';


import { Pipe, PipeTransform} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser'
import { ImageCropperModule } from 'ngx-image-cropper';

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
    GeneralCompetitionRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    Ng2SearchPipeModule,
    NgxPaginationModule,
    PipesModule,
    CKEditorModule,
    ImageCropperModule
  ],
  declarations: [
  GeneralCompetitionComponent,
  AddGcComponent,
  SafeHtmlPipe

  ]
})
export class GeneralCompetitionModule { }
