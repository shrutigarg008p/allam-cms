import { Component, OnInit } from '@angular/core';
import { ChangeEvent } from '@ckeditor/ckeditor5-angular/ckeditor.component';

import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PocquestionService } from '../../../services/studyexam/pocquestion.service';
import { ToasterModule, ToasterService} from 'angular2-toaster';
import { HttpEvent, HttpEventType } from '@angular/common/http';
import { HttpClient, HttpParams, HttpHeaders, HttpErrorResponse} from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import { AuthenticationService } from '../../../services';
import { CurriculumSingleService } from '../../../services/studyexam/curriculum-single.service';
import { ImageCroppedEvent } from 'ngx-image-cropper';

declare var $: any;

const apiUrl =environment.apiUrl;

@Component({
  selector: 'app-bulk-curriculum',
  templateUrl: './bulk-curriculum.component.html',
  styleUrls: ['./bulk-curriculum.component.scss']
})
export class BulkCurriculumComponent implements OnInit {
	title = 'angular Curriculum Bulk';
  s3_url =environment.s3_url;
  local_api_url=environment.apiUrl;
  form: FormGroup;
  formVar: FormGroup;
	loading = false;
	submitted = false;
	error = '';
	private questionArr:any=[];

  uploadedFiles: Array<File>;
  isProcessed: boolean = false;
  isError: boolean;
  errorData: [];
  fileData: any;
  errorCode : number;
  errorDesc : string;
  percentDone: any = 0;
  masterArr:any=[];
  logUser:any;
  created_by:number;
  isEdit=false;
  idEdit=false;
  editData:any=[];
  isSave = true;
  preview: string;
  loading2 = false;
  submitted2 = false;
  checkBox : string = 'false';

  public selectedItems = [];

	private toasterService: ToasterService;

  public question_value: string = ``;

  selectedAll: any = false;
  selectedNames: any;

  /*private classOptions: string[] = ["1", "2", "3", "4","5","6","7","8","9","10","11","12"];
  private semesterOptions: string[] = ["1", "2"];
  private groupOptions: string[] = ["1", "2", "3"];
  
  private lessonOptions: string[] = ["1", "2", "3", "4","5","6","7","8","9","10","11","12","13","14","15","16","17","18","19","20"];
  private chapterOptions: string[] = ["1", "2", "3", "4","5","6","7","8","9","10","11","12","13","14","15","16","17","18","19","20"];*/
  private levelOptions: string[] = ["1", "2", "3", "4", "5"];
  private durationOptions: string[] = ["05","15", "25", "30","60","120"];

  question_type:any='text';
  showModal:boolean=false;
  isFile:boolean=false;

	constructor(private fb: FormBuilder,private route: ActivatedRoute,private router: Router, private http: HttpClient, private pocquestionService: PocquestionService,private alertService: ToasterService,private authenticationService: AuthenticationService, private curriculumSingleService:CurriculumSingleService) 
	{
	  	this.formVar = this.fb.group({
	      excelFile: [null, Validators.required],
	      zipFile : [null, Validators.required],
        existImage : ['']
	    })
	}

	ngOnInit() {

    this.form = this.fb.group({
          question: [''],
          question_text: [''],
          question_image_url:[''],
          question_image:[''],
          edit_question_image:[''],
          question_type:[''],
          option1: ['',Validators.required],
          option2: ['',Validators.required],
          option3: ['',Validators.required],
          option4: ['',Validators.required],
          answer: [''],
          class: ['',[Validators.required, Validators.pattern("^[0-9]*$")]],
          quiz_sub_type: [''],
          quiz_type: ['',Validators.required],
          chapter: ['',[Validators.required, Validators.pattern("^[0-9]*$")]],
          subject: ['',Validators.required],
          semester: ['',[Validators.required, Validators.pattern("^[0-9]*$")]],
          quant_verbal: [''],
          group: [''],
          lesson: ['',[Validators.required, Validators.pattern("^[0-9]*$")]],
          note: [''],
          level: ['',[Validators.required, Validators.pattern("^[0-9]*$")]],
          duration: ['',[Validators.required, Validators.pattern("^[0-9]*$")]],
          delArray: this.fb.array([])
        });

    this.logUser    = this.authenticationService.currentUserValue;
    this.logUser    = JSON.parse(this.logUser);
    this.created_by = this.logUser['user'][0]['id'];  
    this.getDraftQuestion();
    this.getMasterData();
    
	}
  get f() { return this.form.controls; }

