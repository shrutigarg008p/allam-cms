import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import {SharedModule} from '../../shared/shared.module';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { MasterdataRoutingModule } from './masterdata-routing.module';
import { ListSchoolComponent } from './school/list/list-school.component';
import { AddSchoolComponent } from './school/add/add-school.component';
import { EditSchoolComponent } from './school/edit/edit-school.component';
import { ListUniversityComponent } from './university/list/list-university.component';
import { AddUniversityComponent } from './university/add/add-university.component';
import { EditUniversityComponent } from './university/edit/edit-university.component';
import { ListQuizComponent } from './quiz/list/list-quiz.component';
import { AddQuizComponent } from './quiz/add/add-quiz.component';
import { EditQuizComponent } from './quiz/edit/edit-quiz.component';
import { ListSubquizComponent } from './subquiz/list/list-subquiz.component';
import { AddSubquizComponent } from './subquiz/add/add-subquiz.component';
import { EditSubquizComponent } from './subquiz/edit/edit-subquiz.component';
import { ListSubjectComponent } from './subject/list/list-subject.component';
import { AddSubjectComponent } from './subject/add/add-subject.component';
import { EditSubjectComponent } from './subject/edit/edit-subject.component';
import { ListDistrictComponent } from './district/list/list-district.component';
import { AddDistrictComponent } from './district/add/add-district.component';
import { EditDistrictComponent } from './district/edit/edit-district.component';

import { ListCountryComponent } from './country/list/list-country.component';
import { AddCountryComponent } from './country/add/add-country.component';
import { EditCountryComponent } from './country/edit/edit-country.component';

//import { BrowserModule } from '@angular/platform-browser';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { NgxPaginationModule } from 'ngx-pagination';
import { PipesModule } from "../../pipes/pipes.module";

import { ImageCropperModule } from 'ngx-image-cropper';

@NgModule({
  imports: [
    CommonModule,
    MasterdataRoutingModule,
    SharedModule,
    //BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    Ng2SearchPipeModule,
    NgxPaginationModule,
    PipesModule,
    ImageCropperModule
  ],
  declarations: [
  ListSchoolComponent,
  AddSchoolComponent,
  EditSchoolComponent,
  ListUniversityComponent,
  AddUniversityComponent,
  EditUniversityComponent,
  ListQuizComponent,
  AddQuizComponent,
  EditQuizComponent,
  ListSubquizComponent,
  AddSubquizComponent,
  EditSubquizComponent,
  ListSubjectComponent,
  AddSubjectComponent,
  EditSubjectComponent,
  ListDistrictComponent,
  AddDistrictComponent,
  EditDistrictComponent,
  ListCountryComponent,
  AddCountryComponent,
  EditCountryComponent
  ]
})
export class MasterdataModule { }
