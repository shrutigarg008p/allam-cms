import { Component, OnInit } from '@angular/core';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { ChangeEvent,BlurEvent } from '@ckeditor/ckeditor5-angular/ckeditor.component';

import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators,FormControl } from '@angular/forms';
import { CurriculumSingleService } from '../../services/studyexam/curriculum-single.service';
import { PocquestionService } from '../../services/studyexam/pocquestion.service';
import { AuthenticationService } from '../../services';
import {ToasterModule, ToasterService} from 'angular2-toaster';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import { TsupervisorService } from '../../services/tsupervisor.service';
import { environment } from '../../../environments/environment'
import domtoimage from 'dom-to-image-more';
declare var $: any;
declare var download: any;

@Component({
  selector: 'app-se-question',
  templateUrl: './se-question.component.html',
  styleUrls: ['./se-question.component.scss']
})
export class SeQuestionComponent implements OnInit {
  page = 1;
  count = 0;
  pageSize = 5;
  pageSizes = [5, 10, 25, 50, 100];

	title = 'angularckeditor';
  public Editor = ClassicEditor;
  public selectedItems = [];
  form: FormGroup;
	loading = false;
  submitted = false;
  loading2 = false;
  submitted2 = false;
	gridview = false;
  term: string;
  term2: string;
  isProcessed: boolean = false;
  isError: boolean;
  
  filters: any;
	error = '';
  private questionArr:any=[];
  private questionArr1:any=[];
  private quizArr:any=[];
  masterArr:any=[];
  row_id=1;
	private toasterService: ToasterService;
  logUser:any;
  created_by:number;
  isSave = true;
  isEdit=false;
  isEditCurr=false;
  isEditComp=false;
  idEdit=false;
  showQuestion=false;
  isApprove=0;
  quizid=0;
  editData:any=[];
  private teacherArr:any=[];
  teacher_id:any;
  s3_url =environment.s3_url;
  private durationOptions: string[] = ["05","10", "20", "30"];
  private levelOptions: string[] = ["1", "2", "3", "4", "5"];
  showModal : boolean;
  userHeading:any;
  userTitle:any;
  userName:any;
  userEmail:any;
  userMobile:any;
  userCountry:any;
  typeId:any;

    public config={
    itemsPerPage: 5,
    currentPage: 1,
    totalItems: 0
  }
	public question_value: string = ``;
    
  constructor(private fb: FormBuilder,
              private activeAouter: ActivatedRoute,
              private router: Router,
              private alertService: ToasterService,
              private curriculumSingleService:CurriculumSingleService,
              private authenticationService: AuthenticationService,
              private tsupervisorService: TsupervisorService
              ) 
              {
              this.term = ""; 
              this.term2 = ""; 
              }

	  ngOnInit() {
          this.form = this.fb.group({
          question: [''],
          save_type: [''],
          option1: ['',Validators.required],
          option2: ['',Validators.required],
          option3: ['',Validators.required],
          option4: ['',Validators.required],
          answer: [''],
          class: [''],
          quiz_sub_type: [''],
          quiz_type: [''],
          chapter: [''],
          subject: [''],
          semester: [''],
          quant_verbal: [''],
          group: [''],
          lesson: [''],
          note: [''],
          level: [''],
          duration: ['',Validators.required],
          delArray: this.fb.array([])
        });


      //  this.teacher_id = ( this.activeAouter.snapshot.params['teacher_id']); 
        

        this.logUser    = this.authenticationService.currentUserValue;
        this.logUser    = JSON.parse(this.logUser);
        this.created_by = this.logUser['user'][0]['id']; 
        this.typeId = this.activeAouter.snapshot.params['quiz_type'];
        this.typeId = atob(this.typeId);
        this.getPublishQuiz();
        this.getPublishQuestion();
        //this.getMasterData();
        this.getAllTeacher();

	  }

    get f() { return this.form.controls; }


  public getAllTeacher() {
    this.tsupervisorService.getAllTeacher().subscribe(response => { 
      this.teacherArr = response['data'];
      console.log( this.teacherArr);
    },
    error => {
        this.alertService.pop('error', 'Something went wrong. Try again later.');
    });
  }

