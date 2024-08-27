import { Component, OnInit } from '@angular/core';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { ChangeEvent,BlurEvent} from '@ckeditor/ckeditor5-angular/ckeditor.component';

import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators,FormControl } from '@angular/forms';
import { CompetitiveSingleService } from '../../../services/studyexam/competitive-single.service';
import {ToasterModule, ToasterService} from 'angular2-toaster';
import { AuthenticationService } from '../../../services';

import Swal from 'sweetalert2/dist/sweetalert2.js';
import { ImageCroppedEvent } from 'ngx-image-cropper'; 
import { environment } from '../../../../environments/environment'
 

import domtoimage from 'dom-to-image-more';
declare var $: any;
declare var download: any;

@Component({
  selector: 'app-single-competitive',
  templateUrl: './single-competitive.component.html',
  styleUrls: ['./single-competitive.component.scss']
})
export class SingleCompetitiveComponent implements OnInit {
    title = 'angularckeditor';
    s3_url =environment.s3_url;
    public Editor = ClassicEditor;
    public selectedItems = [];
    form: FormGroup;
    loading = false;
    submitted = false;
    loading2 = false;
    submitted2 = false;
    gridview = false;
    quiz_temp_id:number;
    error = '';
    private questionArr:any=[];
    private quizArr:any=[];
    row_id=1;
    private toasterService: ToasterService;

    logUser:any;
    created_by:number;
    isEdit=false;
    idEdit=false;
    editData:any=[];
    pre_quiz_title:string;
    masterArr:any=[];
    quiz_type_id:number;
    quiz_sub_type_id:number;

    question_type:any='text';
    showModal:boolean=false;
    isFile:boolean=false;

