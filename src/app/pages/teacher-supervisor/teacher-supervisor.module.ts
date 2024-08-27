import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TeacherSupervisorRoutingModule } from './teacher-supervisor-routing.module';
import { TeacherSupervisorComponent } from './teacher-supervisor.component';
import { QuestionComponent } from './question/question.component';


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
    TeacherSupervisorRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    Ng2SearchPipeModule,
    NgxPaginationModule,
    PipesModule,
    CKEditorModule,
    ImageCropperModule
  ],
  declarations: [
  TeacherSupervisorComponent,
  QuestionComponent,
  SafeHtmlPipe

  ]
})
export class TeacherSupervisorModule { }
