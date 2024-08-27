import { Component, OnInit } from '@angular/core';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { ChangeEvent,BlurEvent} from '@ckeditor/ckeditor5-angular/ckeditor.component';

import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators,FormControl } from '@angular/forms';
import { CompetitiveSingleService } from '../../services/competitive-single.service';
import {ToasterModule, ToasterService} from 'angular2-toaster';

import Swal from 'sweetalert2/dist/sweetalert2.js';

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
    row_id=1;
    private toasterService: ToasterService;

    public question_value: string = ``;
    public config={
    toolbar: [
      'heading',
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

      constructor(private fb: FormBuilder,private activeAouter: ActivatedRoute,private router: Router,private alertService: ToasterService,private competitiveSingleService:CompetitiveSingleService) 
      {
        
      }


      ngOnInit() { 
        this.quiz_temp_id = (this.activeAouter.snapshot.params['quiz_temp_id']); //atob
        console.log(this.quiz_temp_id);
        this.form = this.fb.group({
          question: [''],
          option1: ['',Validators.required],
          option2: ['',Validators.required],
          option3: ['',Validators.required],
          option4: ['',Validators.required],
          answer: [''],
          class: ['',[Validators.required, Validators.pattern("^[0-9]*$")]],
          quiz_sub_type: ['',Validators.required],
          quiz_type: ['',Validators.required],
          chapter: ['',[Validators.required, Validators.pattern("^[0-9]*$")]],
          subject: ['',Validators.required],
          semester: ['',[Validators.required, Validators.pattern("^[0-9]*$")]],
          quant_verbal: ['',Validators.required],
          group: ['',Validators.required],
          lesson: ['',[Validators.required, Validators.pattern("^[0-9]*$")]],
          note: [''],
          level: ['',[Validators.required, Validators.pattern("^[0-9]*$")]],
          delArray: this.fb.array([])


        });
      }

      get f() { return this.form.controls; }

       onSubmit() {
        
        this.submitted = true;
        if (this.form.invalid) {
            return;
        }
        if(!this.form.value.answer){
          Swal.fire('','Please select correct answer.','error');
          return;
        }
        if(this.question_value=='' || this.question_value=='<p><br data-cke-filler="true"></p>'){
          Swal.fire('','Please write question.','error');
          return;
        }

        var qSize=this.isOverflown($(".ck-content")[0]);

        if(qSize){
          Swal.fire('','Question maximum request length exceeded ','error');
          return;
        }

        this.gridview=true;
        this.form.value.q_id=this.row_id;
        this.row_id=this.row_id+1;
        this.form.value.question=this.question_value;
        //console.log(this.form.value);
        this.questionArr.push(this.form.value)
        //console.log(this.questionArr);

        this.form.reset();
        this.submitted=false

        }

        publish() {
      
        console.log(this.questionArr)
        this.submitted2 = true;
        this.loading2 = true; 
        this.competitiveSingleService.saveQuiz(this.questionArr,this.quiz_temp_id)
            .subscribe(
                data => {
                    if(data['status']==200){
                        this.alertService.pop('success', 'Question added successfully');
                        setTimeout(()=>this.router.navigate(['/question']), 1000);
                        
                    }
                    else
                    {
                        this.alertService.pop('error', 'Something went wrong. Try again later.');
                    }

                    this.loading2 = false;
                    //this.router.navigate(['/question/curriculum-single']);
                    
                },
                error => {
                    this.alertService.pop('error', 'Something went wrong. Try again later.');
                    this.loading2 = false;
                    //this.router.navigate(['/question']);
                });


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
                   
                      if (value == arrItem.q_id) { 
                          self.questionArr.splice(self.questionArr.indexOf(arrItem),1);
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
        console.log('dsdsds');
        var html =$(".ck-content").html();
        this.question_value =html;
    }

    isOverflown(element) {
      return element.scrollHeight > element.clientHeight || element.scrollWidth > element.clientWidth;
    }

}
