import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

const routes: Routes = [
  {
    path: '', 
    data: {
      title: 'Authentication',
      status: false
    },
    children: [
      {
        path: 'login',
        loadChildren: () => import('./login/basic-login/basic-login.module').then(m => m.BasicLoginModule)
      },
      {
        path: 'registration',
        loadChildren: () => import('./registration/basic-reg/basic-reg.module').then(m => m.BasicRegModule)
      },
       {
        path: 'forgotpassword',
        loadChildren: () => import('./forgot/basic-forgot/basic-forgot.module').then(m => m.BasicForgotModule)
      },
      {
        path: 'resetpassword/:userId',
        loadChildren: () => import('./forgot/reset/reset.module').then(m => m.ResetModule)
      },
       {
        path: 'thanks',
        loadChildren: () => import('./thanks/thanks.module').then(m => m.ThanksModule)
      },
      {
        path: 'verify/:userId',
        loadChildren: () => import('./verify/verify.module').then(m => m.VerifyModule)
      },
      {
        path: 'generate_pswd/:userId',
        loadChildren: () => import('./generatepswd/generatepswd.module').then(m => m.GeneratepswdModule)
      },
      {
        path: 'survey-viewer/:parent/:id/:user_id',
        loadChildren: () => import('./survey-viewer/survey-viewer.module').then(m => m.SurveyViewerModule)
      }
      ,
      {
        path: 'studyexam-downlad/:parent/:mode/:quiz_temp_id',
        loadChildren: () => import('./studyexam-downlad/studyexam-downlad.module').then(m => m.StudyExamDownloadModule)
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule { }
