import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {AdminReferendumComponent} from './admin-referendum.component';
import {PreviewReferendumComponent} from './preview-referendum.component';

const routes: Routes = [
  {
    path: '',
    component: AdminReferendumComponent,
    data: {
      title: 'Admin Referendum Component',
      breadcrumb: 'Admin Referendum',
      icon: 'icofont-table bg-c-blue',
      breadcrumb_caption: '',
      status: false
    }
  },
  {
    path: 'preview/:id/:status/:usertype',
    component: PreviewReferendumComponent,
    data: {
      title: 'Preview Referendum Component',
      breadcrumb: 'Preview Admin Referendum',
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
export class AdminReferendumRoutingModule { }