  public getMasterData() {
        this.curriculumSingleService.getMasterData().subscribe(response => { 
        this.masterArr = response['data']; 
        });
        //console.log(this.masterArr);
  }
  public getDraftQuestion(user_id=0) {
    this.pocquestionService.getDraftQuestionByUser(this.created_by)
    .subscribe(
    response => { //console.log('response -- '+JSON.stringify(response));
      this.questionArr = response;
      //this.isProcessed = true;
      //console.log(Object.keys(this.questionArr).length);
      if (Object.keys(this.questionArr).length != 0) {
        this.isProcessed = true;
      }
    },
    error => {
        this.alertService.pop('error', 'Something went wrong. Try again later.');
        this.loading = false;
        //this.router.navigate(['/study-exam']);
    });
  }

  downloadItem(){
    this.router.navigate([]).then(result => {  window.open('/authentication/studyexam-downlad/teacher/2/0', '_blank'); });;
    //this.generatePDF();
  }

  editItem(event)
    {
      this.editData = event;
      this.isEdit   = true;
      this.isSave   = false;
      this.idEdit   = this.editData.id;
      this.question_value=this.editData.question;
      
      console.log('---------------->>');
      console.log(this.question_value);
    

      this.form.patchValue({
          question: this.editData.question,
          option1: this.editData.option1,
          option2: this.editData.option2,
          option3: this.editData.option3,
          option4: this.editData.option4,
          answer: this.editData.answer,
          class: this.editData.class,
          quiz_sub_type: this.editData.quiz_sub_type,
          quiz_type: this.editData.quiz_type,
          chapter: this.editData.chapter,
          subject: this.editData.subject,
          semester: this.editData.semester,
          quant_verbal: this.editData.quant_verbal,
          group: this.editData.groups,
          lesson: this.editData.lesson,
          note: this.editData.note,
          level:this.editData.level,
          duration:this.convertTwoDigit(this.editData.duration),
          question_type:this.editData.qui_type,
          question_text:this.editData.question,
          qui_type:this.editData.qui_type,
          question_image_url:this.editData.question_image_url,
          question_image:this.editData.question_image,
          });
          this.croppedImage  = this.local_api_url+this.editData.question_image;
          this.question_type = this.editData.qui_type;
          this.preview = apiUrl+this.editData.question_image_url;
          
    }
  goBack(){
    this.isEdit   = false;
    this.isSave   = true;
  }

  fileChangeXlsx(element, variable) {
      //var pattern="^.+\.(xlsx|xls|csv)$";
      //var pattern="^.+\.(xlsx)$";
      
      const file = (element.target as HTMLInputElement).files[0];
      //console.log('type', file.type);
      //console.log('accept', element.target.accept);
      //console.log(element.target.files[0].name);
      
      var name = element.target.files[0].name;
      var ext = name.substring(name.lastIndexOf('.') + 1);

      if (ext.toLowerCase() == 'xlsx') {
          if (typeof (this.uploadedFiles) == "undefined") {
            this.uploadedFiles = new Array<File>();
            this.uploadedFiles.push(element.target.files[0]);
          }
          else {
            this.uploadedFiles.push(element.target.files[0]);
          }
      }else{
        variable.value = null;
        Swal.fire('','File type should be xlsx','error');
        return;
      }

      /*if (file.type !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
        //this.form.reset();
        element.value = "";
        variable.value = null;
        Swal.fire('','File type should be xlsx','error');
        return;
      }else{
      
        if (typeof (this.uploadedFiles) == "undefined") {
          this.uploadedFiles = new Array<File>();
          this.uploadedFiles.push(element.target.files[0]);
        }
        else {
          this.uploadedFiles.push(element.target.files[0]);
        }
        //console.log(this.uploadedFiles);
      }*/
    }
  fileChangeZip(element, variable1) {
    const file = (element.target as HTMLInputElement).files[0];
    console.log('type', file.type);

    var name = element.target.files[0].name;
    var ext = name.substring(name.lastIndexOf('.') + 1);

    if (ext.toLowerCase() == 'zip') {
        if (typeof (this.uploadedFiles) == "undefined") {
          this.uploadedFiles = new Array<File>();
          this.uploadedFiles.push(element.target.files[0]);
        }
        else {
          this.uploadedFiles.push(element.target.files[0]);
        }
    }else{
      variable1.value = null;
      Swal.fire('','File type should be zip','error');
      return;
    }
  }
  // Image Preview
  uploadQuestionImage(event) {
      const file = (event.target as HTMLInputElement).files[0];
      this.form.patchValue({
        question_image_url: file
      });
      this.form.get('question_image_url').updateValueAndValidity()

      // File Preview
      const reader = new FileReader();
      reader.onload = () => {
        this.preview = reader.result as string;
      }
      reader.readAsDataURL(file)
  }

