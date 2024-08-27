import { Component, OnInit, Pipe, Output, EventEmitter } from '@angular/core';
import { Question } from '../../models/studyexam';
import { QuestionService } from '../../services/studyexam/question.service';
import { PocquestionService } from '../../services/studyexam/pocquestion.service';
import {ToasterModule, ToasterService} from 'angular2-toaster'
import { CompetitiveSingleService } from '../../services/studyexam/competitive-single.service';
import { AuthenticationService } from '../../services';


import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators,FormControl } from '@angular/forms';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import { CurriculumSingleService } from '../../services/studyexam/curriculum-single.service';
import { environment } from '../../../environments/environment'
import { ImageCroppedEvent } from 'ngx-image-cropper';

@Component({
  selector: 'app-studyexam',
  templateUrl: './studyexam.component.html',
  //pipes: [OrderBy] 
})


export class StudyexamComponent implements OnInit {
  form: FormGroup; 
  questions:  any;
  s3_url =environment.s3_url;
  private toasterService: ToasterService;
  private quizArr:any=[];
  editData:any=[];
  quiz_temp_id:string;
  isEdit=false;
  isFile:boolean=false;

  term: string;
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
  showModal:boolean=false;

  fileData: File = null;

  //@Output() public found = new EventEmitter<any>();
  found: Array <any> = [];
  quiz_icon_str: string;
  preview: string;

  masterArr:any=[];

