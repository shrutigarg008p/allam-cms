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
  selector: 'app-se-dashboard',
  templateUrl: './se-dashboard.component.html',
  //pipes: [OrderBy] 
})


export class SeDashboardComponent implements OnInit {
  form: FormGroup; 
  questions:  any;
  s3_url =environment.s3_url;
  private toasterService: ToasterService;
  private teacherArr:any=[];
  submitted=false;
  loading=false;
  isCompt=false;
  returnUrl: string;
  created_by:number;
  logUser:any;
  questionArrr:any=[];
  masterArr:any=[];
  constructor(private fb: FormBuilder,private route: ActivatedRoute,
  private tsupervisorService: TsupervisorService,
  private curriculumSingleService : CurriculumSingleService,
  private router: Router,
  private alertService: ToasterService, 
  private authenticationService: AuthenticationService) { 
  this.form = this.fb.group({
         
          quiz_type: ['',Validators.required],
         
        });
  }
  ngOnInit() 
  {
      this.logUser    = this.authenticationService.currentUserValue;
      this.logUser    = JSON.parse(this.logUser);
      this.created_by = this.logUser['user'][0]['id'];   
      this.getAllTeacher();    
      this.getMasterData(); 
  }


public getMasterData() {
        this.curriculumSingleService.getMasterData().subscribe(response => { 
        this.masterArr = response['data']; 
        });
        console.log(this.masterArr);
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
  var quiz_type= this.form.value.quiz_type;
  var qUrl = '/study-exam-question/type/'+btoa(quiz_type);
  console.log(qUrl);
  console.log(quiz_type);

  this.router.navigate([qUrl]);
}
  
  examType(){
  if(this.form.value.quiz_type=='2'){
    this.isCompt=true;
  }
  else{
    this.isCompt=false;

  }
}

}