  eventCheck(event){
    this.checkBox = event.target.checked;
      console.log(event.target.checked)  //<--- Check with this
  }

  upload() {
        this.showLoader(); 
        this.loading2   = true; 
        console.log('-bf');
        console.log(this.uploadedFiles);
        if (typeof (this.uploadedFiles) == "undefined" || this.uploadedFiles.length==0) {
          this.isError = false;
          this.isProcessed=false;
          this.errorData = null;

          //this.alertService.pop('error', "Excel file or zip file not selected.");
          Swal.fire('','Excel file or zip file not selected.','error');
          this.hideLoader(); 
          this.loading2   = false; 
          return;
        }

        let formData = new FormData();
        formData.append("existImage", this.checkBox);
        //console.log('this.checkBox ', this.checkBox)
        for (var i = 0; i < this.uploadedFiles.length; i++) {
          formData.append("uploads[]", this.uploadedFiles[i], this.uploadedFiles[i].name);
        }
        //console.log('formData '+JSON.stringify(formData));
        //const url = 'http://localhost:3000/api/upload';
        this.http.post(apiUrl+'cms-study-exam/api/curr_upload/1', formData, { reportProgress: true, observe: "events"})
          .subscribe((response: HttpEvent<any>) => {
              
              switch (response.type) {
                    case HttpEventType.Sent:
                        console.log('Request has been made!');
                        break;
                    case HttpEventType.ResponseHeader:
                        console.log('Response header has been received!');
                        break;
                    case HttpEventType.UploadProgress:
                        this.percentDone = Math.round(response.loaded / response.total * 100);
                        console.log(`Uploaded! ${this.percentDone}%`);
                        break;
                    case HttpEventType.Response:
                         //console.log('response.body.message '+ response.body.message);
                            console.log('Upload successfully ', response.body);
                        if (response.body.error_code == 0) {
                             //this.errorData = response["data"];
                             this.uploadedFiles = [];
                              this.fileData = response.body["data"];
                              //this.fileData['created_by'] = this.created_by; 
                              //this.fileData.unshift({'created_by' : this.created_by});
                              //this.fileData.push({'created_by' : this.created_by});
                              console.log(this.fileData);
                              this.saveTemp(); // Here call function for save data in temp table
                              this.isError=false;
                              this.isProcessed=true;
                              this.loading2 = false;
                              this.alertService.pop('success', 'Study data upload successfully!');
                              this.hideLoader(); 
                              this.uploadedFiles = new Array<File>();
                        }
                        else if (response.body.error_code == 1) {
                              this.isError = false;
                              this.isProcessed=false;
                              this.loading2 = false;
                              this.errorData = response.body["data"];
                              this.errorCode = response.body["error_code"];
                              this.errorDesc = response.body["err_desc"];
                              Swal.fire('',response.body.err_desc,'error');
                              //this.alertService.pop('error', response.body.err_desc);
                              this.uploadedFiles = new Array<File>();
                              this.formVar.reset();
                        }else if (response.body.error_code == 2) {
                              this.uploadedFiles = [];
                              this.isError = true;
                              this.isProcessed=false;
                              this.loading2 = false;
                              this.errorData = response.body["data"];
                              Swal.fire('',response.body.err_desc,'error');
                              this.uploadedFiles = new Array<File>();
                              this.formVar.reset();
                        }   
                 this.loading2 = false;
                this.percentDone = false;
                       
                }

            
            this.hideLoader(); 
            //console.log('response receved is ', response);
            //console.log('HttpEventType -- '+JSON.stringify(HttpEventType));
        });
  }



