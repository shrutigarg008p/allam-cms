import { Component, OnInit } from '@angular/core';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { ChangeEvent,BlurEvent } from '@ckeditor/ckeditor5-angular/ckeditor.component';

import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators,FormControl } from '@angular/forms';
import { CurriculumSingleService } from '../../../services/studyexam/curriculum-single.service';
import { PocquestionService } from '../../../services/studyexam/pocquestion.service';
import { AuthenticationService } from '../../../services';
import {ToasterModule, ToasterService} from 'angular2-toaster';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import { TsupervisorService } from '../../../services/tsupervisor.service';
import { environment } from '../../../../environments/environment'
import domtoimage from 'dom-to-image-more';
import { ImageCroppedEvent } from 'ngx-image-cropper'; 

declare var $: any;
declare var download: any;

@Component({
  selector: 'app-question',
  templateUrl: './question.component.html',
  styleUrls: ['./question.component.scss']
})
export class QuestionComponent implements OnInit {

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
  editData:any=[];
  teacher_id:any;
  s3_url =environment.s3_url;
  local_api_url=environment.apiUrl;
  private durationOptions: string[] = ["05","15", "25", "30","60","120"];
  private levelOptions: string[] = ["1", "2", "3", "4", "5"];

  question_type:any='text';
  showModal:boolean=false;
  isFile:boolean=false;
  option_type:any='text';
  selectedAll: boolean = false;

