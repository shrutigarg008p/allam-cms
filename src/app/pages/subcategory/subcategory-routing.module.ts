import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';


import { SubCategoryComponent } from './list/sub-category.component';
import { AddSubCategoryComponent } from './add/add-sub-category.component';
import { EditSubCategoryComponent } from './edit/edit-sub-category.component';

const routes: Routes = [
  {
    path: '',
    component: SubCategoryComponent,
    data: {
      breadcrumb: 'Sub Category',
      icon: 'icofont-table bg-c-blue',
      breadcrumb_caption: '',
      status: false
    }
  },
  {
    path: 'sub-category',
    component: SubCategoryComponent,
    data: {
      breadcrumb: 'Sub Category',
      icon: 'icofont-table bg-c-blue',
      breadcrumb_caption: '',
      status: false
    }
  },
  {
    path: 'add',
    component: AddSubCategoryComponent,
    data: {
      breadcrumb: 'Category',
      icon: 'icofont-table bg-c-blue',
      breadcrumb_caption: '',
      status: false
    }
  },
  {
    path: 'edit',
    component: EditSubCategoryComponent,
    data: {
      breadcrumb: 'Category',
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
export class SubCategoryRoutingModule { }