  saveTemp(){
    this.pocquestionService.addBulkQuestionTemp(this.fileData, this.created_by)
          .subscribe(
              data => { //console.log('data -- '+JSON.stringify(data));
                if(data['status']==200){
                    this.getDraftQuestion(); //Show all temp data 
                    this.alertService.pop('success', 'Question added successfully in temp');
                    //setTimeout(()=>this.router.navigate(['/study-exam']), 1500);
                  }
                  else
                  {
                    this.alertService.pop('error', 'Something went wrong. Try again later.');
                  }

                  this.loading = false;
                  //this.router.navigate(['/study-exam']);
                  
              },
              error => {
                  this.alertService.pop('error', 'Something went wrong. Try again later.');
                  this.loading = false;
                  //this.router.navigate(['/study-exam']);
              });
  }
  // Function is defined 
  hideLoader() { 

      // Setting display of spinner 
      // element to none 
      document.getElementById('loading-s') 
          .style.display = 'none'; 
  }
  showLoader() { 

      // Setting display of spinner 
      // element to none 
      document.getElementById('loading-s') 
          .style.display = 'block'; 
  }

  /* onCheckboxChange(event,val) {
      if(event.target.checked ) {
          this.selectedItems.push(val);
      }
       else {
        this.selectedItems.splice(this.selectedItems.indexOf(val),1);
      }

  } */

  selectAll() {
    this.selectedAll = !this.selectedAll;
    this.selectedItems = [];
    for (var i = 0; i < this.questionArr.length; i++) {
        this.questionArr[i].selected = this.selectedAll;
        //console.log(this.selectedAll)
        if(this.selectedAll == true){
          this.selectedItems.push(this.questionArr[i].id);
        }else{
          this.selectedItems.splice(this.selectedItems.indexOf(this.questionArr[i].id),1);
        }
        
    } 
    //console.log(this.selectedItems)
  }
  checkIfAllSelected(event,val) {
    if(event.target.checked ) {
        this.selectedItems.push(val);
    }
    else {
      this.selectedItems.splice(this.selectedItems.indexOf(val),1);
    }
    //console.log(this.selectedItems)
  }
  
  deleteOneItem(item_id){
        var self = this;
        Swal.fire({
            title: 'Are you sure want to delete?',
            text: 'You will not be able to recover this item!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'No, keep it'
          }).then((result) => {
            if (result.value) {

              self.pocquestionService.deleteDraftQuestion(item_id).subscribe(() => {  
                console.log('deleted draft row'); 
                self.getDraftQuestion();
                //self.questionArr.splice(self.questionArr.indexOf(item_id),1);
              });

              if(self.questionArr.length==0){
                this.isProcessed=false;
              }

               Swal.fire(
                'Deleted!',
                'Your data has been deleted.',
                'success'
              )
             
            } else if (result.dismiss === Swal.DismissReason.cancel) {
              //Swal.fire('Cancelled','Your data is safe :)','error')
            }
          })
    }

  deletItem(){ //console.log('this.selectedItems '+this.selectedItems)
    if(this.selectedItems.length==0){
     Swal.fire('Oh','No item selected to delete :)','error');
     return false;
     }
      var self = this;
      Swal.fire({
          title: 'Are you sure want to delete?',
          text: 'You will not be able to recover this item!',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Yes, delete it!',
          cancelButtonText: 'No, keep it'
        }).then((result) => {
          if (result.value) {

              /*this.selectedItems.forEach(function (value) {
                   self.fileData.forEach(function(arrItem){
                      if (value == arrItem.question) {
                          self.fileData.splice(self.fileData.indexOf(arrItem),1);
                      } 
                   });
              });*/
              this.selectedItems.forEach(function (value) { 
                   self.questionArr.forEach(function(arrItem){  
                      if (value == arrItem.id) { 
                          self.questionArr.splice(self.questionArr.indexOf(arrItem),1);
                          self.pocquestionService.deleteDraftQuestion(value).subscribe(() => {  
                            console.log('deleted draft row'); 
                          });
                      } 
                   });
              });

            if(self.questionArr.length==0){
              this.isProcessed=false;
            }
            Swal.fire(
              'Deleted!',
              'Your data has been deleted.',
              'success'
            )
          } else if (result.dismiss === Swal.DismissReason.cancel) {
            Swal.fire(
              'Cancelled',
              'Your data is safe :)',
              'error'
            )
          }
        })
  }

  reUpload(){
      this.router.navigate(['/study-exam/create']);
  }

  /*removeQuiz(quiz) {
      if(confirm("Are you sure to delete: "+quiz.question)) {
          this.fileData.splice(this.fileData.indexOf(quiz), 1);
          this.alertService.pop('success', 'Study data deleted successfully!');
      }
  }*/

