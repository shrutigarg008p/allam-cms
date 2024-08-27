import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { QuestionRoutingModule } from './question-routing.module';
import { ListQuestionComponent } from './list/list-question.component';
import { AddQuestionComponent } from './add/add-question.component';
import { EditQuestionComponent } from './edit/edit-question.component';
import { StudyexamComponent } from './studyexam.component';
import { DashboardComponent } from './dashboard.component';
import { SingleCompetitiveComponent } from './competitive/single-competitive.component';
import { SingleCurriculumComponent } from './curriculum/single-curriculum.component';

import { BulkCompetitiveComponent } from './competitive/bulk-competitive.component';
import { BulkCurriculumComponent } from './curriculum/bulk-curriculum.component';


//import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { NgxPaginationModule } from 'ngx-pagination';

import { PipesModule } from "../pipes/pipes.module";

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
    QuestionRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    Ng2SearchPipeModule,
    NgxPaginationModule,
    PipesModule,
    CKEditorModule
  ],
  declarations: [
  ListQuestionComponent,
  AddQuestionComponent,
  EditQuestionComponent,
  StudyexamComponent,
  DashboardComponent,
  SingleCompetitiveComponent,
  SingleCurriculumComponent,
  BulkCompetitiveComponent,
  BulkCurriculumComponent,
  SafeHtmlPipe

  ]
})
export class QuestionModule { }
