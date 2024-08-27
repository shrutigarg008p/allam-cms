import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MobileUsersRoutingModule } from './mobile-users-routing.module';
import { ListMobileUsersComponent } from './list/list-mobile-users.component';
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
    MobileUsersRoutingModule,
    SharedModule,
    //BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    Ng2SearchPipeModule,
    NgxPaginationModule,
    PipesModule
  ],
  declarations: [
  ListMobileUsersComponent
  ]
})
export class MobileUsersModule { }
