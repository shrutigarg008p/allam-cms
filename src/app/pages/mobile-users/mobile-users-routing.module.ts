import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {ListMobileUsersComponent} from './list/list-mobile-users.component';


const routes: Routes = [
  {
    path: '',
    component: ListMobileUsersComponent,
    data: {
      breadcrumb: 'mobile-users',
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
export class MobileUsersRoutingModule { }
