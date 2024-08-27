import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { QuestionRoutingModule } from './question-routing.module';
import { ListQuestionComponent } from './list/list-question.component';
import { AddQuestionComponent } from './add/add-question.component';
import { EditQuestionComponent } from './edit/edit-question.component';
import {SharedModule} from '../../shared/shared.module';

//import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { NgxPaginationModule } from 'ngx-pagination';
//import {OrderrByPipe} from '../../pipes/orderby.pipe';
//import {Format} from "../../pipes/format";
import { PipesModule } from "../../pipes/pipes.module";

import { RichTextEditorAllModule } from '@syncfusion/ej2-angular-richtexteditor';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';

@NgModule({
  imports: [
    CommonModule,
    QuestionRoutingModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    Ng2SearchPipeModule,
    NgxPaginationModule,
    PipesModule,
    RichTextEditorAllModule,
    CKEditorModule
  ],
  declarations: [
  ListQuestionComponent,
  AddQuestionComponent,
  EditQuestionComponent

  ]
})
export class QuestionModule { }
