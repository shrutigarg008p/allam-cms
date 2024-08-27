import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HeaderRoutingModule } from './header-routing.module';
import { ListHeaderComponent } from './list/list-header.component';
import { AddHeaderComponent } from './add/add-header.component';
import { EditHeaderComponent } from './edit/edit-header.component';
import {SharedModule} from '../../shared/shared.module';

//import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { NgxPaginationModule } from 'ngx-pagination';
import { PipesModule } from "../../pipes/pipes.module";
import { ImageCropperModule } from 'ngx-image-cropper';

import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';

@NgModule({
  imports: [
    CommonModule,
    HeaderRoutingModule,
    SharedModule,
    //BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    Ng2SearchPipeModule,
    NgxPaginationModule,
    PipesModule,
    NgMultiSelectDropDownModule.forRoot(),
    ImageCropperModule
  ],
  declarations: [
  ListHeaderComponent,
  AddHeaderComponent,
  EditHeaderComponent

  ]
})
export class HeaderModule { }
