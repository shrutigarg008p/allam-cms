import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ListSchoolComponent } from './school/list/list-school.component';
import { AddSchoolComponent } from './school/add/add-school.component';
import { EditSchoolComponent } from './school/edit/edit-school.component';
import { ListUniversityComponent } from './university/list/list-university.component';
import { AddUniversityComponent } from './university/add/add-university.component';
import { EditUniversityComponent } from './university/edit/edit-university.component';
import { ListQuizComponent } from './quiz/list/list-quiz.component';
import { AddQuizComponent } from './quiz/add/add-quiz.component';
import { EditQuizComponent } from './quiz/edit/edit-quiz.component';
import { ListSubquizComponent } from './subquiz/list/list-subquiz.component';
import { AddSubquizComponent } from './subquiz/add/add-subquiz.component';
import { EditSubquizComponent } from './subquiz/edit/edit-subquiz.component';
import { ListSubjectComponent } from './subject/list/list-subject.component';
import { AddSubjectComponent } from './subject/add/add-subject.component';
import { EditSubjectComponent } from './subject/edit/edit-subject.component';
import { ListDistrictComponent } from './district/list/list-district.component';
import { AddDistrictComponent } from './district/add/add-district.component';
import { EditDistrictComponent } from './district/edit/edit-district.component';
import { ListCountryComponent } from './country/list/list-country.component';
import { AddCountryComponent } from './country/add/add-country.component';
import { EditCountryComponent } from './country/edit/edit-country.component';


const routes: Routes = [
  {
    path: 'school',
    component: ListSchoolComponent,
    data: {
      breadcrumb: 'school',
      icon: 'icofont-table bg-c-blue',
      breadcrumb_caption: '',
      status: false
    }
  },
  {
    path: 'school/add-school',
    component: AddSchoolComponent,
    data: {
      breadcrumb: 'Add School',
      icon: 'icofont-table bg-c-blue',
      breadcrumb_caption: 'add school',
      status: false
    }
  },
  {
    path: 'school/edit-school/:masterId',
    component: EditSchoolComponent,
    data: {
      breadcrumb: 'Edit School',
      icon: 'icofont-table bg-c-blue',
      breadcrumb_caption: 'Edit school',
      status: false
    }
  },
  {
    path: 'university',
    component: ListUniversityComponent,
    data: {
      breadcrumb: 'university',
      icon: 'icofont-table bg-c-blue',
      breadcrumb_caption: '',
      status: false
    }
  },
  {
    path: 'university/add-university',
    component: AddUniversityComponent,
    data: {
      breadcrumb: 'Add University',
      icon: 'icofont-table bg-c-blue',
      breadcrumb_caption: 'add University',
      status: false
    }
  },
  {
    path: 'university/edit-university/:masterId',
    component: EditUniversityComponent,
    data: {
      breadcrumb: 'Edit University',
      icon: 'icofont-table bg-c-blue',
      breadcrumb_caption: 'Edit University',
      status: false
    }
  },
  {
    path: 'quiz',
    component: ListQuizComponent,
    data: {
      breadcrumb: 'quiz',
      icon: 'icofont-table bg-c-blue',
      breadcrumb_caption: '',
      status: false
    }
  },
  {
    path: 'quiz/add-quiz',
    component: AddQuizComponent,
    data: {
      breadcrumb: 'Add Quiz',
      icon: 'icofont-table bg-c-blue',
      breadcrumb_caption: 'add Quiz',
      status: false
    }
  },
  {
    path: 'quiz/edit-quiz/:masterId',
    component: EditQuizComponent,
    data: {
      breadcrumb: 'Edit Quiz',
      icon: 'icofont-table bg-c-blue',
      breadcrumb_caption: 'Edit Quiz',
      status: false
    }
  },
  {
    path: 'sub-quiz',
    component: ListSubquizComponent,
    data: {
      breadcrumb: 'subquiz',
      icon: 'icofont-table bg-c-blue',
      breadcrumb_caption: '',
      status: false
    }
  },
  {
    path: 'sub-quiz/add-quiz',
    component: AddSubquizComponent,
    data: {
      breadcrumb: 'Add Sub Quiz',
      icon: 'icofont-table bg-c-blue',
      breadcrumb_caption: 'add Sub Quiz',
      status: false
    }
  },
  {
    path: 'sub-quiz/edit-sub-quiz/:masterId',
    component: EditSubquizComponent,
    data: {
      breadcrumb: 'Edit Sub Quiz',
      icon: 'icofont-table bg-c-blue',
      breadcrumb_caption: 'Edit Sub Quiz',
      status: false
    }
  },
  {
    path: 'subject',
    component: ListSubjectComponent,
    data: {
      breadcrumb: 'subject',
      icon: 'icofont-table bg-c-blue',
      breadcrumb_caption: '',
      status: false
    }
  },
  {
    path: 'subject/add-subject',
    component: AddSubjectComponent,
    data: {
      breadcrumb: 'Add Subject',
      icon: 'icofont-table bg-c-blue',
      breadcrumb_caption: 'add Subject',
      status: false
    }
  },
  {
    path: 'subject/edit-subject/:masterId',
    component: EditSubjectComponent,
    data: {
      breadcrumb: 'Edit Subject',
      icon: 'icofont-table bg-c-blue',
      breadcrumb_caption: 'Edit Subject',
      status: false
    }
  },
  {
    path: 'district',
    component: ListDistrictComponent,
    data: {
      breadcrumb: 'district',
      icon: 'icofont-table bg-c-blue',
      breadcrumb_caption: '',
      status: false
    }
  },
  {
    path: 'district/add-district',
    component: AddDistrictComponent,
    data: {
      breadcrumb: 'Add District',
      icon: 'icofont-table bg-c-blue',
      breadcrumb_caption: 'add District',
      status: false
    }
  },
  {
    path: 'district/edit-district/:masterId',
    component: EditDistrictComponent,
    data: {
      breadcrumb: 'Edit District',
      icon: 'icofont-table bg-c-blue',
      breadcrumb_caption: 'Edit District',
      status: false
    }
  },
  {
    path: 'country',
    component: ListCountryComponent,
    data: {
      breadcrumb: 'country',
      icon: 'icofont-table bg-c-blue',
      breadcrumb_caption: '',
      status: false
    }
  },
  {
    path: 'country/add-country',
    component: AddCountryComponent,
    data: {
      breadcrumb: 'Add Country',
      icon: 'icofont-table bg-c-blue',
      breadcrumb_caption: 'add Country',
      status: false
    }
  },
  {
    path: 'country/edit-country/:masterId',
    component: EditCountryComponent,
    data: {
      breadcrumb: 'Edit Country',
      icon: 'icofont-table bg-c-blue',
      breadcrumb_caption: 'Edit Country',
      status: false
    }
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MasterdataRoutingModule { }
