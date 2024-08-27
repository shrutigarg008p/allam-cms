import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {MessagesChatComponent} from './messages-chat/messages-chat.component';


const routes: Routes = [
  {
    path: '',
    component: MessagesChatComponent,
    data: {
      breadcrumb: 'messages',
      icon: 'icofont-table bg-c-blue',
      breadcrumb_caption: '',
      status: false
    }
  },
  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MessagingRoutingModule { }
