import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {SharedModule} from '../../shared/shared.module';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { MessagingRoutingModule } from './messaging-routing.module';
import { MessagesChatComponent } from './messages-chat/messages-chat.component';



@NgModule({
  declarations: [MessagesChatComponent],
  imports: [
    CommonModule,
    MessagingRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    SharedModule

  ]
})
export class MessagingModule { }