  public config={
  fontSize: {
      options: [
          9,
          11,
          13,
          'default',
          17,
          19,
          21
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
    ],
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
              }

	  ngOnInit() {
          this.form = this.fb.group({
          question: [''],
          question_text: [''],
          question_image_url:[''],
          question_image:[''],
          qui_type:[''],
          question_type:['',Validators.required],
          option_type:[this.option_type],
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
          type:[''],
          duration: ['',Validators.required],
          delArray: this.fb.array([])
        });


        this.teacher_id = (this.activeAouter.snapshot.params['teacher_id']); //atob
        console.log(this.teacher_id);

        this.logUser    = this.authenticationService.currentUserValue;
        this.logUser    = JSON.parse(this.logUser);
        this.created_by = this.logUser['user'][0]['id']; 
        //this.getDraftQuestion();
        this.getPublishQuestion();
        this.getMasterData();

	  }

    get f() { return this.form.controls; }

    public getMasterData() {
        this.curriculumSingleService.getMasterData().subscribe(response => { 
        this.masterArr = response['data']; 
        //console.log( response.data);
        });
        console.log(this.masterArr);
    }

    public getPublishQuestion() {
    const params = this.getRequestParams(this.term, this.page, this.pageSize);
     //console.log(params);
        this.tsupervisorService.getPublishQuestionNew(this.teacher_id,params).subscribe(response => { 
        //console.log(response);
        this.questionArr = response['data'];
        this.count = response['count'];
        });
    }



     approveOneItem(item_id){
        var self = this;
        Swal.fire({
            title: 'Are you sure want to approve?',
            text: '',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, approve it!',
            cancelButtonText: 'No, keep it'
          }).then((result) => {
            if (result.value) 
            {
              self.tsupervisorService.approvePublishQuestion(item_id,this.created_by,this.editData).subscribe(() => {   
                self.getPublishQuestion();
              });

              Swal.fire(
                'Approved!',
                'Your data has been approved.',
                'success'
              )
             
            } else if (result.dismiss === Swal.DismissReason.cancel) {
              //Swal.fire('Cancelled','Your data is safe :)','error')
            }
          })
    }

    approveItem(){
       console.log(this.selectedItems);
       if(this.selectedItems.length==0){
       Swal.fire('Oh','No item selected to approve :)','error');
       return false;
       }
       var self = this;
        Swal.fire({
            title: 'Are you sure want to approve?',
            text: '',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, approve it!',
            cancelButtonText: 'No, keep it'
          }).then((result) => {
            if (result.value) {
              this.selectedItems.forEach(function (value) {
                   self.questionArr.forEach(function(arrItem){
                      if (value == arrItem.id) { 
                          self.tsupervisorService.approvePublishQuestion(value,self.created_by,self.editData).subscribe(() => {  
                            console.log('approved row'); 
                            self.getPublishQuestion();
                          });
                      } 
                   });
              });
              this.selectedAll=false;
               Swal.fire(
                'Approved!',
                'Your data has been approved.',
                'success'
              )
             
            } else if (result.dismiss === Swal.DismissReason.cancel) {
              //Swal.fire('Cancelled','Your data is safe :)','error')
            }
          })
    }



    onCheckboxChange(event,val) {
        if(event.target.checked ) {
            this.selectedItems.push(val);
        }
         else {
          this.selectedItems.splice(this.selectedItems.indexOf(val),1);
        }

    }

  pageChanged(event){
    this.config.currentPage = event;
  }

   downloadItem(){
      this.router.navigate([]).then(result => {  window.open('/authentication/studyexam-downlad/tsupervisor/1/'+this.teacher_id, '_blank'); });;
      //this.generatePDF();
  }

  editItem(event)
  {

    this.editData = event;
    console.log( this.editData);
    if(this.editData.quiz_type==1){
      this.isEditCurr   = true;
      this.isEditComp   = false;
    }
    else{
      this.isEditComp   = true;
      this.isEditCurr   = false;
    }
    
    this.isSave   = false;
    this.idEdit   = this.editData.id;
    this.question_value=this.editData.question;
     
    
    //const domEditableElement = document.querySelector('.ck-editor__editable');
    //const editorInstance = domEditableElement.ckeditorInstance;
    //editorInstance.setData(this.editData.question );

    //console.log('<<----------------');

    this.form.patchValue({
        save_type: this.editData.save_type,
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
        question_type:this.editData.question_type,
        option_type:this.editData.option_type,
        question_text:this.editData.question,
        qui_type:this.editData.qui_type,
        question_image_url:this.editData.question_image_url,
        question_image:this.editData.question_image,
        type:this.editData.type
        });

        this.croppedImage  = this.s3_url+this.editData.question_image_url;
        this.question_type = this.editData.question_type;
        this.option_type = this.editData.option_type;

        
  }

  onUpdateTemp() 
  {
   console.log(this.form.value); 
        this.submitted = true;
        if (this.form.invalid) {
            return;
        }

        if(!this.form.value.answer){
          Swal.fire('','Please select correct answer.','error');
          return;
        }

        if(this.form.value.question=='' && this.form.value.question_type!='image' ){
          Swal.fire('','Please write question.','error');
          return;
        }
        /*if(this.form.value.question_image=='' && (this.question_type=='image' || this.question_type=='text_and_image')){
           Swal.fire('','Please upload question.','error');
            return;
        }*/

        this.form.value.isFile=this.isFile;
        this.form.value.created_by=this.created_by; 

        this.loading = true;
          /////update in temp////
          this.form.value.id=this.idEdit;

          console.log(this.form.value);
          console.log('---------->>>>>>>>')  
            
          this.tsupervisorService.updateQuestionById(this.form.value)
              .subscribe(
                  data => {
                    if(data['status']==200){
                        this.alertService.pop('success', 'Question successfully updated');
                        this.getPublishQuestion();
                        this.idEdit=false; 
                        this.isEditCurr=false;
                        this.isEditComp=false;
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

          /*if(this.form.value.save_type=='bulk'){
            this.tsupervisorService.updateQuestionById(this.form.value)
              .subscribe(
                  data => {
                    if(data['status']==200){
                        this.alertService.pop('success', 'Question successfully updated');
                        this.getPublishQuestion();
                        this.idEdit=false; 
                        this.isEditCurr=false;
                        this.isEditComp=false;
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
          else
          {
            this.form.value.question=this.question_value;
          
              this.tsupervisorService.updateQuestionByTsSingle(this.form.value)
                .subscribe(
                    data => {
                      if(data['status']==200){
                          this.alertService.pop('success', 'Question successfully updated');
                          this.getPublishQuestion();
                          this.idEdit=false; 
                          this.isEditCurr=false;
                          this.isEditComp=false;
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
          */
  }

  goBack(){
    this.isEdit   = false;
    this.isEditComp   = false;
    this.isEditCurr   = false;
    this.isSave   = true;
  }

  public onChange( { editor }: BlurEvent ) {
    this.question_value = editor.getData();
    console.log('dsdsds');
    var html =$(".ck-content").html();
    this.question_value =html;
  }

  isOverflown(element) {
    return element.scrollHeight > element.clientHeight || element.scrollWidth > element.clientWidth;
  }

    //custom search & pagination
 getRequestParams(searchText, page, pageSize): any { 
    let params = {};

    if (searchText) {
      params[`searchText`] = searchText;
    }
    else{
      params[`searchText`] =0;
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
    this.getPublishQuestion();
  }

  handlePageSizeChange(event): void {
    this.pageSize = event.target.value;
    this.page = 1;
    this.getPublishQuestion();
  }

  qtChanged(element){
    this.question_type=element;
    this.option_type = 'text';
    this.question_value='';
    this.croppedImage='';
     this.form.patchValue({
        option1: '',
        option2: '',
        option3: '',
        option4: '',
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

  convertTwoDigit(n) {
    n = String(n);
    if (n.length == 1){
      n = '0' + n
    }
    return n;
  }


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
}
