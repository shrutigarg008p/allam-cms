import { Component, OnInit } from '@angular/core';
import { ChangeEvent } from '@ckeditor/ckeditor5-angular/ckeditor.component';

import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PocquestionService } from '../../services/pocquestion.service';
import { ToasterModule, ToasterService} from 'angular2-toaster';
import { HttpEvent, HttpEventType } from '@angular/common/http';
import { HttpClient, HttpParams, HttpHeaders, HttpErrorResponse} from '@angular/common/http';
import { environment } from '../../../environments/environment';
import Swal from 'sweetalert2/dist/sweetalert2.js';

declare var $: any;

const apiUrl =environment.apiUrl;

@Component({
  selector: 'app-bulk-curriculum',
  templateUrl: './bulk-curriculum.component.html',
  styleUrls: ['./bulk-curriculum.component.scss']
})
export class BulkCurriculumComponent implements OnInit {
	title = 'angular Curriculum Bulk';

  form: FormGroup;
	loading = false;
	submitted = false;
	error = '';
	questionArr:any;

  uploadedFiles: Array<File>;
  isProcessed: boolean = false;
  isError: boolean;
  errorData: [];
  fileData: any[];
  errorCode : number;
  errorDesc : string;
  percentDone: any = 0;

  xlsxFile : File = null;
  zipFile : File = null;

  public selectedItems = [];

	private toasterService: ToasterService;

	constructor(private fb: FormBuilder,private route: ActivatedRoute,private router: Router, private http: HttpClient, private pocquestionService: PocquestionService,private alertService: ToasterService) 
	{
	  	this.form = this.fb.group({
	      excelFile: [null, Validators.required],
	      zipFile : [null, Validators.required]
	    })
	}

	ngOnInit() {

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
          this.xlsxFile = element.target.files[0];
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
        this.zipFile = element.target.files[0];
    }else{
      variable1.value = null;
      Swal.fire('','File type should be zip','error');
      return;
    }
  }

  upload() {
        this.showLoader(); 
        //debugger;

      this.uploadedFiles = new Array<File>();
      if (typeof (this.uploadedFiles) == "undefined") {
          this.uploadedFiles = new Array<File>();
          this.uploadedFiles.push(this.xlsxFile);
          this.uploadedFiles.push(this.zipFile);
      }
      else {
        this.uploadedFiles.push(this.xlsxFile);
        this.uploadedFiles.push(this.zipFile);
      } 
        
        //console.log('fileChange');
        //console.log(this.uploadedFiles);
        //console.log('End fileChange');
        //console.log('length', this.uploadedFiles);

        if (typeof (this.uploadedFiles) == "undefined") {
          this.isError = false;
          this.isProcessed=false;
          this.errorData = null;

          //this.alertService.pop('error', "Excel file or zip file not selected.");
          Swal.fire('','Excel file or zip file not selected.','error');
          this.hideLoader(); 
          return;
        }

        let formData = new FormData();
        for (var i = 0; i < this.uploadedFiles.length; i++) {
          formData.append("uploads[]", this.uploadedFiles[i], this.uploadedFiles[i].name);
        }
        //const url = 'http://localhost:3000/api/upload';
        this.http.post(apiUrl+'study-exam/api/upload', formData, { reportProgress: true, observe: "events"})
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
                              //console.log(this.fileData);

                              this.isError=false;
                              this.isProcessed=true;
                              this.alertService.pop('success', 'Study data upload successfully!');
                        }
                        else if (response.body.error_code == 1) {
                              this.isError = false;
                              this.isProcessed=false;
                              this.errorData = response.body["data"];
                              this.errorCode = response.body["error_code"];
                              this.errorDesc = response.body["err_desc"];

                              this.alertService.pop('error', response.body.err_desc);

                        }else if (response.body.error_code == 2) {
                              this.isError = true;
                              this.isProcessed=false;
                              this.errorData = response.body["data"];

                              this.alertService.pop('error', response.body.err_desc);
                        }   
                
                this.percentDone = false;
                       
                }

            
            this.hideLoader(); 
            //console.log('response receved is ', response);
            //console.log('HttpEventType -- '+JSON.stringify(HttpEventType));
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

    onCheckboxChange(event,val) {
        if(event.target.checked ) {
            this.selectedItems.push(val);
        }
         else {
          this.selectedItems.splice(this.selectedItems.indexOf(val),1);
        }

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
                     self.fileData.forEach(function(arrItem){
                        if (value == arrItem.question) {
                            self.fileData.splice(self.fileData.indexOf(arrItem),1);
                        } 
                     });
                });

              if(self.fileData.length==0){
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
        this.router.navigate(['/question/create']);
    }

    /*removeQuiz(quiz) {
        if(confirm("Are you sure to delete: "+quiz.question)) {
            this.fileData.splice(this.fileData.indexOf(quiz), 1);
            this.alertService.pop('success', 'Study data deleted successfully!');
        }
    }*/

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
}
