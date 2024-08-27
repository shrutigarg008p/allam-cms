import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {AdminComponent} from './layout/admin/admin.component';
import {AuthComponent} from './layout/auth/auth.component';
import { AuthGuard } from './helpers';

const routes: Routes = [
{
    path: '',
    component: AuthComponent,
    children: [
      {
        path: '',
        redirectTo: 'authentication/login',
        pathMatch: 'full',
      },
      {
        path: 'authentication',
        loadChildren: () => import('./pages/auth/auth.module').then(m => m.AuthModule)
      }
    ] 
  },
  {
    path: '',
    component: AdminComponent,
    children: [
      {
        path: 'dashboard',
        loadChildren: () => import('./pages/dashboard/dashboard-default/dashboard-default.module').then(m => m.DashboardDefaultModule),
        canActivate: [AuthGuard]
      },
      {
        path: 'role',
        loadChildren: () => import('./pages/roles/role.module').then(m => m.RoleModule),
        canActivate: [AuthGuard]
      },
       {
        path: 'category',
        loadChildren: () => import('./pages/category/category.module').then(m => m.CategoryModule),
        canActivate: [AuthGuard]
      },
      {
        path: 'header',
        loadChildren: () => import('./pages/header/header.module').then(m => m.HeaderModule),
        canActivate: [AuthGuard]
      },
      {
        path: 'daily',
        loadChildren: () => import('./pages/daily-competition/daily-competition.module').then(m => m.DailyCompetitionModule),
        //canActivate: [AuthGuard]
      },
      {
        path: 'study-exam',
        loadChildren: () => import('./pages/study-exam/question.module').then(m => m.QuestionModule),canActivate: [AuthGuard]
      },
      {
        path: 'special',
        loadChildren: () => import('./pages/special-competition/special-competition.module').then(m => m.SpecialCompetitionModule),
        //canActivate: [AuthGuard]
      },
      {
        path: 'league',
        loadChildren: () => import('./pages/league/league.module').then(m => m.LeagueCompetitionModule),
        canActivate: [AuthGuard]
      },
      {
        path: 'reports',
        loadChildren: () => import('./pages/reports/reports.module').then(m => m.ReportsModule),
      },
      {
        path: 'social-reports',
        loadChildren: () => import('./pages/reports-social/reports.module').then(m => m.ReportsSocialModule),
      },
      {
        path: 'referendum',
        loadChildren: () => import('./pages/referendum/referendum.module').then(m => m.ReferendumModule),
        //canActivate: [AuthGuard]
      },
      {
        path: 'admin-referendum',
        loadChildren: () => import('./pages/admin-referendum/admin-referendum.module').then(m => m.AdminReferendumModule),
        //canActivate: [AuthGuard]
      },
      {
        path: 'mobile-users',
        loadChildren: () => import('./pages/mobile-users/mobile-users.module').then(m => m.MobileUsersModule),
        //canActivate: [AuthGuard]
      },
      {
      path: 'sub-category',
        loadChildren: () => import('./pages/subcategory/subcategory.module').then(m => m.SubCategoryModule),
      },
      {
        path: 'quiz',
        loadChildren: () => import('./pages/quizzes/quiz.module').then(m => m.QuizModule),
      },
      {
        path: 'question',
        loadChildren: () => import('./pages/question/question.module').then(m => m.QuestionModule),
      },
       {
        path: 'users',
        loadChildren: () => import('./pages/users/users.module').then(m => m.UsersModule),
      },
      {
       path: 'broadcaster',
       loadChildren: () => import('./pages/broadcaster/broadcaster.module').then(m => m.BroadcasterModule),
     },
      {
        path: 'referendum',
        loadChildren: () => import('./pages/referendum/referendum.module').then(m => m.ReferendumModule),
      },
      {
        path: 'masterdata',
        loadChildren: () => import('./pages/masterdata/masterdata.module').then(m => m.MasterdataModule),
      },
      {
        path: 'general-competition',
        loadChildren: () => import('./pages/general-competition/general-competition.module').then(m => m.GeneralCompetitionModule),canActivate: [AuthGuard]
      },
      {
        path: 'teacher-supervisor',
        loadChildren: () => import('./pages/teacher-supervisor/teacher-supervisor.module').then(m => m.TeacherSupervisorModule),canActivate: [AuthGuard]
      },
      {
        path: 'broadcasting',
        loadChildren: () => import('./pages/broadcasting/broadcasting.module').then(m => m.BroadcastingModule),canActivate: [AuthGuard]
      },
      {
        path: 'leaderboard',
        loadChildren: () => import('./pages/leaderboard/leaderboard.module').then(m => m.LeaderboardModule),canActivate: [AuthGuard]
      },
      {
        path: 'userreport',
        loadChildren: () => import('./pages/user-report/user-report.module').then(m => m.UserReportModule),canActivate: [AuthGuard]
      },
      {
        path: 'usernotification',
        loadChildren: () => import('./pages/user-notification/user-notification.module').then(m => m.UserNotificationModule),canActivate: [AuthGuard]
      },
      {
        path: 'study-exam-question',
        loadChildren: () => import('./pages/study-exam-question/se-question.module').then(m => m.SeQuestionModule),canActivate: [AuthGuard]
      },

       {
        path: 'basic',
        loadChildren: () => import('./pages/ui-elements/basic/basic.module').then(m => m.BasicModule)
      }, {
        path: 'notifications',
        loadChildren: () => import('./pages/ui-elements/advance/notifications/notifications.module').then(m => m.NotificationsModule)
      }, {
        path: 'bootstrap-table',
        loadChildren: () => import('./pages/ui-elements/tables/bootstrap-table/basic-bootstrap/basic-bootstrap.module').then(m => m.BasicBootstrapModule),
      }, {
        path: 'map',
        loadChildren: () => import('./pages/map/google-map/google-map.module').then(m => m.GoogleMapModule),
      }, {
        path: 'user',
        loadChildren: () => import('./pages/user/profile/profile.module').then(m => m.ProfileModule)
      }, {
        path: 'simple-page',
        loadChildren: () => import('./pages/simple-page/simple-page.module').then(m => m.SimplePageModule)
      },
       {
        path: 'setting',
        loadChildren: () => import('./pages/setting/setting.module').then(m => m.SettingModule),
      },
      {
        path: 'apphome',
        loadChildren: () => import('./pages/apphome/apphome.module').then(m => m.ApphomeModule),
        canActivate: [AuthGuard]
      },
      {
        path: 'messaging',
        loadChildren: () => import('./pages/messaging/messaging.module').then(m => m.MessagingModule),
      },
    ]
  },
   // otherwise redirect to home
  { path: '**', redirectTo: '' }
  
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
