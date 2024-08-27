import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';


const routes: Routes = [
{
        path: '',
        loadChildren: () => import('./question/question.module').then(m => m.QuestionModule),
    },
    {
        path: 'question',
        loadChildren: () => import('./question/question.module').then(m => m.QuestionModule),
    },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
