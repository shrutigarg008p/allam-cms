import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {ListUsersComponent} from './list/list-users.component';
import {AddUsersComponent} from './add/add-users.component';
import {EditUsersComponent} from './edit/edit-users.component';


const routes: Routes = [
  {
    path: '',
    component: ListUsersComponent,
    data: {
      breadcrumb: 'users',
      icon: 'icofont-table bg-c-blue',
      breadcrumb_caption: '',
      status: false
    }
  },
  {
    path: 'add-user',
    component: AddUsersComponent,
    data: {
      breadcrumb: 'Add user',
      icon: 'icofont-table bg-c-blue',
      breadcrumb_caption: 'add user',
      status: false
    }
  },
  {
    path: 'edit-user/:userId',
    component: EditUsersComponent,
    data: {
      breadcrumb: 'Edit User',
      icon: 'icofont-table bg-c-blue',
      breadcrumb_caption: 'Edit user',
      status: false
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UsersRoutingModule { }
