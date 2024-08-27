import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BroadcasterRoutingModule } from './broadcaster-routing.module';
import { ListBroadcasterComponent } from './list/list-broadcaster.component';
import { AddBroadcasterComponent } from './add/add-broadcaster.component';
import { EditBroadcasterComponent } from './edit/edit-broadcaster.component';
import {SharedModule} from '../../shared/shared.module';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';


//import { BrowserModule } from '@angular/platform-browser';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { NgxPaginationModule } from 'ngx-pagination';
import { PipesModule } from "../../pipes/pipes.module";

@NgModule({
  imports: [
    CommonModule,
    BroadcasterRoutingModule,
    SharedModule,
    //BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    Ng2SearchPipeModule,
    NgxPaginationModule,
    PipesModule
  ],
  declarations: [
  ListBroadcasterComponent,
  AddBroadcasterComponent,
  EditBroadcasterComponent
  ]
})
export class BroadcasterModule { }
