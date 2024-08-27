import { Component, OnInit } from '@angular/core';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { ChangeEvent } from '@ckeditor/ckeditor5-angular/ckeditor.component';

import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PocquestionService } from '../../services/pocquestion.service';
import {ToasterModule, ToasterService} from 'angular2-toaster';


import domtoimage from 'dom-to-image-more';
declare var $: any;
declare var download: any;

@Component({
  selector: 'app-question',
  templateUrl: './add-question.component.html',
  styleUrls: ['./add-question.component.scss']
})
export class AddQuestionComponent implements OnInit {
	title = 'angularckeditor';
    public Editor = ClassicEditor;

    form: FormGroup;
	loading = false;
	submitted = false;
	error = '';
	questionArr:any;
	private toasterService: ToasterService;

	public value: string = `
    <p>The RichTextEditor triggers events based on its actions. </p>
                        <p> The events can be used as an extension point to perform custom operations.</p>
                        <ul>
                            <li>created - Triggers when the component is rendered.</li>
                            <li>change - Triggers only when RTE is blurred and changes are done to the content.</li>
                            <li>focus - Triggers when RTE is focused in.</li>
                            <li>blur - Triggers when RTE is focused out.</li>
                            <li>actionBegin - Triggers before command execution using toolbar items or executeCommand method.</li>
                            <li>actionComplete - Triggers after command execution using toolbar items or executeCommand method.</li>
                            <li>destroyed – Triggers when the component is destroyed.</li>
                        </ul>`;
    
        public getSVG1(){
          var html=document.createElement('div');
          html.innerHTML=this.value;

          domtoimage.toSvg(html,{})
            .then(function (dataUrl) {
              download(dataUrl,'question.svg','image/svg+xml');
            });
        }

        
 public getPNG(){
 var node = document.getElementById('my-node');
	domtoimage.toPng(node)
    .then(function (dataUrl) {
        var img = new Image();
        img.src = dataUrl;
        //document.body.appendChild(img);
        download(dataUrl,'question.png','image/png+xml');
    })
    .catch(function (error) {
        console.error('oops, something went wrong!', error);
    });
    }

	  constructor(private fb: FormBuilder,private route: ActivatedRoute,private router: Router,private pocquestionService: PocquestionService,private alertService: ToasterService) 
	  {
	  	this.form = this.fb.group({
	      question: [''],
	      category: [''],
	      status : [''],
	      option1: [''],
	      option2: [''],
	      option3: [''],
	      option4: [''],
	      answer: [''],
	      duration:['']
	    })
	  }


	  ngOnInit() {
	  }


	    onSubmit() {
        this.submitted = true;
        if (this.form.invalid) {
            return;
        }
        if(this.form.value.status){
        this.form.value.status="1";
        }
        else{
        this.form.value.status="0"
        }
 		this.form.value.question=this.value;
        this.loading = true; 
        this.pocquestionService.addQuestion(this.form.value)
            .subscribe(
                data => {
                	if(data['status']==200){
                    	this.alertService.pop('success', 'Question added successfully');
                    	setTimeout(()=>this.router.navigate(['/question']), 1500);
                    	
                    }
                    else
                    {
                    	this.alertService.pop('error', 'Something went wrong. Try again later.');
                    }

                    this.loading = false;
                    //this.router.navigate(['/question']);
                    
                },
                error => {
                    this.alertService.pop('error', 'Something went wrong. Try again later.');
                    this.loading = false;
                    //this.router.navigate(['/question']);
                });


    }

    public onChange( { editor }: ChangeEvent ) {
        this.value = editor.getData();
    }

}
