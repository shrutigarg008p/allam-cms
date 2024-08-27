import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CategoryRoutingModule } from './category-routing.module';
import { ListCategoryComponent } from './list/list-category.component';
import { AddCategoryComponent } from './add/add-category.component';
import { EditCategoryComponent } from './edit/edit-category.component';
import {SharedModule} from '../../shared/shared.module';

//import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { NgxPaginationModule } from 'ngx-pagination';
import { PipesModule } from "../../pipes/pipes.module";
import { ImageCropperModule } from 'ngx-image-cropper';

@NgModule({
  imports: [
    CommonModule,
    CategoryRoutingModule,
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
  ListCategoryComponent,
  AddCategoryComponent,
  EditCategoryComponent

  ]
})
export class CategoryModule { }
