import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {ListBroadcasterComponent} from './list/list-broadcaster.component';
import {AddBroadcasterComponent} from './add/add-broadcaster.component';
import {EditBroadcasterComponent} from './edit/edit-broadcaster.component';


const routes: Routes = [
  {
    path: '',
    component: ListBroadcasterComponent,
    data: {
      breadcrumb: 'broadcaster',
      icon: 'icofont-table bg-c-blue',
      breadcrumb_caption: '',
      status: false
    }
  },
  {
    path: 'add-broadcaster',
    component: AddBroadcasterComponent,
    data: {
      breadcrumb: 'Add Broadcaster',
      icon: 'icofont-table bg-c-blue',
      breadcrumb_caption: 'add broadcaster',
      status: false
    }
  },
  {
    path: 'edit-broadcaster/:userId',
    component: EditBroadcasterComponent,
    data: {
      breadcrumb: 'Edit Broadcaster',
      icon: 'icofont-table bg-c-blue',
      breadcrumb_caption: 'Edit Broadcaster',
      status: false
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BroadcasterRoutingModule { }
