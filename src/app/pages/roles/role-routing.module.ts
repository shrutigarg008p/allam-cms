import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {ListRoleComponent} from './list/list-role.component';
import {AddRoleComponent} from './add/add-role.component';
import {EditRoleComponent} from './edit/edit-role.component';
import { ViewRoleComponent } from './view/view-role.component';


const routes: Routes = [
  {
    path: '',
    component: ListRoleComponent,
    data: {
      breadcrumb: 'role',
      icon: 'icofont-table bg-c-blue',
      breadcrumb_caption: '',
      status: false
    }
  },
  {
    path: 'add-role',
    component: AddRoleComponent,
    data: {
      breadcrumb: 'Add role',
      icon: 'icofont-table bg-c-blue',
      breadcrumb_caption: 'add role',
      status: false
    }
  },
  {
    path: 'edit-role/:roleId',
    component: EditRoleComponent,
    data: {
      breadcrumb: 'Edit role',
      icon: 'icofont-table bg-c-blue',
      breadcrumb_caption: 'Edit role',
      status: false
    }
  },
  {
    path: 'view-role/:roleId',
    component: ViewRoleComponent,
    data: {
      breadcrumb: 'View Role',
      icon: 'icofont-table bg-c-blue',
      breadcrumb_caption: 'View Role',
      status: false
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RoleRoutingModule { }
