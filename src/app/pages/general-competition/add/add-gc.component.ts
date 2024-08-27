import { Component, OnInit } from '@angular/core';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { ChangeEvent,BlurEvent } from '@ckeditor/ckeditor5-angular/ckeditor.component';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GcService } from '../../../services/gc.service';
import { ToasterModule, ToasterService} from 'angular2-toaster';
import { HttpEvent, HttpEventType } from '@angular/common/http';
import { HttpClient, HttpParams, HttpHeaders, HttpErrorResponse} from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import { AuthenticationService } from '../../../services';
import { ImageCroppedEvent } from 'ngx-image-cropper'; 

declare var $: any;

const apiUrl =environment.apiUrl;

@Component({
  selector: 'app-add-gc',
  templateUrl: './add-gc.component.html',
  styleUrls: ['./add-gc.component.scss']
})
export class AddGcComponent implements OnInit {
	title = 'GC Bulk';
  s3_url =environment.s3_url;
  local_api_url=environment.apiUrl;
  public Editor = ClassicEditor;
  form: FormGroup;
  formVar: FormGroup;
	loading = false;
	submitted = false;
	error = '';
  private questionArr:any=[];
  private headingArr:any=[];
	private categoryArr:any=[];

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

  isSingle=true;
  isBulk=false;
  question_type:any='text'; 
  showModal:boolean=false;
  isFile:boolean=false;
  isVideo:boolean=false;
  public default_font_size='font-size:18px';


  public selectedItems = [];

	private toasterService: ToasterService;


  public config={
  fontSize: {
      options: [
          12,
          13,
          14,
          15,
          16,
          17,
          18
      ]
    },
    toolbar: [
      'heading',
      '|',
      'fontSize',
      '|',
      'bold',
      'italic',
      'link',
      'bulletedList',
      'numberedList',
      '|',
      'indent',
      'outdent',
      '|',
      'imageUpload',
      'blockQuote',
      'insertTable',
      'mediaEmbed',
      'MathType',
      'ChemType',
      'undo',
      'redo'
    ]
  }

  public question_value: string = ``;

  private levelOptions: string[] = ["1", "2", "3", "4", "5"];
  private durationOptions: string[] = ["05","15", "25", "30","60","120"];

	constructor(private fb: FormBuilder,private route: ActivatedRoute,private router: Router, private http: HttpClient, private gcService: GcService,private alertService: ToasterService,private authenticationService: AuthenticationService) 
	{
	  	this.formVar = this.fb.group({
        heading: ['',Validators.required],
        category: ['',Validators.required],
	      excelFile: [null],
	      zipFile : [null],
        existImage : ['']
	    })
	}

	ngOnInit() {

    this.form = this.fb.group({
          question: [''],
          question_text: [''],
          question_image_url:[''],
          question_image:[''],
          qui_type:[''],
          question_type:[this.question_type,Validators.required],
          video: [null],
          option1: ['',Validators.required],
          option2: ['',Validators.required],
          option3: ['',Validators.required],
          option4: ['',Validators.required],
          answer: [''],
          heading: ['',Validators.required],
          category: ['',Validators.required],
          note: [''],
          level: ['',[Validators.required, Validators.pattern("^[0-9]*$")]],
          duration: ['',[Validators.required, Validators.pattern("^[0-9]*$")]],
          delArray: this.fb.array([])
        });

    this.logUser    = this.authenticationService.currentUserValue;
    this.logUser    = JSON.parse(this.logUser);
    this.created_by = this.logUser['user'][0]['id'];  
    this.getDraftQuestion('single');
    this.getMasterData();
    this.getHeading();
    
	}
  get f() { return this.form.controls; }
  get fv() { return this.formVar.controls; }