    public question_value: string = ``;
    public optiona_value: string = ``;
    public optionb_value: string = ``;
    public optionc_value: string = ``;
    public optiond_value: string = ``;
    public default_font_size='font-size:18px';
    language:any='arabic'; 

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
      'underline', 
      'strikethrough',
      'link',
      'bulletedList',
      'numberedList',
      '|',
      'indent',
      'outdent',
      '|',
      //'imageUpload',
      //'blockQuote',
      //'insertTable',
      //'mediaEmbed',
      'MathType',
      'ChemType',
      'undo',
      'redo'
    ],
    contentsLangDirection : 'rtl',
    contentsLanguage:'ar',
    language:'ar'
  }

      constructor(private fb: FormBuilder,
      private activeAouter: ActivatedRoute,
      private router: Router,
      private alertService: ToasterService,
      private competitiveSingleService:CompetitiveSingleService,
      private authenticationService: AuthenticationService) 
      {
        
      }


      ngOnInit() 
      { 
        this.quiz_temp_id = (this.activeAouter.snapshot.params['quiz_temp_id']); //atob
        console.log(this.quiz_temp_id);
       

        this.form = this.fb.group({
          question: [''],
          question_text: [''],
          question_image_url:[''],
          question_type:[this.question_type,Validators.required],
          language:[this.language],
          option1: [''],
          option2: [''],
          option3: [''],
          option4: [''],
          answer: [''],
          class: [''],
          quiz_sub_type: [''],
          quiz_type: [''],
          chapter: [''],
          subject: [''],
          semester: [''],
          quant_verbal: [''],
          group: ['',Validators.required],
          lesson: [''],
          note: [''],
          level: [''],
          duration: ['',[Validators.required, Validators.pattern("^[0-9]*$")]],
          delArray: this.fb.array([])
        });

      
        this.logUser    = this.authenticationService.currentUserValue;
        this.logUser    = JSON.parse(this.logUser);
        this.created_by = this.logUser['user'][0]['id']; 
         //check draft quiz
        this.getDraftQuiz();
        this.getDraftQuestion();
        this.getMasterData();
        

      }

      public getMasterData() {
        this.competitiveSingleService.getMasterData().subscribe(response => { 
        this.masterArr = response['data']; 
        });
        console.log(this.masterArr);
      }

      public getDraftQuestion(user_id=0) {
        this.competitiveSingleService.getDraftQuestionByUser(this.created_by,this.quiz_temp_id).subscribe(response => { 
        this.questionArr = response; 
        if(this.questionArr.length>0){
          this.gridview=true;
        }
        
        });
      }

      public getDraftQuiz() {
        this.competitiveSingleService.getDraftQuizByUser(this.created_by,this.quiz_temp_id).subscribe(response => {  
        this.quizArr=response;
       
        if(this.quizArr.length==0){
          this.router.navigate(['/study-exam/create'])
        }
        this.pre_quiz_title = this.quizArr[0].quiz_title;
        this.quiz_type_id   = this.quizArr[0].quiz_type;
        this.quiz_sub_type_id   = this.quizArr[0].quiz_sub_type;

        this.form.patchValue({
          quiz_type:this.quiz_type_id,
          quiz_sub_type:this.quiz_sub_type_id,
        });

        
        });
      }

      get f() { return this.form.controls; }

       onSubmit() {
         console.log(this.form.value);
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

          //var qSize=this.isOverflown($(".ck-content")[0]);
          var qSize=this.isOverflown($(".question").find("div.ck-content")[0]);

          if(qSize){
            Swal.fire('','Question maximum request length exceeded ','error');
            return;
          }
        }
        if(this.croppedImage=='' && this.question_type!='text'){
           Swal.fire('','Please upload question.','error');
            return;
        }
        if(this.form.value.question_text=='' && this.form.value.question_type=='text_and_image'){
          Swal.fire('','Please write question.','error');
          return;
        }

        if(this.optiona_value=='' || this.optiona_value=='<p><br data-cke-filler="true"></p>' ){
            Swal.fire('','Please write option A.','error');
            return;
        }
        if(this.optionb_value=='' || this.optionb_value=='<p><br data-cke-filler="true"></p>' ){
            Swal.fire('','Please write option B.','error');
            return;
        }
        if(this.optionc_value=='' || this.optionc_value=='<p><br data-cke-filler="true"></p>' ){
            Swal.fire('','Please write option C.','error');
            return;
        }
        if(this.optiond_value=='' || this.optiond_value=='<p><br data-cke-filler="true"></p>' ){
            Swal.fire('','Please write option D.','error');
            return;
        }

        this.gridview=true;
        this.form.value.isFile=this.isFile;
        this.form.value.created_by=this.created_by; 
        this.form.value.quiz_temp_id=this.quiz_temp_id; 

        this.form.value.question=this.question_value;
        this.form.value.created_by=this.created_by; 
        this.form.value.option1=this.optiona_value;
        this.form.value.option2=this.optionb_value;
        this.form.value.option3=this.optionc_value;
        this.form.value.option4=this.optiond_value;

       
        //this.questionArr.push(this.form.value)
        //this.form.reset();
        //this.submitted=false

        this.loading = true;

        if(this.idEdit && this.isEdit){
          /////update in temp////
          this.form.value.id=this.idEdit;

          console.log(this.form.value);
          console.log('---------->>>>>>>>')  
          this.competitiveSingleService.updateQuestionInDraft(this.form.value)
            .subscribe(
                data => {
                  if(data['status']==200){
                      this.alertService.pop('success', 'Question successfully saved in draft');
                      this.getDraftQuestion();
                      //setTimeout(()=>this.router.navigate(['/study-exam']), 1000);
                      this.idEdit=false; 
                      this.isEdit=false;
                    }
                    else
                    {
                      this.alertService.pop('error', 'Something went wrong. Try again later.');
                    }
                    this.croppedImage='';
                    this.loading = false;
                    this.submitted=false

                    
                },
                error => {
                    this.alertService.pop('error', 'Something went wrong. Try again later.');
                    this.loading = false;
                    this.submitted=false

                });
        }
        else{
          /////save in temp////
          this.competitiveSingleService.saveQuestionInDraft(this.form.value)
            .subscribe(
                data => {
                  if(data['status']==200){
                      this.alertService.pop('success', 'Question successfully saved in draft');
                      this.getDraftQuestion();
                      //setTimeout(()=>this.router.navigate(['/study-exam']), 1000);
                    }
                    else
                    {
                      this.alertService.pop('error', 'Something went wrong. Try again later.');
                    }

                    this.croppedImage='';
                    this.loading = false;
                    this.submitted=false

                    
                },
                error => {
                    this.alertService.pop('error', 'Something went wrong. Try again later.');
                    this.loading = false;
                    this.submitted=false

                });
        }


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
        this.competitiveSingleService.saveQuiz(this.questionArr,this.quiz_temp_id)
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

        publish_() {
      
        console.log(this.questionArr)
        this.submitted2 = true;
        this.loading2 = true; 
        this.competitiveSingleService.saveQuiz(this.questionArr,this.quiz_temp_id)
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
                    //this.router.navigate(['/study-exam/curriculum-single']);
                    
                },
                error => {
                    this.alertService.pop('error', 'Something went wrong. Try again later.');
                    this.loading2 = false;
                    //this.router.navigate(['/study-exam']);
                });


    }
    
    downloadItem(){
      this.router.navigate([]).then(result => {  window.open('/authentication/studyexam-downlad/teacher/3/'+this.quiz_temp_id, '_blank'); });;
      //this.generatePDF();
    }

    editItem(event)
    {
      this.isFile=false;
      this.editData = event;
      this.isEdit   = true;
      this.idEdit   = this.editData.id;
      this.question_value=this.editData.question;
      
      console.log('---------------->>');
      console.log(this.question_value);
      
      //const domEditableElement = document.querySelector('.ck-editor__editable');
      //const editorInstance = domEditableElement.ckeditorInstance;
      //editorInstance.setData(this.editData.question );

      console.log('<<----------------');

      this.form.patchValue({
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
          duration:this.editData.duration,
          question_type:this.editData.qui_type,
          question_text:this.editData.question,
          qui_type:this.editData.qui_type,
          question_image_url:this.editData.question_image_url,
          });
          this.croppedImage=this.s3_url+this.editData.question_image_url;
          this.question_type=this.editData.qui_type;
          window.scroll(0,0);

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

              self.competitiveSingleService.deleteDraftQuestion(item_id).subscribe(() => {  
                console.log('deleted draft row'); 
                self.getDraftQuestion();

              });

              if(self.questionArr.length==0){
                this.gridview=false;
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


    deletItem(){
       
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

              this.selectedItems.forEach(function (value) {
                   self.questionArr.forEach(function(arrItem){
                   
                      if (value == arrItem.id) { 
                          self.questionArr.splice(self.questionArr.indexOf(arrItem),1);
                          self.competitiveSingleService.deleteDraftQuestion(value).subscribe(() => {  
                            console.log('deleted draft row'); 
                          });
                      } 
                   });
              });

              if(self.questionArr.length==0){
                this.gridview=false;
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

    onCheckboxChange(event,val) {
        if(event.target.checked ) {
            this.selectedItems.push(val);
        }
         else {
          this.selectedItems.splice(this.selectedItems.indexOf(val),1);
        }

    }


    public onChange( { editor }: BlurEvent ) {
        this.question_value = editor.getData();
        //var html =$(".ck-content").html();
        var html = $(".question").find("div.ck-content").html();
        html = html.replace("<p>", "<p style='"+this.default_font_size+"'>");
        this.question_value =html;
    }

    public onChangeA( { editor }: BlurEvent ) {
        this.optiona_value = editor.getData();
        var html = $(".optiona").find("div.ck-content").html();
        html = html.replace("<p>", "<p style='"+this.default_font_size+"'>");
        this.optiona_value =html;
        console.log('editor change event Option A'+html);
    }
    public onChangeB( { editor }: BlurEvent ) {
        this.optionb_value = editor.getData();
        var html = $(".optionb").find("div.ck-content").html();
        html = html.replace("<p>", "<p style='"+this.default_font_size+"'>");
        this.optionb_value =html;
        console.log('editor change event Option B'+html);
    }
    public onChangeC( { editor }: BlurEvent ) {
        this.optionc_value = editor.getData();
        var html = $(".optionc").find("div.ck-content").html();
        html = html.replace("<p>", "<p style='"+this.default_font_size+"'>");
        this.optionc_value =html;
        console.log('editor change event Option C'+html);
    }
    public onChangeD( { editor }: BlurEvent ) {
        this.optiond_value = editor.getData();
        var html = $(".optiond").find("div.ck-content").html();
        html = html.replace("<p>", "<p style='"+this.default_font_size+"'>");
        this.optiond_value =html;
        console.log('editor change event Option D'+html);
    }

    isOverflown(element) {
      return element.scrollHeight > element.clientHeight || element.scrollWidth > element.clientWidth;
    }

  qtChanged(element){
    this.question_type=element;
    this.question_value='';
    this.croppedImage='';
    this.form.patchValue({
      question_text:'',
    });
  }

  lgChanged(element)
  {
    this.language=element;
    if(element=='english'){
      $(".q_opton,.question").removeClass("rtl-txt");
      $(".q_opton,.question").addClass("ltr-txt");
      //update editor config
      this.config.contentsLangDirection='ltr';
      this.config.contentsLanguage='en';
      this.config.language='en';
    }
    else{
      $(".q_opton,.question").removeClass("ltr-txt");
      $(".q_opton,.question").addClass("rtl-txt");
      //update editor config
      this.config.contentsLangDirection='rtl';
      this.config.contentsLanguage='ar';
      this.config.language='ar';
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
}
