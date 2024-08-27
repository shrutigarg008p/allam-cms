import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {BasicForgotComponent} from './basic-forgot.component';

const routes: Routes = [
  {
    path: '',
    component: BasicForgotComponent,
    data: {
      title: 'Forgot Pasword'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BasicForgotRoutingModule { }
