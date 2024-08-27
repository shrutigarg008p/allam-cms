import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';

import { HttpClientModule } from "@angular/common/http";
import { HttpModule } from '@angular/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { NgxPaginationModule } from 'ngx-pagination';
//import {Format} from "./pipes/format";
import {ToasterModule, ToasterService} from 'angular2-toaster';
import { PocquestionService } from './services/pocquestion.service';
import { QuestionService } from './services/question.service';
import { CurriculumSingleService } from './services/curriculum-single.service';
import { CompetitiveSingleService } from './services/competitive-single.service';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    CKEditorModule,
    HttpModule,
    HttpClientModule ,
    FormsModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    Ng2SearchPipeModule,
    NgxPaginationModule,
    ToasterModule.forRoot(),
  ],
  providers: [ToasterService,
              QuestionService,
              PocquestionService,
              CurriculumSingleService,
              CompetitiveSingleService],
  bootstrap: [AppComponent]
})
export class AppModule { }
