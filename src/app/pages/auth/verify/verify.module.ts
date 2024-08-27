import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VerifyComponent } from './verify.component';
import {VerifyRoutingModule} from './verify-routing.module';
import {SharedModule} from '../../../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    VerifyRoutingModule,
    SharedModule
  ],
  declarations: [VerifyComponent]
})
export class VerifyModule { }
