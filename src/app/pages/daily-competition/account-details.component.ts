import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { HttpClient, HttpParams, HttpHeaders, HttpErrorResponse} from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { DcService } from '../../services/dc.service';

//import { FileRestrictions } from '@progress/kendo-angular-upload';
const apiUrl =environment.apiUrl;

@Component({
    selector: 'account-details',
    template: `
        <ng-container [formGroup]="accountDetails">
            <div class="row">
                    <div class="col-sm-12 col-md-3 "> 
                      <div class="competition-logo-upload">
                        Competition Logo Uplaod
                        </div>
                        <input type="file" class="form-control choosefiles" formControlName="logo">
                    </div>

                    <div class="col-sm-12 col-md-8 "> 
                      
                      <div class="group m-b-15">
                        <label>Name of the competition</label>
                        <input class="form-control" formControlName="competitionName" placeholder=" " type="text" >
                      </div>

                      <div class="group  m-b-15">
                        <label>Description</label>
                        <textarea class="form-control" cols="5" formControlName="description" placeholder="Default textarea" rows="5"></textarea>
                      </div>

                       <div class="group m-b-15">
                          <label>Upload Your File </label>
                          <input (change)="fileChange($event)" type="file" class="form-control choosefiles" formControlName="excelFile">
                        </div>
                        <div class="group m-b-15">
                         <!-- <img src="assets/images/sample-quiz-icon.png"> -->
                         Sample Quiz
                        </div>

                      <div class="group color m-b-15">
                        <label>Upload Your File </label>
                        <input (change)="fileChange($event)" type="file" class="form-control choosefiles" formControlName="zipFile">
                      </div>
                      <div class="group m-b-15">
                        Please upload a zip file which contains subfolders for Images
                        and Videos. The image file type should be .png / .jpg / .jpeg
                        and the video file type should be .mp4. The images and
                        videos should be placed in their designated folders.
                        </div>
                        <!---
                        <div class="group  files color m-b-15" style="display: block;">
                          <label>Upload Your File </label>
                          <input class="form-control" multiple="" type="file">
                        </div>
                        -->

                       

                        <div class="col-md-4">
                          <div class="input-group-prepend text-center">
                            <button class="input-group-text upload" (click)="upload()" id="btnUpload">Upload</button>
                          </div>
                          <div *ngIf='response && response["error_code"] == 0'>{{response["err_desc"]}}</div>
                        </div>
                    </div>
                  </div>
      </ng-container>
    `,
    providers: [DcService] // inject in module for singleton instance
})

export class AccountDetailsComponent implements OnInit {
    //public uploadSaveUrl = 'saveUrl'; // should represent an actual API endpoint
    //public uploadRemoveUrl = 'removeUrl'; // should represent an actual API endpoint

    /*public restrictions: FileRestrictions = {
        allowedExtensions: ['jpg', 'jpeg', 'png']
    };*/

    isProcessed: boolean;
    isError: boolean;
    errorData: [];
    fileData: any[];

    public currentStep = 0;

    constructor(private http: HttpClient, private dataService: DcService) {}

    uploadedFiles: Array<File>;
    //@Input() public uploadedFiles: Array<File>;

    @Input() public accountDetails: FormGroup;

    //@Output() public uploadedFiles = new EventEmitter<any>();

    fileChange(element) {
      
    if (typeof (this.uploadedFiles) == "undefined") {
      this.uploadedFiles = new Array<File>();
      this.uploadedFiles.push(element.target.files[0]);
    }
    else {
      this.uploadedFiles.push(element.target.files[0]);
    }
    //console.log(this.uploadedFiles);
  }

  ngOnInit() {
     
  }

    upload() {
    
        //debugger;
        /*if(typeof(this.selectedCategory)=="undefined" || this.selectedCategory==""){
          alert("Category is required!");
          return;
        }
        if(typeof(this.selectedSubCategory)=="undefined" || this.selectedSubCategory==""){
          alert("Sub Category is required!");
          return;
        }
        if(typeof(this.selectedLanguage)=="undefined" || this.selectedLanguage==""){
          alert("Language is required!");
          return;
        }*/
        //console.log('fileChange');
        //console.log(this.uploadedFiles);
        //console.log('End fileChange');
        let formData = new FormData();
        for (var i = 0; i < this.uploadedFiles.length; i++) {
          formData.append("uploads[]", this.uploadedFiles[i], this.uploadedFiles[i].name);
        }
        //const url = 'http://localhost:3000/api/upload';
        this.http.post(apiUrl+'competition/api/upload', formData)
          .subscribe((response) => {
            this.isProcessed=true;
            if (response["error_code"] == 2) {
              this.isError = true;
              this.errorData = response["data"];
            }
            else if (response["error_code"] == 0) {
              //this.errorData = response["data"];
              this.fileData = response["data"];
              //console.log(this.fileData);
              //this.dataService.setEvent(response["data"])
              this.passDataToService(this.fileData);
              //this.dataService.setData(this.fileData);

              this.isError=false;
            }
            console.log('response receved is ', response);
          });
        }

        //passObjects : any[] = [{'name': 'John', 'city': 'paris'},{'name': 'Bob', 'city': 'london'}, {'name': 'Grim', 'city': 'paris'}];

        /*passDataToService() { console.log("fileData "+this.fileData);
           //this.dataService.allPassedData.next(this.fileData); // here you emit the objects
           //this.dataService.storePassedObject(this.fileData);
          }*/

        passDataToService(filearray) {
       this.dataService.storePassedObject(filearray); // here you emit   the objects 
    }
}