  public getMasterData() {
      
        this.masterArr=[];
       
  }
  public getDraftQuestion(type='bulk') {
    this.gcService.getDraftQuestionByUser(this.created_by,type)
    .subscribe(
    response => { 
      this.questionArr = response;
      if (Object.keys(this.questionArr).length != 0) {
        this.isProcessed = true;
      }
    },
    error => {
        this.alertService.pop('error', 'Something went wrong. Try again later.');
        this.loading = false;
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
    this.gcService.getCategoryByHeading(heading_id)
    .subscribe(
    response => { 
      this.categoryArr = response;
    },
    error => {
       //
    });
  }

  editItem(event)
    {
      this.isFile   = false;
      this.isVideo   = false;

      this.editData = event;
      this.isEdit   = true;
      this.isSave   = false;
      this.idEdit   = this.editData.id;
      this.question_value=this.editData.question;
      
      console.log('---------------->>');
      console.log(this.question_value);
      
      //const domEditableElement = document.querySelector('.ck-editor__editable');
      //const editorInstance = domEditableElement.ckeditorInstance;
      //editorInstance.setData(this.editData.question );

      //console.log('<<----------------');
      //console.log(JSON.stringify(this.editData));

      this.getCategoryByHeading(this.editData.header_id);

      this.form.patchValue({
          question: this.editData.question,
          option1: this.editData.option1,
          option2: this.editData.option2,
          option3: this.editData.option3,
          option4: this.editData.option4,
          answer: this.editData.answer,
          heading: this.editData.header_id,
          category: this.editData.category_id,
          note: this.editData.note,
          level:this.editData.level,
          duration:this.editData.duration,
          question_text:this.editData.question,
          question_type:this.editData.qui_type,
          qui_type:this.editData.qui_type,
          question_image_url:this.editData.question_image_url,
          question_image:this.editData.question_image,

          });
          if(this.editData.type=='bulk')
          {
            if(this.editData.question_image=='live'){
              this.croppedImage=this.s3_url+this.editData.question_image_url;
            }
            else{
              this.croppedImage=this.local_api_url+this.editData.question_image;
            }
            
          }
          else{
            this.croppedImage=this.s3_url+this.editData.question_image_url;
          }
          
          this.question_type=this.editData.qui_type;

          /*let image = this.editData.question_image_url;
          let reader = new FileReader();
          reader.addEventListener("load",
            () => {
                this.preview = reader.result as string;
            },
            false);

          if (image) { console.log(image.type)
            if (image.type !== "application/pdf")
              reader.readAsDataURL(image);
          }

          this.preview = apiUrl+this.editData.question_image_url;
          console.log(this.preview)*/
    }
  goBack(){
    this.isEdit   = false;
    this.isSave   = true;
  }

  fileChangeXlsx(element, variable) {
      //var pattern="^.+\.(xlsx|xls|csv)$";
      //var pattern="^.+\.(xlsx)$";
      
      const file = (element.target as HTMLInputElement).files[0]; 
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
  this.submitted=true;

     if (this.formVar.invalid) {
        return;
    }
        this.showLoader(); 
        this.loading2   = true; 
        
        if (typeof (this.uploadedFiles) == "undefined") {
          this.isError = false;
          this.isProcessed=false;
          this.errorData = null;
          this.loading2   = false; 

          //this.alertService.pop('error', "Excel file or zip file not selected.");
          Swal.fire('','Excel file or zip file not selected.','error');
          this.hideLoader(); 
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
        this.http.post(apiUrl+'gc/api/upload', formData, { reportProgress: true, observe: "events"})
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
                              this.alertService.pop('success', 'Data upload successfully!');
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
                              this.isError = true;
                              this.isProcessed=false;
                              this.loading2 = false;
                              this.errorData = response.body["data"];
                              Swal.fire('',response.body.err_desc,'error');
                              //this.alertService.pop('error', response.body.err_desc);
                              this.uploadedFiles = new Array<File>();
                              this.formVar.reset();
                        }   
                
                this.percentDone = false;
                       
                }

            
            this.hideLoader(); 
            //console.log('response receved is ', response);
            //console.log('HttpEventType -- '+JSON.stringify(HttpEventType));
        });
  }



  saveTemp()
  {
    var _heading =this.formVar.value.heading;
    var _category =this.formVar.value.category;
    console.log(_heading);
    console.log(_category);
    this.gcService.addBulkQuestionTemp(this.fileData, this.created_by,_heading,_category)
          .subscribe(
              data => { //console.log('data -- '+JSON.stringify(data));
                if(data['status']==200){
                    this.getDraftQuestion('bulk'); //Show all temp data 
                    this.alertService.pop('success', 'Question added successfully in temp');
                  }
                  else
                  {
                    this.alertService.pop('error', 'Something went wrong. Try again later.');
                  }

                  this.loading = false;
                  
              },
              error => {
                  this.alertService.pop('error', 'Something went wrong. Try again later.');
                  this.loading = false;
              });
  }
 
  hideLoader() 
  { 

      document.getElementById('loading-s').style.display = 'none'; 
  }
  showLoader() { 
      document.getElementById('loading-s').style.display = 'block'; 
  }

  onCheckboxChange(event,val) {
      if(event.target.checked ) {
          this.selectedItems.push(val);
      }
       else {
        this.selectedItems.splice(this.selectedItems.indexOf(val),1);
      }

  }

  deleteFoodSelected(){
        this.selectedItems= this.questionArr.filter(_ => _.selected);
            for (var food in this.selectedItems) {
           /* this.foodService.RemoveFood(this.selectedItems[food].Id)
             .subscribe(data =>{
              console.log(data)
             }   
             )  */   
          }
  }

  deleteOneItem(item_id,type='bulk'){
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

              self.gcService.deleteDraftQuestion(item_id).subscribe(() => {  
                console.log('deleted draft row'); 
                self.getDraftQuestion(type);
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

  deletItem()
  { 
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
                          self.gcService.deleteDraftQuestion(value).subscribe(() => {  
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
      this.router.navigate(['/general-competition']);
  }

  onUpdateTemp() 
  {      
        this.submitted = true;
        if (this.form.invalid) {
            return;
        }

        if(!this.form.value.answer){
          Swal.fire('','Please select correct answer.','error');
          return;
        }

         if(this.question_type=='text')
          {
            if(this.form.value.question==''){
              Swal.fire('','Please write question.','error');
              return;
            }

          }
          if(this.croppedImage=='' && (this.question_type=='image' || this.question_type=='text_and_image')){
             Swal.fire('','Please upload question.','error');
              return;
          }
          if(this.form.value.video=='' && (this.question_type=='video' || this.question_type=='text_and_video')){
             Swal.fire('','Please upload question.','error');
              return;
          }
          if(this.form.value.question_text=='' && (this.form.value.question_type=='text_and_image' || this.form.value.question_type=='text_and_video'))
          {
            Swal.fire('','Please write question.','error');
            return;
          }

        
        this.form.value.created_by=this.created_by; 
        this.form.value.created_by=this.created_by; 
        this.form.value.video_file  = this.form.value.video;
        this.form.value.isFile=this.isFile;
        this.form.value.isVideo=this.isVideo;

        this.loading = true;
          /////update in temp////
          this.form.value.id=this.idEdit;

          //console.log(this.form.value);
          //console.log('---------->>>>>>>>')  
          this.gcService.updateQuestionInDraft(this.form.value)
            .subscribe(
                data => {
                  if(data['status']==200){
                      this.alertService.pop('success', 'Question successfully updated');
                      this.getDraftQuestion('bulk');
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
        this.gcService.publishQuestion(this.questionArr)
            .subscribe(
                data => {
                  if(data['status']==200){
                      this.alertService.pop('success', 'Question added successfully');
                      setTimeout(()=>this.router.navigate(['/general-competition']), 1000);
                      
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
        this.gcService.addBulkQuestion(this.fileData)
            .subscribe(
                data => { //console.log('data -- '+JSON.stringify(data));
                	if(data['status']==200){
                    	this.alertService.pop('success', 'Question added successfully');
                    	setTimeout(()=>this.router.navigate(['/general-competition']), 1500);
                    }
                    else
                    {
                    	this.alertService.pop('error', 'Something went wrong. Try again later.');
                    }

                    this.loading = false;
                    
                },
                error => {
                    this.alertService.pop('error', 'Something went wrong. Try again later.');
                    this.loading = false;
                    //this.router.navigate(['/general-competition']);
                });


    }

  changedHeading(heading_id){
    this.getCategoryByHeading(heading_id);
    console.log(heading_id);
  }

  uploadType(upload_type){
    if(upload_type=='single'){
      this.isBulk=false;
      this.isSingle=true;
      this.getDraftQuestion('single');
      this.submitted=false;

    }
    else{
      this.isBulk=true;
      this.isSingle=false;
      this.getDraftQuestion('bulk');
    }

    this.croppedImage = '';
    this.question_value='';
    this.isFile=false;
    this.isVideo=false;
    this.question_type="text";
     this.form.patchValue({
      question_type:'text',
    });
    this.goBack();
  }
  public onChange( { editor }: BlurEvent ) {
    this.question_value = editor.getData();
    console.log('dsdsds');
    var html =$(".ck-content").html();
    html = html.replace("<p>", "<p style='"+this.default_font_size+"'>");
    this.question_value =html;
  }
  isOverflown(element) {
    return element.scrollHeight > element.clientHeight || element.scrollWidth > element.clientWidth;
  }

  onSaveSingleTemp ()
  {
     //console.log(this.form.value); return ;
    this.submitted = true;
    if (this.form.invalid) {
        return;
    }

    if(this.question_type=='text')
    {
      if(this.question_value=='' || this.question_value=='<p><br data-cke-filler="true"></p>'){
        Swal.fire('','Please write question.','error');
        return;
      }

      var qSize=this.isOverflown($(".ck-content")[0]);
  
      if(qSize){
        Swal.fire('','Question maximum request length exceeded ','error');
        return;
      }
    }
    if(this.croppedImage=='' && (this.question_type=='image' || this.question_type=='text_and_image')){
       Swal.fire('','Please upload question.','error');
        return;
    }
    if(this.form.value.video=='' && (this.question_type=='video' || this.question_type=='text_and_video')){
       Swal.fire('','Please upload question.','error');
        return;
    }
    if(this.form.value.question_text=='' && (this.form.value.question_type=='text_and_image' || this.form.value.question_type=='text_and_video'))
    {
      Swal.fire('','Please write question.','error');
      return;
    }

    if(!this.form.value.answer){
      Swal.fire('','Please select correct answer.','error');
      return;
    }


    this.form.value.question  =this.question_value;
    this.form.value.created_by=this.created_by; 
    this.form.value.video_file  = this.form.value.video;
    console.log('---video print comp');
    console.log(this.form.value);
    this.loading=true;
    this.gcService.addSingleQuestionTemp(this.form.value, this.created_by)
          .subscribe(
              data => { //console.log('data -- '+JSON.stringify(data));
                if(data['status']==200){
                    this.getDraftQuestion('single'); //Show all temp data 
                    this.alertService.pop('success', 'Question added successfully in temp');
                  }
                  else
                  {
                    this.alertService.pop('error', 'Something went wrong. Try again later.');
                  }

                  this.loading = false;
                  
              },
              error => {
                  this.alertService.pop('error', 'Something went wrong. Try again later.');
                  this.loading = false;
              });
  }

// Image Video
  uploadVideo(event) {
    const file = (event.target as HTMLInputElement).files[0];
    this.isVideo=true;
    this.form.patchValue({
      video: file
    });
    this.form.get('video').updateValueAndValidity()

    // File Preview
    const reader = new FileReader();
    reader.onload = () => {
      this.preview = reader.result as string;
    }
    reader.readAsDataURL(file)
  }


  onUpdateSingleTemp() 
  {     
    
        this.submitted = true;
        if (this.form.invalid) {
            return;
        }

        if(!this.form.value.answer){
          Swal.fire('','Please select correct answer.','error');
          return;
        }

        if(this.question_type=='text')
        {
          if(this.question_value=='' || this.question_value=='<p><br data-cke-filler="true"></p>'){
            Swal.fire('','Please write question.','error');
            return;
          }

          var qSize=this.isOverflown($(".ck-content")[0]);
      
          if(qSize){
            Swal.fire('','Question maximum request length exceeded ','error');
            return;
          }
        }
        if(this.croppedImage=='' && (this.question_type=='image' || this.question_type=='text_and_image')){
           Swal.fire('','Please upload question.','error');
            return;
        }
        if((this.form.value.video=='' || this.form.value.video==null) && (this.question_type=='video' || this.question_type=='text_and_video')){
           Swal.fire('','Please upload question.','error');
            return;
        }
        if(this.form.value.question_text=='' && (this.form.value.question_type=='text_and_image' || this.form.value.question_type=='text_and_video'))
        {
          Swal.fire('','Please write question.','error');
          return;
        }
        //console.log(this.form.value);return;
       
        this.form.value.question=this.question_value;
        this.form.value.created_by=this.created_by; 
        this.form.value.video_file  = this.form.value.video;
        this.form.value.isFile=this.isFile;
        this.form.value.isVideo=this.isVideo;

        console.log(this.form.value); 
        this.loading = true;
          /////update in temp////
          this.form.value.id=this.idEdit;
          this.gcService.updateSingleQuestionInDraft(this.form.value)
            .subscribe(
                data => {
                  if(data['status']==200){
                      this.alertService.pop('success', 'Question successfully updated');
                      this.getDraftQuestion('single');
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

  publishSingle() 
  {

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
        this.gcService.publishSingleQuestion(this.questionArr)
            .subscribe(
                data => {
                  if(data['status']==200){
                      this.alertService.pop('success', 'Question added successfully');
                      setTimeout(()=>this.router.navigate(['/general-competition']), 1000);
                      
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
          question_image: this.croppedImage
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

  qtChanged(element){
    this.question_type=element;
    this.question_value='';
    this.croppedImage='';
    this.isFile=false;
    this.isVideo=false;
    this.form.patchValue({
      question_text:'',
    });
  }


toggleVideo(event: any) {
    //event.toElement.play();
}
}