  constructor(private fb: FormBuilder,private route: ActivatedRoute,private pocquestionService: PocquestionService,
  private questionService: QuestionService, 
  private router: Router,
  private alertService: ToasterService, 
  private competitiveSingleService:CompetitiveSingleService,
  private authenticationService: AuthenticationService,
  private curriculumSingleService:CurriculumSingleService) { 
      this.form = this.fb.group({
          upload_type:['single'],
          quiz_type: ['1',Validators.required],
          quiz_sub_type: ['',Validators.required],
          quiz_title: ['',Validators.required],
          quiz_description: ['',Validators.required],
          quiz_icon:[null],
        });
    }
  ngOnInit() 
  {
      this.logUser    = this.authenticationService.currentUserValue;
      this.logUser    = JSON.parse(this.logUser);
      this.created_by = this.logUser['user'][0]['id']; 

      this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';

      this.getMasterData(); // Get master data from DB

      this.quiz_temp_id = (this.route.snapshot.params['quiz_temp_id']); //atob
      //console.log(this.quiz_temp_id);
      if(this.quiz_temp_id)  {
        this.getDraftQuiz(this.quiz_temp_id);
        this.isEdit=true;
      }
  }

get f() { return this.form.controls; }

public getMasterData() {
        this.curriculumSingleService.getMasterData().subscribe(response => { 
        this.masterArr = response['data']; 
        });
        console.log(this.masterArr);
    }

public getDraftQuiz(quiz_id : string) {
      this.pocquestionService.getDraftQuizByUser(this.created_by, quiz_id).subscribe(response => {  
        this.editData=response[0];
       
        if(this.editData.length==0){
          this.router.navigate(['/study-exam/create'])
        }
        //console.log(response[0]);
        console.log('<<----------------');

        this.isCompt=true; // Here true for show hidden form of Study competitive
        this.form.patchValue({
          upload_type:this.editData.save_type,
          quiz_type: this.editData.quiz_type,
          quiz_sub_type: this.editData.quiz_sub_type,
          quiz_title: this.editData.quiz_title,
          quiz_description: this.editData.quiz_description,
          quiz_icon:[null],
        });
        this.preview = this.s3_url+this.editData.quiz_icon_url;
        this.croppedImage=this.preview;
      });
  }

uploadFile(event, variable) {
  this.preview = '';
  let reader = new FileReader();
  if (event.target.files && event.target.files.length > 0) {
    let file = event.target.files[0];

    let img = new Image();
    var name = event.target.files[0].name;
    var ext = name.substring(name.lastIndexOf('.') + 1);

    if (ext.toLowerCase() != 'jpeg' && ext.toLowerCase() != 'jpg' && ext.toLowerCase() != 'png')
      { console.log('ext check')
        variable.value = null;
        Swal.fire('','File type should be jpeg, jpg or png format','error');
        return;
      }

    img.src = window.URL.createObjectURL( file );
    reader.readAsDataURL(file);
    reader.onload = () => {
      setTimeout(() => {
        const width = img.naturalWidth;
        const height = img.naturalHeight;

        window.URL.revokeObjectURL( img.src );
        console.log(width + '*' + height);
        if ( width !== 200 && height !== 200 ) {
          Swal.fire('','Image should be 200 x 200 size.','error');
          variable.value = null;
        } else {
          this.form.patchValue({
              quiz_icon: file
            });
          this.form.get('quiz_icon').updateValueAndValidity()
          this.preview = reader.result as string;
        }
      }, 1000);
    };
  }
}

onSubmit(){
  if(this.form.value.quiz_type==''){
      Swal.fire('','Please select quiz type.','error');
      return;
  }
  if(this.form.value.quiz_type=='1'){ // 1 => Curriculum Exam
    this.isCompt=false;
     if(this.form.value.upload_type=='single'){
       this.router.navigate(['/study-exam/curriculum-single']);
     }else{
       this.router.navigate(['/study-exam/curriculum-bulk']);
     }
  }
  if(this.form.value.quiz_type=='2'){ // 2 => Competitive Exam

  this.submitted = true;
  if (this.form.invalid) {
      return;
  }
  /* if(this.form.value.quiz_icon==null){
      Swal.fire('','Please upload quiz icon.','error');
      return;
  } */
    this.isCompt=true; 

    /* Add image start*/
    var saveDataArr:any=[];
    saveDataArr = this.form.value;
    console.log(saveDataArr);
   
    saveDataArr['isFile']= this.isFile;
    console.log(saveDataArr);
    if(this.quiz_temp_id)  
    {
      saveDataArr['quiz_temp_id']= this.quiz_temp_id;
      this.getUpdateDraftQuiz(this.quiz_temp_id, saveDataArr);

      return;
    }

    this.competitiveSingleService.saveQuizImageNew(saveDataArr).subscribe(
      (data) => { 
          if(data['status']==200){
             this.quiz_icon_str = data['quiz_icon'];
                 this.submitted = true;
                  if (this.form.invalid) {
                      return;
                  }

                  //////save in temp/////
                  this.submitted = true;
                  this.loading = true;
                  // Check quiz icon is upload return blank 
                  if(this.quiz_icon_str == ""){
                    this.quiz_icon_str = "default/default_quiz_icon.png";
                  }
                  this.form.value.created_by=this.created_by; 
                  this.found = this.form.value;
                  this.found['quiz_icon_url'] = this.quiz_icon_str;
                  //console.log(this.found);
                  
                  this.competitiveSingleService.saveQuizInTemp(this.found)
                  .subscribe(
                  data => {
                      if(data['status']==200){                
                        if(this.form.value.upload_type=='single'){
                          var signal_url = '/study-exam/competitive-single/'+btoa(data['temp_quiz_id']);
                          this.router.navigate([signal_url]);
                        }else{
                          var bulk_url = '/study-exam/competitive-bulk/'+btoa(data['temp_quiz_id']);

                          this.router.navigate([bulk_url]);
                        }
                      }
                      else
                      {
                        this.router.navigate(['/study-exam/create']);
                        this.alertService.pop('error', 'Something went wrong. Try again later.');
                      }
                      this.loading = false;
                  },
                  error => {
                      this.alertService.pop('error', 'Something went wrong. Try again later.');
                      this.loading = false;
                      this.router.navigate(['/study-exam/create']);
                  });
              // }else{
                 
              //    this.found = this.form.value;
              //    //this.found['fileData'] = this.fileData;
              //    this.found['quiz_icon_url'] = this.quiz_icon_str;
              //    //console.log('this.found '+JSON.stringify(this.found));
              //    this.questionService.insertData(this.found);
              //    this.found = [];
              //    this.router.navigate(['/study-exam/competitive-bulk']);
              // }
               //this.found = this.form.value;
          }
        },
      (err) => console.log(err)
    );
    /* End here */
     
     
  }
  //console.log(this.form.value)
}

getUpdateDraftQuiz(quiz_temp_id, formData){
  console.log(formData);
          console.log('---------->>>>>>>>')  
          
          this.competitiveSingleService.updateQuizImageNew(formData).subscribe(
      (data) => { //console.log(data)
          if(data['status']==200){
             this.quiz_icon_str = data['quiz_icon'];
            
              //if(this.form.value.upload_type=='single'){
                 //this.router.navigate(['/study-exam/competitive-single']);
                 this.submitted = true;
                  if (this.form.invalid) {
                      return;
                  }

                  //////save in temp/////
                  this.submitted = true;
                  this.loading = true;

                  this.form.value.created_by=this.created_by; 
                  this.found = this.form.value;
                  this.found['quiz_icon_url'] = this.quiz_icon_str;
                  // console.log(this.found);

                  this.competitiveSingleService.updateQuizInTemp(this.found, quiz_temp_id)
                  .subscribe(
                  data => {
                      if(data['status']==200){                
                        if(this.form.value.upload_type=='single'){
                          var signal_url = '/study-exam/competitive-single/'+quiz_temp_id;
                          this.router.navigate([signal_url]);
                        }else{
                          var bulk_url = '/study-exam/competitive-bulk/'+quiz_temp_id;

                          this.router.navigate([bulk_url]);
                        }
                      }
                      else
                      {
                        this.router.navigate(['/study-exam/create']);
                        this.alertService.pop('error', 'Something went wrong. Try again later.');
                      }
                      this.loading = false;
                  },
                  error => {
                      this.alertService.pop('error', 'Something went wrong. Try again later.');
                      this.loading = false;
                      this.router.navigate(['/study-exam/create']);
                  });
          }
        },
      (err) => console.log(err)
    );
}

examType(){
  if(this.form.value.quiz_type=='2'){
    this.isCompt=true;
  }
  else{
    this.isCompt=false;

  }
}

  //image cropping
    imageChangedEvent: any = '';
    croppedImage: any = '';
  
    fileChangeEvent(event: any): void {
    
      if (event.target.files && event.target.files.length > 0) {
        let file = event.target.files[0];
        let img = new Image();
        var name = event.target.files[0].name;
        var ext = name.substring(name.lastIndexOf('.') + 1);

        if (ext.toLowerCase() != 'jpeg' && ext.toLowerCase() != 'jpg' && ext.toLowerCase() != 'png')
          { 
            Swal.fire('','File type should be jpeg, jpg or png format','error');
            return;
          }
          else
          {
            this.imageChangedEvent = event;
            this.showModal = true;
            this.isFile =true;
          }
      }
        
    }
    imageCropped(event: ImageCroppedEvent) {
        this.croppedImage = event.base64;
       
        this.form.patchValue({
          quiz_icon: this.croppedImage
        });

    }
    imageLoaded() {
        /* show cropper */
    }
    cropperReady() {
        /* cropper ready */
    }
    loadImageFailed() {
        /* show message */
        Swal.fire('','Please upload image only','error');
    }

 closePopup(){
    this.showModal = false;
  }
}
