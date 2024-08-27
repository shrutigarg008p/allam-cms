import { Component, OnInit, Pipe, Output, EventEmitter } from '@angular/core';
import { Question } from '../../models/studyexam';
import { TsupervisorService } from '../../services/tsupervisor.service';
import {ToasterModule, ToasterService} from 'angular2-toaster'
import { AuthenticationService } from '../../services';


import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators,FormControl } from '@angular/forms';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import { CurriculumSingleService } from '../../services/studyexam/curriculum-single.service';
import { environment } from '../../../environments/environment'

@Component({
  selector: 'app-teacher-supervisor',
  templateUrl: './teacher-supervisor.component.html',
  //pipes: [OrderBy] 
})


export class TeacherSupervisorComponent implements OnInit {
  form: FormGroup; 
  questions:  any;
  s3_url =environment.s3_url;
  private toasterService: ToasterService;
  private teacherArr:any=[];
  submitted=false;
  loading=false;
  returnUrl: string;
  created_by:number;
  logUser:any;
  questionArrr:any=[];

  constructor(private fb: FormBuilder,private route: ActivatedRoute,
  private tsupervisorService: TsupervisorService, 
  private router: Router,
  private alertService: ToasterService, 
  private authenticationService: AuthenticationService) { 
  this.form = this.fb.group({
         
          teacher: ['',Validators.required],
         
        });
  }
  ngOnInit() 
  {
      this.logUser    = this.authenticationService.currentUserValue;
      this.logUser    = JSON.parse(this.logUser);
      this.created_by = this.logUser['user'][0]['id'];   
      this.getAllTeacher();    
  }


  public getAllTeacher() {
    this.tsupervisorService.getAllTeacher().subscribe(response => { 
      this.teacherArr = response['data'];
      console.log( this.teacherArr);
    },
    error => {
        this.alertService.pop('error', 'Something went wrong. Try again later.');
    });
  }

get f() { return this.form.controls; }
onSubmit(){
  this.submitted = true;
  if (this.form.invalid) {
      return;
  }
  var teacher_id= this.form.value.teacher;
  var qUrl = '/teacher-supervisor/question/'+btoa(teacher_id);
  console.log(qUrl);
  console.log(teacher_id);

  this.router.navigate([qUrl]);
}

}
