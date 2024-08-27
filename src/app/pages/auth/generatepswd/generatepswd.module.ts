import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GeneratepswdComponent } from './generatepswd.component';
import { GeneratepswdRoutingModule } from './generatepswd-routing.module';
import {SharedModule} from '../../../shared/shared.module';

import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    GeneratepswdRoutingModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule
  ],
  declarations: [GeneratepswdComponent]
})
export class GeneratepswdModule { }