    public getMasterData() {
        this.curriculumSingleService.getMasterData().subscribe(response => { 
        this.masterArr = response['data']; 
        //console.log( response.data);
        });
        console.log(this.masterArr);
    }

    public getPublishQuiz() {
      this.tsupervisorService.getActiveQuiz().subscribe(response => { 
        this.quizArr = response;
      });
    }

    public getPublishQuestion() 
    {
     const params = this.getRequestParams(this.term2,this.term, this.page, this.pageSize);
     console.log(params);
        this.tsupervisorService.getActiveQuestionNew(params).subscribe(response => { 
        console.log('ssssss--');
        this.questionArr1 = response;
        this.questionArr = response;
        
        //console.log(this.questionArr1);
        });
    }

    public preview(quizid, status){
      this.showQuestion=true;
      this.quizid=quizid;
      console.log(this.quizid+'id----');
      this.isApprove=status;
      this.getPublishQuestion();
    }

    goBack=function(){
      this.showQuestion=false;
    }

    goDashboard=function(){
      this.router.navigate(['/study-exam-question']);
    }

    public approve(quizid, status){
      this.quizid=quizid;
       //debugger;
      var quiz={
        "quiz_id":quizid+'',
        "status":status+'',
        "modified_by":"1"
      };
      var resArr:any=[];
      const params = this.getRequestParams(this.term2,this.term, this.page, this.pageSize);
        this.tsupervisorService.getActiveQuestionNew(params).subscribe(response => { 
        
        resArr=response;
        console.log(resArr.length);
         if(resArr.length < 5) { 
           Swal.fire('','Please add more than 5 questions.','error');
           return; 
         }
         this.tsupervisorService.updateQuizStatus(quiz).subscribe(response=>{
            this.isApprove=1-this.isApprove;
            this.getPublishQuiz();
          });
      });

  
    }

  pageChanged(event){
    this.config.currentPage = event;
  }

  openPopup(user_id){
    this.showModal = true;
    this.tsupervisorService.getUserByID(user_id).subscribe(response => { 
          this.userHeading  =response[0].role_name+' Details';
          this.userTitle    ='';
          this.userName     =response[0].first_name+' '+response[0].last_name;
          this.userEmail    =response[0].email;
          this.userMobile   =response[0].phone_number;
          this.userCountry  =response[0].country;
    });
    
  }
  closePopup(){
    this.showModal = false;
    this.userHeading  ='';
    this.userTitle    ='';
    this.userName     ='';
    this.userEmail    ='';
    this.userMobile   ='';
    this.userCountry  ='';
  }

    //custom search & pagination
 getRequestParams(teacherText,searchText, page, pageSize): any { 
    let params = {};

    if (searchText) {
      params[`searchText`] = searchText;
    }
    else{
      params[`searchText`] =0;
    }
     if (teacherText) {
      params[`teacherText`] = teacherText;
    }
    else{
      params[`teacherText`] =0;
    }

    this.typeId==2? params['type']='competitive':params['type']='curriculum';

    if (page) {
      params[`page`] = page - 1;
    }
    params['quiz_id'] =this.quizid;

    if (pageSize) {
      params[`size`] = pageSize;
    }

    return params;
  }


 handlePageChange(event): void {
    this.page = event;
    //this.getPublishQuestion();
  }

  handlePageSizeChange(event): void {
    this.pageSize = event.target.value;
    this.page = 1;
    //this.getPublishQuestion();
  }

  changedTeacher(teacher_search){
    this.term="";
    this.page = 1;
    this.getPublishQuestion();
  }

  deleteQuestion(question_id){
        var self = this;
        Swal.fire({
            title: 'Are you sure want to delete?',
            text: '',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'No, keep it'
          }).then((result) => {
            if (result.value) 
            {

             self.tsupervisorService.deletePublishQuestion(question_id,this.created_by,this.editData).subscribe(() => {   
                self.getPublishQuestion();
              });

              Swal.fire(
                'Deleted!',
                'Question has been deleted.',
                'success'
              )
             
            } else if (result.dismiss === Swal.DismissReason.cancel) {
              //Swal.fire('Cancelled','Your data is safe :)','error')
            }
          })
  }
}
