import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {GeneratepswdComponent} from './generatepswd.component';

const routes: Routes = [
  {
    path: '',
    component: GeneratepswdComponent,
    data: {
      title: 'Thank You'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GeneratepswdRoutingModule { }
