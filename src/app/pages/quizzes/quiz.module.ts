import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { QuizRoutingModule } from './quiz-routing.module';
import { ListQuizComponent } from './list/list-quiz.component';
import { AddQuizComponent } from './add/add-quiz.component';
import { EditQuizComponent } from './edit/edit-quiz.component';
import {SharedModule} from '../../shared/shared.module';

//import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { NgxPaginationModule } from 'ngx-pagination';

@NgModule({
  imports: [
    CommonModule,
    QuizRoutingModule,
    SharedModule,
    //BrowserModule,
    FormsModule,
    Ng2SearchPipeModule,
    NgxPaginationModule
  ],
  declarations: [
  ListQuizComponent,
  AddQuizComponent,
  EditQuizComponent
  ]
})
export class QuizModule { }
