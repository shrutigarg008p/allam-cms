import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BasicForgotComponent } from './basic-forgot.component';
import {BasicForgotRoutingModule} from './basic-forgot-routing.module';
import {SharedModule} from '../../../../shared/shared.module';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    BasicForgotRoutingModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule
  ],
  declarations: [BasicForgotComponent]
})
export class BasicForgotModule { }