  onUpdateTemp() {
        
        this.submitted = true;
        if (this.form.invalid) {
            return;
        }

        if(!this.form.value.answer){
          Swal.fire('','Please select correct answer.','error');
          return;
        }

        if(this.question_value=='' && this.form.value.question_type!='text'){
          Swal.fire('','Please upload question.','error');
          return;
        }
        if(this.form.value.question=='' && this.form.value.question_type=='text'){
          Swal.fire('','Please write question.','error');
          return;
        }

        if(this.form.value.question=='' && this.form.value.question_type=='text_and_image'){
          Swal.fire('','Please write question.','error');
          return;
        }
        //this.gridview=true;
       
        //this.form.value.q_id=this.row_id;
        // this.row_id=this.row_id+1;
        //this.form.value.question=this.question_value;

        this.form.value.created_by=this.created_by; 
        this.form.value.isFile=this.isFile;
        //this.questionArr.push(this.form.value);
        //console.log(this.form.value);
        //this.form.reset();

        this.loading = true;
          /////update in temp////
          this.form.value.id=this.idEdit;

          //console.log(this.form.value);
          //console.log('---------->>>>>>>>')  
          this.pocquestionService.updateQuestionInDraft(this.form.value)
            .subscribe(
                data => {
                  if(data['status']==200){
                      this.alertService.pop('success', 'Question successfully updated in draft');
                      this.getDraftQuestion();
                      //setTimeout(()=>this.router.navigate(['/study-exam']), 1000);
                      this.idEdit=false; 
                      this.isEdit=false;
                      this.isProcessed=true;
                      this.isSave=true;
                    }
                    else
                    {
                      this.alertService.pop('error', 'Something went wrong. Try again later.');
                    }

                    this.loading = false;
                    this.submitted=false

                    
                },
                error => {
                    this.alertService.pop('error', 'Something went wrong. Try again later.');
                    this.loading = false;
                    this.submitted=false

                });

  }

  publish() 
  {
    console.log(this.questionArr);
      Swal.fire({
        title: '',
        text: 'Are you sure want to publish?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes',
        cancelButtonText: 'No'
      }).then((result) => {
        if (result.value) {

        //////////publish call///
        this.submitted2 = true;
        this.loading2   = true; 
        //console.log(this.questionArr);
        this.pocquestionService.saveQuiz(this.questionArr)
            .subscribe(
                data => {
                  if(data['status']==200){
                      this.alertService.pop('success', 'Question added successfully');
                      setTimeout(()=>this.router.navigate(['/study-exam']), 1000);
                      
                    }
                    else
                    {
                      this.alertService.pop('error', 'Something went wrong. Try again later.');
                    }

                    this.loading2 = false;
                    
                },
                error => {
                    this.alertService.pop('error', 'Something went wrong. Try again later.');
                    this.loading2 = false;
                });
          //////////end////////////
         
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          //cancel
        }
      })
  }


	onSubmitData() {
        this.submitted = true;
        
        /*if(this.form.value.status){
        this.form.value.status="1";
        }
        else{
        this.form.value.status="0"
        }*/
 		    //this.form.value.question=this.value;
        this.loading = true; 
        this.pocquestionService.addBulkQuestion(this.fileData)
            .subscribe(
                data => { //console.log('data -- '+JSON.stringify(data));
                	if(data['status']==200){
                    	this.alertService.pop('success', 'Question added successfully');
                    	setTimeout(()=>this.router.navigate(['/study-exam']), 1500);
                    }
                    else
                    {
                    	this.alertService.pop('error', 'Something went wrong. Try again later.');
                    }

                    this.loading = false;
                    //this.router.navigate(['/study-exam']);
                    
                },
                error => {
                    this.alertService.pop('error', 'Something went wrong. Try again later.');
                    this.loading = false;
                    //this.router.navigate(['/study-exam']);
                });


    }
  convertTwoDigit(n) {
    n = String(n);
    if (n.length == 1){
      n = '0' + n
    }
    return n;
  }

  qtChanged(element){
    this.question_type=element;
    this.question_value='';
    this.croppedImage='';
     this.form.patchValue({
          question:''
        });
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
          }
      }
        
    }
    imageCropped(event: ImageCroppedEvent) {
        this.croppedImage = event.base64;
        this.question_value=this.croppedImage;
        this.isFile=true;
        this.form.patchValue({
          edit_question_image: this.croppedImage
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
