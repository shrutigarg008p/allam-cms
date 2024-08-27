import { BrowserModule } from '@angular/platform-browser';
import {NgModule, NO_ERRORS_SCHEMA} from '@angular/core';

import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';
import { AdminComponent } from './layout/admin/admin.component';
import { BreadcrumbsComponent } from './layout/admin/breadcrumbs/breadcrumbs.component';
import { TitleComponent } from './layout/admin/title/title.component';
import { AuthComponent } from './layout/auth/auth.component';

import {SharedModule} from './shared/shared.module';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
// import additional
import {DatePipe} from '@angular/common';
import { HttpClientModule, HTTP_INTERCEPTORS } from "@angular/common/http";
import { HttpModule } from '@angular/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
//import {Format} from "./pipes/format";
import {ToasterModule, ToasterService} from 'angular2-toaster';
import { CategoryService } from './services/category.service';
import { RoleService } from './services/role.service';
import { UserService } from './services';

import { PocquestionService } from './services/studyexam/pocquestion.service';
import { QuestionService } from './services/studyexam/question.service';
import { CurriculumSingleService } from './services/studyexam/curriculum-single.service';
import { CompetitiveSingleService } from './services/studyexam/competitive-single.service';
import { TsupervisorService } from './services/tsupervisor.service';
import { GcService } from './services/gc.service';

import { ApphomeService } from './services/apphome.service';

import { OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime';
//import { OwlDateTimeModule, OwlNativeDateTimeModule } from '../../projects/picker/src/public_api';

import { RichTextEditorAllModule } from '@syncfusion/ej2-angular-richtexteditor';
import { GlobalHttpInterceptorService } from './http-error.interceptor';

import { ImageCropperModule } from 'ngx-image-cropper';

@NgModule({
  declarations: [
    AppComponent,
    AdminComponent,
    BreadcrumbsComponent,
    TitleComponent,
    AuthComponent,
   
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    SharedModule,
    HttpModule,
    HttpClientModule ,
    FormsModule,
    ReactiveFormsModule,
    Ng2SearchPipeModule,
    NgxPaginationModule,
    ToasterModule.forRoot(),
    NgMultiSelectDropDownModule.forRoot(),
    RichTextEditorAllModule,
    OwlDateTimeModule, 
    OwlNativeDateTimeModule,
    ImageCropperModule
  ],
  
  schemas: [ NO_ERRORS_SCHEMA ],
  providers: [CategoryService,
              RoleService,
              ToasterService,
              UserService,
              QuestionService,
              PocquestionService,
              CurriculumSingleService,
              CompetitiveSingleService,
              TsupervisorService, 
              ApphomeService,
              GcService, DatePipe,
              { provide: HTTP_INTERCEPTORS, useClass: GlobalHttpInterceptorService, multi: true  }
            ], 
  bootstrap: [AppComponent]
})
export class AppModule { 
  
}
