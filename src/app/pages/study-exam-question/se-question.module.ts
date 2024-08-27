import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SeQuestionRoutingModule } from './se-question-routing.module';
import { SeQuestionComponent } from './se-question.component';
import { SeDashboardComponent } from './se-dashboard.component';


//import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { NgxPaginationModule } from 'ngx-pagination';

import { PipesModule } from "../../pipes/pipes.module";

import { CKEditorModule } from '@ckeditor/ckeditor5-angular';


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
    SeQuestionRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    Ng2SearchPipeModule,
    NgxPaginationModule,
    PipesModule,
    CKEditorModule
  ],
  declarations: [
  SeQuestionComponent,
  SeDashboardComponent,
  SafeHtmlPipe

  ]
})
export class SeQuestionModule { }
