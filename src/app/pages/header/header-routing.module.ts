import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {ListHeaderComponent} from './list/list-header.component';
import {AddHeaderComponent} from './add/add-header.component';
import {EditHeaderComponent} from './edit/edit-header.component';

const routes: Routes = [
  {
    path: '',
    component: ListHeaderComponent,
    data: {
      breadcrumb: 'header',
      icon: 'icofont-table bg-c-blue',
      breadcrumb_caption: '',
      status: false
    }
  },
  {
    path: 'add-header',
    component: AddHeaderComponent,
    data: {
      breadcrumb: 'Add header',
      icon: 'icofont-table bg-c-blue',
      breadcrumb_caption: 'add header',
      status: false
    }
  },
  {
    path: 'edit-header/:categoryId',
    component: EditHeaderComponent,
    data: {
      breadcrumb: 'Edit header',
      icon: 'icofont-table bg-c-blue',
      breadcrumb_caption: 'Edit header',
      status: false
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HeaderRoutingModule { }
