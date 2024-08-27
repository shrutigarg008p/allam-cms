import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RoleRoutingModule } from './role-routing.module';
import { ListRoleComponent } from './list/list-role.component';
import { AddRoleComponent } from './add/add-role.component';
import { EditRoleComponent } from './edit/edit-role.component';
import { ViewRoleComponent } from './view/view-role.component';
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
    RoleRoutingModule,
    SharedModule,
    //BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    Ng2SearchPipeModule,
    NgxPaginationModule,
    PipesModule
  ],
  declarations: [
  ListRoleComponent,
  AddRoleComponent,
  EditRoleComponent,
  ViewRoleComponent

  ]
})
export class RoleModule { }
