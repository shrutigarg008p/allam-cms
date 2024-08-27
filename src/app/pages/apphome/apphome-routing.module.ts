import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {ListApphomeComponent} from './list/list-apphome.component';
import {AddApphomeComponent} from './add/add-apphome.component';
import {EditApphomeComponent} from './edit/edit-apphome.component';

const routes: Routes = [
  {
    path: '',
    component: ListApphomeComponent,
    data: {
      breadcrumb: 'App Home',
      icon: 'icofont-table bg-c-blue',
      breadcrumb_caption: '',
      status: false
    }
  },
  {
    path: 'add-apphome-not-use',
    component: AddApphomeComponent,
    data: {
      breadcrumb: 'Add AppHome',
      icon: 'icofont-table bg-c-blue',
      breadcrumb_caption: 'add apphome',
      status: false
    }
  },
  {
    path: 'edit-apphome/:apphomeId',
    component: EditApphomeComponent,
    data: {
      breadcrumb: 'Edit Apphome',
      icon: 'icofont-table bg-c-blue',
      breadcrumb_caption: 'Edit Apphome',
      status: false
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ApphomeRoutingModule { }
