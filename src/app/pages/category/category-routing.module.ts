import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {ListCategoryComponent} from './list/list-category.component';
import {AddCategoryComponent} from './add/add-category.component';
import {EditCategoryComponent} from './edit/edit-category.component';

const routes: Routes = [
  {
    path: '',
    component: ListCategoryComponent,
    data: {
      breadcrumb: 'category',
      icon: 'icofont-table bg-c-blue',
      breadcrumb_caption: '',
      status: false
    }
  },
  {
    path: 'add-category',
    component: AddCategoryComponent,
    data: {
      breadcrumb: 'Add category',
      icon: 'icofont-table bg-c-blue',
      breadcrumb_caption: 'add category',
      status: false
    }
  },
  {
    path: 'edit-category/:categoryId',
    component: EditCategoryComponent,
    data: {
      breadcrumb: 'Edit category',
      icon: 'icofont-table bg-c-blue',
      breadcrumb_caption: 'Edit category',
      status: false
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CategoryRoutingModule { }
