import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UserNotificationComponent } from './user-notification.component';

  import { from } from 'rxjs';

const routes: Routes = [
  {
    path: '',
    component: UserNotificationComponent,
    data: {
      breadcrumb: 'UserNotification',
      icon: 'icofont-table bg-c-blue',
      breadcrumb_caption: '',
      status: false
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserNotificationRoutingModule { }
