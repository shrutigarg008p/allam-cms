import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UserReportComponent } from './user-report.component';

  import { from } from 'rxjs';

const routes: Routes = [
  {
    path: '',
    component: UserReportComponent,
    data: {
      breadcrumb: 'UserReport',
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
export class UserReportRoutingModule { }
