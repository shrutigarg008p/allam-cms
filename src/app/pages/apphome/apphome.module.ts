import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ApphomeRoutingModule } from './apphome-routing.module';
import { ListApphomeComponent } from './list/list-apphome.component';
import { AddApphomeComponent } from './add/add-apphome.component';
import { EditApphomeComponent } from './edit/edit-apphome.component';
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
    ApphomeRoutingModule,
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
  ListApphomeComponent,
  AddApphomeComponent,
  EditApphomeComponent

  ]
})
export class ApphomeModule { }
