import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThanksComponent } from './thanks.component';
import {ThanksRoutingModule} from './thanks-routing.module';
import {SharedModule} from '../../../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    ThanksRoutingModule,
    SharedModule
  ],
  declarations: [ThanksComponent]
})
export class ThanksModule { }
