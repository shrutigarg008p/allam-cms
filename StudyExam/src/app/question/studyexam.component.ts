import { Component, OnInit, Pipe, Output, EventEmitter } from '@angular/core';
import { Question } from '../models/question';
import { QuestionService } from '../services/question.service';
import { PocquestionService } from '../services/pocquestion.service';
import {ToasterModule, ToasterService} from 'angular2-toaster'
import { CompetitiveSingleService } from '../services/competitive-single.service';


import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators,FormControl } from '@angular/forms';
import Swal from 'sweetalert2/dist/sweetalert2.js';

@Component({
  selector: 'app-studyexam',
  templateUrl: './studyexam.component.html',
  //pipes: [OrderBy] 
})


export class StudyexamComponent implements OnInit {
  form: FormGroup; 
  questions:  any;

  private toasterService: ToasterService;

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

  fileData: File = null;

  //@Output() public found = new EventEmitter<any>();
  found: Array <any> = [];
  quiz_icon_str: string;
  preview: string;

  constructor(private fb: FormBuilder,private route: ActivatedRoute,private pocquestionService: PocquestionService,private questionService: QuestionService, private router: Router,private alertService: ToasterService, private competitiveSingleService:CompetitiveSingleService) { 

    
      this.form = this.fb.group({
          upload_type:['single'],
          quiz_type: ['Curriculum Exam',Validators.required],
          quiz_sub_type: ['',Validators.required],
          quiz_title: ['',Validators.required],
          quiz_description: ['',Validators.required],
          quiz_icon:[null],

        });

    }

  ngOnInit() {
         

        this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

get f() { return this.form.controls; }

uploadFile(event) {
  if (event.target.files && event.target.files.length > 0) {
    this.preview = '';
    const file = (event.target as HTMLInputElement).files[0];
    let img = new Image();
    let reader = new FileReader();
    img.src = window.URL.createObjectURL( file );
    reader.readAsDataURL(file);

    //this.fileData = <File>event.target.files[0];
    // File Preview
    //const reader = new FileReader();
    /*reader.onload = () => {
      //this.preview = reader.result as string;
    }*/
    reader.onload = () => {
      setTimeout(() => {
        const width = img.naturalWidth;
        const height = img.naturalHeight;

        window.URL.revokeObjectURL( img.src );
        console.log(width + '*' + height);
        console.log('size', file.size);
        console.log('type', file.type);
   
        if(file.type !== 'image/jpeg' && file.type !== 'image/jpg' && file.type !== 'image/png'){
          Swal.fire('','Image type should be jpeg, jpg or png','error');
          return;
        }else if ( width !== 200 && height !== 200 ) {
          //alert('photo should be 64 x 64 size');
          Swal.fire('','Image should be 200 x 200 size.','error');
          return;
          //this.form.reset();
        } else {
          console.log('after');
          this.form.patchValue({
            quiz_icon: file
          });
          this.form.get('quiz_icon').updateValueAndValidity()
          this.preview = reader.result as string;
        }
      }, 1000);
    };

    
    //reader.readAsDataURL(file)
  }


}

onSubmit(){
  if(this.form.value.quiz_type=='Curriculum Exam'){
    this.isCompt=false;
     if(this.form.value.upload_type=='single'){
       this.router.navigate(['/question/curriculum-single']);
     }else{
       this.router.navigate(['/question/curriculum-bulk']);
     }
  }
  if(this.form.value.quiz_type=='Competitive Exam'){

  this.submitted = true;
  if (this.form.invalid) {
      return;
  }
  if(this.form.value.quiz_icon==null){
      Swal.fire('','Please upload quiz icon.','error');
      return;
  }
    this.isCompt=true;

    /* Add image start*/
    const formData = new FormData();
    formData.append('quiz_icon', this.form.value.quiz_icon);

    //console.log('formData '+JSON.stringify(formData))

    this.competitiveSingleService.saveQuizInImage(formData).subscribe(
      (data) => {console.log(data)
          if(data['status']==200){
             this.quiz_icon_str = data['quiz_icon'];

            
              if(this.form.value.upload_type=='single'){
                 //this.router.navigate(['/question/competitive-single']);

                  console.log(this.form.value);
                 this.submitted = true;
                  if (this.form.invalid) {
                      return;
                  }

                  //////save in temp/////
                  this.submitted = true;
                  this.loading = true;

                  this.found = this.form.value;
                  this.found['quiz_icon_url'] = this.quiz_icon_str;

                  this.competitiveSingleService.saveQuizInTemp(this.found)
                  .subscribe(
                  data => {
                      if(data['status']==200){                
                        if(this.form.value.upload_type=='single'){
                          var signal_url = '/question/competitive-single/'+btoa(data['temp_quiz_id']);
                          this.router.navigate([signal_url]);
                        }else{
                          var bulk_url = '/question/competitive-bulk/'+btoa(data['temp_quiz_id']);

                          this.router.navigate([bulk_url]);
                        }
                      }
                      else
                      {
                        this.router.navigate(['/question/create']);
                        this.alertService.pop('error', 'Something went wrong. Try again later.');
                      }
                      this.loading = false;
                  },
                  error => {
                      this.alertService.pop('error', 'Something went wrong. Try again later.');
                      this.loading = false;
                      this.router.navigate(['/question/create']);
                  });
              }else{
                 
                 this.found = this.form.value;
                 //this.found['fileData'] = this.fileData;
                 this.found['quiz_icon_url'] = this.quiz_icon_str;
                 //console.log('this.found '+JSON.stringify(this.found));
                 this.questionService.insertData(this.found);
                 this.found = [];
                 this.router.navigate(['/question/competitive-bulk']);
              }
               //this.found = this.form.value;
          }
        },
      (err) => console.log(err)
    );
    /* End here */
     
     
  }
  //console.log(this.form.value)
}

examType(){
  if(this.form.value.quiz_type=='Competitive Exam'){
    this.isCompt=true;
  }
  else{
    this.isCompt=false;

  }
}

}
