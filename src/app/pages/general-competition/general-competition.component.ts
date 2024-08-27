import { Component, OnInit, Pipe, Output, EventEmitter } from '@angular/core';
import { Question } from '../../models/studyexam';
import { ToasterModule, ToasterService} from 'angular2-toaster'
import { AuthenticationService } from '../../services';
import { GcService } from '../../services/gc.service';

import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators,FormControl } from '@angular/forms';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import { environment } from '../../../environments/environment'

@Component({
  selector: 'app-general-competition',
  templateUrl: './general-competition.component.html',
})


export class GeneralCompetitionComponent implements OnInit {

  page = 1;
  count = 0;
  pageSize = 5;
  pageSizes = [5, 10, 25, 50, 100];

  form: FormGroup; 
  questions:  any;
  s3_url =environment.s3_url;
  private toasterService: ToasterService;
  private quizArr:any=[];
  editData:any=[];
  quiz_temp_id:string;
  isEdit=false;

  term: string;
  term1: string;
  term2: string;
  config: any;
  filters: any;
  submitted=false;
  loading=false;
  isDesc: boolean = false;
  column: string = 'id';
  direction: number;
  isCompt:boolean=false;
  returnUrl: string;
  created_by:number;
  logUser:any;
  questionArr:any=[];

  fileData: File = null;

  //@Output() public found = new EventEmitter<any>();
  found: Array <any> = [];
  quiz_icon_str: string;
  preview: string;

  masterArr:any=[];
  role_id:any;

  private headingArr:any=[];
  private categoryArr:any=[];

  constructor(private fb: FormBuilder,private route: ActivatedRoute,
  private gcService:GcService,
  private router: Router,
  private alertService: ToasterService, 
  private authenticationService: AuthenticationService) { 
  }
  ngOnInit() 
  {
      this.logUser    = this.authenticationService.currentUserValue;
      this.logUser    = JSON.parse(this.logUser);
      this.created_by = this.logUser['user'][0]['id']; 
      this.role_id    = this.logUser['user'][0]['role_id'];

      this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';

      this.term1='';
      this.term2='0';
      this.term='';
      this.getAllQuestion();
      this.getHeading();

  }

  public getAllQuestion() {
  const params = this.getRequestParams(this.term1,this.term2, this.page, this.pageSize);
  //console.log(params);
    this.gcService.getAllQuestionByUser(this.created_by,this.role_id,params)
    .subscribe(
    response => { 
      //this.questionArr = response['data'];
      //this.count = this.questionArr.length;
      this.questionArr = response['data'];
      this.count = response['count'];
    },
    error => {
        this.alertService.pop('error', 'Something went wrong. Try again later.');
    });
  }

  get f() { return this.form.controls; }

  changeStatus(queston: Question) 
  {
    console.log(queston);
    if(queston.status=="0"){
      queston.status="1";
    }
    else{
      queston.status="0";
    }
   
    this.gcService.update_status(queston)
    .subscribe(
        data => {
          this.alertService.pop('success', 'Question updated successfully');
          this.getAllQuestion();
        },
        error => {
          this.toasterService.pop('error', error);
     });
    
  }

  getHeading() {
    this.gcService.getHeading()
    .subscribe(
    response => { 
      this.headingArr = response;
      
    },
    error => {
       //
    });
  }

  getCategoryByHeading(heading_id) {
  if(heading_id!=''){
    this.gcService.getCategoryByHeading(heading_id)
    .subscribe(
    response => { 
      this.categoryArr = response;
    },
    error => {
       //
    });
    }
  }
  changedHeading(heading_id){
    this.term2="0";
    this.getCategoryByHeading(heading_id);
    this.updateFiltertable();
  }
  changedCategory() {
    this.updateFiltertable();
  }

  updateFiltertable(){
    this.page = 1;
    this.getAllQuestion();
  }

  resetPage(event) {
    //this.config['currentPage'] = 1;
  }

 //custom search & pagination
 getRequestParams(searchHeader,searchCategory, page, pageSize): any { 
    let params = {};

    if (searchHeader) {
      params[`header_id`] = searchHeader;
    }
    else{
      params[`header_id`] =0;
    }

    if (searchCategory) {
      params[`category_id`] = searchCategory;
    }
    else{
      params[`category_id`]=0;
    }
    if (page) {
      params[`page`] = page - 1;
    }

    if (pageSize) {
      params[`size`] = pageSize;
    }

    return params;
  }


 handlePageChange(event): void {
    this.page = event;
    this.getAllQuestion();
  }

  handlePageSizeChange(event): void {
    this.pageSize = event.target.value;
    this.page = 1;
    this.getAllQuestion();
  }
  
  toggleVideo(event: any) {
    //event.toElement.play();
  }
}
