import { Component, EventEmitter, Input, OnInit, Output, ViewChild, AfterViewInit, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { HttpEvent, HttpEventType, HttpResponse } from '@angular/common/http';
import { HttpClient, HttpParams, HttpHeaders, HttpErrorResponse} from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { LeagueService } from '../../services/league.service';
import {ToasterModule, ToasterService} from 'angular2-toaster';
import { Router } from '@angular/router';
import { formatDate } from '@angular/common';
import { AuthenticationService } from '../../services';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import { Observable } from 'rxjs';
import $ from 'jquery';
//import { MultiFilesUploadComponent } from './multi-files-upload/multi-files-upload.component';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { HeaderService } from '../../services/header.service';
import { ImageCroppedEvent } from 'ngx-image-cropper';

declare var $: any;
const apiUrl =environment.apiUrl;

interface Post {
  startDate: Date;
  endDate: Date;
  //startTime: Time;
  //endTime: Time;
}

@Component({
  selector: 'app-league-competition',
  templateUrl: './league.component.html',
  styleUrls: ['./league.component.scss']
})

export class LeagueCompetitionComponent implements OnInit {
  
  //@ViewChild(MultiFilesUploadComponent, {static: false}) child: MultiFilesUploadComponent;
  @ViewChild('figAudio', {static: false}) figAudio: ElementRef; // audio tag reference
  @ViewChild('figAudio1', {static: false}) figAudio1: ElementRef; // audio tag reference
  @ViewChild('figAudio2', {static: false}) figAudio2: ElementRef; // audio tag reference
	formContent: any;
  formData: any;
  activeStepIndex: number;

  fileArr:any=[];
  //uploadedFiles: Array <any> = [];
  //uploadedFiles: any[] = [];
  myFiles:string [] = [];
  uploadedFiles: Array<File>;
  isError: boolean;
  errorData: [];
  fileData: any[];
  errorCode : number;
  errorDesc : string;
  loading: boolean;
  oneToSixtyArray: any = [];
  showWaiting_time: string;
  showNarration_time : string;
  showCropModal: boolean;
  image_type: string = '';
  showCropper = false;
    //image cropping
  imageChangedEvent: any = '';
  croppedImage: any = '';
  
  public currentStep = 0;
  private sumbitted = false;
  private isStepValid = (index: number): boolean => {
      return this.getGroupAt(index).valid
  }
  private shouldValidate = (): boolean => {
      return this.sumbitted === true;
  }
  isProcessed: boolean = false;
  
  selectedType: any = '';
  formVar: FormGroup;
  preview: string;
  previewCompanyLogo : string;
  audSrc:string;
  audSrc1:string;
  audSrc2:string;
  dateString:string;
  timeString: string;
  percentDone: any = 0;
  logUser:any;
  created_by:number;
  questionType: string;
  post: Post = {
    startDate: new Date(Date.now()),
    endDate: new Date(Date.now()),
    //startTime: new Time(Time.now()),
    //endTime: new Time(Time.now())
  }

  advFile : any = [];
  dropdownList: any = [];
  selectedItems: any = [];
  dropdownSettings:IDropdownSettings = {};
  narrationOptions : string = 'file';
  selectedFiles: FileList;
  progressInfos = [];
  message = '';
  fileInfos: Observable<any>;
    
  public invalidMoment =  new Date().toISOString(); //toString(); 
  //public min = new Date(2021, 1, 3, 10, 30);
  public min = new Date().toISOString();//.toString(); //.toISOString();
  public max = new Date(2021, 3, 21, 20, 30);
  
  private narrOption: string[] = ["file"];
  constructor(public fb: FormBuilder, private http: HttpClient, private leagueService: LeagueService, private alertService: ToasterService, private router:Router, private authenticationService: AuthenticationService, private headerService: HeaderService) {
  // Reactive Form
    this.formVar = this.fb.group({
    	  logo: [null],
      	competitionName: [''],
      	description: [''],
        startTime:['', Validators.required],
        endTime: ['00:00:00'],
        waitingTime : ['00:05:00'],
        companyName: [''],
        companyLogo: [null],
        companyUrl: [''],
        companyDescription: [''],
        excelFile: [null],
        zipFile: [null],
        file: [null],
        question_type: [''],
        categories: ['', Validators.required],
        startDate: [formatDate(this.post.startDate, 'yyyy-MM-dd', 'en')],
        endDate: [formatDate(this.post.endDate, 'yyyy-MM-dd', 'en')],
        imageInput:[''],
        startDateTime:  [''],
        minute_time: [''],
        second_time: [''],
        narration_text: [''],
        narration_time:[''],
        narration_text1: [''],
        narration_text2: [''],
        narration_time1:[''],
        narration_time2:[''],
        narration_type:[''],
        narration_url:[''],
        narration_url1:[''],
        narration_url2:['']
    }) 
  }

  ngOnInit(): void {
    //this.formContent = STEP_ITEMS;
    var date = new Date();
    console.log(date.toString());
    this.formData = {};
    this.fileData = new Array<File>();
    console.log(`jQuery version: ${$.fn.jquery}`);
    // Get user id by 
    this.logUser    = this.authenticationService.currentUserValue;
    this.logUser    = JSON.parse(this.logUser);
    this.created_by = this.logUser['user'][0]['id'];  

    this.getSeconds();

    this.getAllCategory();
    this.dropdownSettings = {
      singleSelection: false,
      idField: 'id',
      textField: 'title',
      enableCheckAll : false,
      searchPlaceholderText: 'Search Categories',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 3,
      allowSearchFilter: true
    };
  }

  get f() { return this.formVar.controls; }

  private getAllCategory() {
    this.headerService.getCategory().subscribe(categories => { 
    this.dropdownList = categories; ;
    //console.log(this.dropdownList);
    });
  }
  private getSeconds(){
    for(var value = 0; value < 60; value++) {
      var values ;
      if(value.toString().length < 2) {
        values = "0"+value
      }else{
        values = value
      }
      
      this.oneToSixtyArray.push(values);
    }
  }

  public getFileStatus(getStatus:any):void { console.log(getStatus)
    this.loading = getStatus;
  }
  
  public getFileData(fileDataBroadcast: any):void {
    this.fileArr = fileDataBroadcast;
    console.log('Picked date: ', fileDataBroadcast);
    this.advFile = [];
    //this.advFile.push(fileDataBroadcast.locationArray);
    var fileArray = fileDataBroadcast.locationArray;
    if(fileArray && (Object.keys(fileArray).length > 0)){
      this.loading = false;
      for (let index = 0; index < fileArray.length; index++) {
        this.advFile.push(fileArray[index]);
      }
    }
  }

  narrationOption(event) {
    this.narrationOptions = event.target.value;
  }

  audFileSelected(event: any) {
    if (event.target.files && event.target.files[0]) {
      const file = (event.target as HTMLInputElement).files[0];
      this.formVar.patchValue({
        narration_url: file
      });
      this.formVar.get('narration_url').updateValueAndValidity()
  
      this.audSrc = URL.createObjectURL(event.target.files[0]);
      console.log(this.audSrc);
      this.figAudio.nativeElement.src = this.audSrc;
    }else{
      this.audSrc = '';
      this.figAudio.nativeElement.src = '';
    }
  }

  audFileSelected1(event: any) {
    if (event.target.files && event.target.files[0]) {
      const file = (event.target as HTMLInputElement).files[0];
      this.formVar.patchValue({
        narration_url1: file
      });
      this.formVar.get('narration_url1').updateValueAndValidity()
  
      this.audSrc1 = URL.createObjectURL(event.target.files[0]);
      console.log(this.audSrc1);
      this.figAudio1.nativeElement.src = this.audSrc1;
    }else{
      this.audSrc1 = '';
      this.figAudio1.nativeElement.src = '';
    }
  }

   audFileSelected2(event: any) {
    if (event.target.files && event.target.files[0]) {
      const file = (event.target as HTMLInputElement).files[0];
      this.formVar.patchValue({
        narration_url2: file
      });
      this.formVar.get('narration_url2').updateValueAndValidity()
  
      this.audSrc2 = URL.createObjectURL(event.target.files[0]);
      console.log(this.audSrc2);
      this.figAudio2.nativeElement.src = this.audSrc2;
    }else{
      this.audSrc2 = '';
      this.figAudio2.nativeElement.src = '';
    }
  }

  showQuestion(formVar){
    //console.log('formVar', formVar);
    this.loading = true;
    var categoriesIds = [];
    if(formVar.question_type == "category"){
      this.fileData = new Array<File>();
    }

    if(formVar.question_type == "category" && formVar.categories.length > 0){
      for (let i = 0; i < formVar.categories.length; i++) {
        var id = formVar.categories[i].id;
        categoriesIds.push(id);
      }
      //console.log('categoriesIds', categoriesIds);
      this.leagueService.getCategoryQuestion(categoriesIds).subscribe(categories => { 
        this.fileData = categories;
        //console.log('categories', categories);
        //$('#foo').removeAttr('disabled').trigger('click');
        });
    }
    //this.loading = false;

  }

  /* selectFiles(event) {
    this.progressInfos = [];
    this.selectedFiles = event.target.files;
    console.log(event.target.files);
    //this.uploadFiles();
  } */
  /* selectFiles(event) {
    console.log('an', this.myFiles.length);
    if(this.myFiles.length > 4){
      Swal.fire('','You can select only 5 files.','error');
      return;
      }else{
      for (var i = 0; i < event.target.files.length; i++) { 
          this.myFiles.push(event.target.files[i]);
      }
    }
  }
  uploadFiles() {
    this.message = '';
    this.loading = true;
    console.log(this.myFiles);
    this.fileArr = [];
    for (let i = 0; i < this.myFiles.length; i++) {
      this.submitFile(i, this.myFiles[i]);
    }
  }
  submitFile(idx, file) {
    this.progressInfos[idx] = { value: 0, fileName: file.name };
  
    this.leagueService.uploadFile(file).subscribe(
      event => {
        if (event.type === HttpEventType.UploadProgress) {
          this.progressInfos[idx].value = Math.round(100 * event.loaded / event.total);
        } else if (event instanceof HttpResponse) {
          //this.fileInfos = this.leagueService.getFiles();
          console.log('events', event.body.filesArray);
          this.fileArr.push(event.body.filesArray);
          this.loading = false;
        }
      },
      err => {
        this.progressInfos[idx].value = 0;
        this.message = 'Could not upload the file:' + file.name;
        this.loading = false;
      });
  } */
  
  public get currentGroup(): FormGroup {
      return this.getGroupAt(this.currentStep);
  }
  questionChange(event) {
    this.questionType = event.target.value;
  }

  onItemSelect(item: any) { 
    //this.selectedItems.push(item);
    console.log(item);
    //console.log(this.selectedItems);
  }
  onSelectAll(items: any) {
    console.log(items);
  }

  upload() {
      this.showLoader();
      this.loading = true;
        //debugger;
        //console.log('fileChange');
        //console.log(this.uploadedFiles);
        //console.log('End fileChange');
        let formData = new FormData();
        for (var i = 0; i < this.uploadedFiles.length; i++) {
          formData.append("uploads[]", this.uploadedFiles[i], this.uploadedFiles[i].name);
        }
        //const url = 'http://localhost:3000/api/upload';
        this.http.post(apiUrl+'league/api/upload', formData)
          .subscribe((response) => {
            this.isProcessed=true;
            if (response["error_code"] == 2) {
              this.isError = true;
              this.errorData = response["data"];
              this.uploadedFiles = new Array<File>();
              //this.formVar.reset();
              this.formVar.controls['excelFile'].reset();
              this.formVar.controls['zipFile'].reset();
            }
            else if (response["error_code"] == 0) {
              //this.errorData = response["data"];
              this.fileData = response["data"];
              //console.log(this.fileData);

              this.isError=false;
              this.isProcessed=true;
            }else if (response["error_code"] == 1) {
              this.isError = false;
              this.isProcessed=false;
              this.errorData = response["data"];
              this.errorCode = response["error_code"];
              this.errorDesc = response["err_desc"];

              this.formVar.controls['excelFile'].reset();
              this.formVar.controls['zipFile'].reset();
            }
            this.hideLoader();
            this.loading = false;
            console.log('response receved is ', response);
        },
        (error) => {    //Error callback
          console.error('error caught in component')
          //this.errorMessage = error;
          //this.loading = false;
          this.hideLoader();
          this.loading = false;
          //console.log(error);
          Swal.fire('',error.message,'error');
          //throw error;   //You can also throw the error to a global error handler
        });
  }
  /* onFileChange(event) {
    for (var i = 0; i < event.target.files.length; i++) { 
      this.myFiles.push(event.target.files[i]);
    }
  } */

  /* submitFile(){
    this.loading = true;
    const formData = new FormData();
 
    for (var i = 0; i < this.myFiles.length; i++) { 
      formData.append("file[]", this.myFiles[i]);
    }
  
    this.http.post(apiUrl+'league/uploadLeagueImages', formData)
      .subscribe(res => {
        this.loading = false;
        console.log(res);
        alert('Uploaded Successfully.');
      },
      (error) => {    //Error callback
        console.error('error caught in upload function component')
        this.loading = false;
        console.log(error);
        Swal.fire('',error.message,'error');
      }
      )
  } */

  public onSubmit(): void {
    this.sumbitted = true;
    console.log('submit');
    if (!this.formVar.valid) {
      //this.formVar.markAllAsTouched();
      //this.stepper.validateSteps();
    }
    //console.log('Submitted data', this.formVar.value);
    this.formVar.value.status = 0;
    this.formVar.value.created_by = this.created_by;
    console.log(this.formVar.value);
    console.log('submit', this.fileArr.locationArray);
    this.leagueService.addLeague(this.formVar.value, this.fileData, this.fileArr.locationArray)
        .subscribe((event: HttpEvent<any>) => { console.log('event.type '+event.type);
        switch (event.type) {
            case HttpEventType.Sent:
                console.log('Request has been made!');
                break;
            case HttpEventType.ResponseHeader:
                console.log('Response header has been received!');
                break;
            case HttpEventType.UploadProgress:
                this.percentDone = Math.round(event.loaded / event.total * 100);
                console.log(`Uploaded! ${this.percentDone}%`);
                break;
            case HttpEventType.Response:
                console.log('event.body.message '+ event.body.message);
              //console.log('User successfully created!', event.body);
              if (event.body.message == 'Record inserted') {
                this.alertService.pop('success', 'League added successfully!');
                this.router.navigate(['/league']);
              }else{
                this.alertService.pop('error', event.body.message);
              }
              this.percentDone = false;
              
        }
    })
  }

  private getGroupAt(index: number): FormGroup {
      const groups = Object.keys(this.formVar.controls).map(groupName =>
          this.formVar.get(groupName)
          ) as FormGroup[];

      return groups[index];
  }

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

	// Image Preview
	uploadCompetitionLogo(event) {
    let fileIn = event.target.files[0]; // <--- File Object for future use.
    this.formVar.controls['imageInput'].setValue(fileIn ? fileIn.name : ''); // <-- Set Value for Validation

	    const file = (event.target as HTMLInputElement).files[0];

      this.imageChangedEvent = event;
      this.showCropModal = true;
      this.image_type = 'logo';
      console.log('app_logoFile', file);
	    // this.formVar.patchValue({
	    //   logo: file
	    // });
	    // this.formVar.get('logo').updateValueAndValidity()

	    // // File Preview
	    // const reader = new FileReader();
	    // reader.onload = () => {
	    //   this.preview = reader.result as string;
	    // }
	    // reader.readAsDataURL(file)
  }
  // Image Preview CompanyLogo
	uploadCompanyLogo(event) {
    const file = (event.target as HTMLInputElement).files[0];
    this.imageChangedEvent = event;
    this.showCropModal = true;
    this.image_type = 'companyLogo';
    console.log('company_logoFile', file);
    //console.log('this.imageChangedEvent', this.imageChangedEvent);
    // this.formVar.patchValue({
    //   companyLogo: file
    // });
    // this.formVar.get('companyLogo').updateValueAndValidity()

    // // File Preview
    // const reader = new FileReader();
    // reader.onload = () => {
    //   this.previewCompanyLogo = reader.result as string;
    // }
    // reader.readAsDataURL(file)
  }

  // Image Preview
	dataURItoBlob(dataURI) {
    var binary = atob(dataURI.split(',')[1]);
    var array = [];
    for (var i = 0; i < binary.length; i++) {
       array.push(binary.charCodeAt(i));
    }
    return new Blob([new Uint8Array(array)], {
        type: 'image/jpg'
    });
  }

  imageCropped(event: ImageCroppedEvent, image_type) {
    // this.croppedImage = event.base64;
     console.log('image_type', image_type);
    // console.log(event);
    if(image_type == 'logo'){
      const base64 = event.base64;
      const imageName = 'logo.png';
      const imageBlob = this.dataURItoBlob(base64);
      const imageFile = new File([imageBlob], imageName, { type: 'image/png' });

      this.formVar.patchValue({
        logo: imageFile
      });
      this.formVar.get('logo').updateValueAndValidity()
      // File Preview
      this.preview = event.base64;
    }else if(image_type == 'companyLogo'){
      const base64 = event.base64;
      const imageName = 'companyLogo.png';
      const imageBlob = this.dataURItoBlob(base64);
      const imageFile = new File([imageBlob], imageName, { type: 'image/png' });

      this.formVar.patchValue({
        companyLogo: imageFile
      });
      this.formVar.get('companyLogo').updateValueAndValidity()
      // File Preview
      this.previewCompanyLogo = event.base64;
    }
  }
  imageLoaded() {
    /* show cropper */
    //this.showCropper = true;
    console.log('Image loaded');
  }
  cropperReady() {
      /* cropper ready */
      console.log('cropper Ready');
  }
  loadImageFailed() {
      /* show message */
      Swal.fire('','Please upload image only','error');
  }

  closePopup(){
    this.showCropModal = false;
  }
	
	setFormPreview(formValue){

    /* if(this.advFile && (Object.keys(this.advFile).length === 0)){
      Swal.fire('','You have to upload file.','error'); 
      $('#reviewButton').closest(".form-group").addClass("has-error");
      this.loading = false;
      return;
    } */
    this.formData = formValue;

    var dateStringISO = new Date(this.formData.startDateTime).toLocaleString('en-IN', {timeZone: "Asia/Kolkata"})
    /* let startDateObject = new Date(this.formData.startDateTime);
    console.log(typeof startDateObject)

    var ddd = startDateObject.getDate();
    var mmm = startDateObject.getMonth(); 
    var yyyyy = startDateObject.getFullYear();
    var hh = competition.slot_time.split(':')[0];
    var min = competition.slot_time.split(':')[1]; */

    this.dateString = dateStringISO.split(',')[0];
    this.timeString = dateStringISO.split(',')[1];
    //console.log('before ', this.timeString);
    //console.log(this.formData.startDateTime);
    // let date = new Date(dateStringISO);
    // let hours = date.getHours();
    // let minutes = date.getMinutes();
    // this.timeString = hours+':'+minutes+':00';
    console.log(this.dateString);
    console.log('after ', this.timeString);

    //this.showWaiting_time = '00:'+formValue.minute_time+':'+formValue.second_time;
    this.showNarration_time = '00:'+formValue.narration_minute_time+':'+formValue.narration_second_time;

    this.showWaiting_time = '00:'+formValue.minute_time+':00';

    $('#reviewStep').removeAttr('disabled').trigger('click');
	}
  onChange(event) {
	    this.selectedType = event.target.value;
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

  ngAfterViewInit(){

    /* var fileInput = document.getElementById('file-input');
      var lines = [];
      fileInput.addEventListener('change', function(event) {
        var input = event.target;
        var show =document.getElementById('show_file');
        //console.log('js', lines.length);
        if(lines.length < 5){
          for (var i = 0; i < input.files.length; i++) {
            //console.log(input.files[i].name);
            lines.push(input.files[i].name);
          }
          show.innerHTML = lines.join("\n <br/>");
        }
      }); */
    var self = this;
    $(document).ready(function () {
      // var today = new Date().toISOString().split('T')[0];
      // var todayTime = new Date().toISOString().split('T')[1];
      // var tt = todayTime.split('.')[0];
      // console.log(today);
      // console.log(todayTime);
      // console.log(tt);
      //document.getElementsByName("start_time")[0].setAttribute('min', today);
      //document.getElementById("start_date").setAttribute("min", today);
      //document.getElementById("end_date").setAttribute("min", today);
      //document.getElementById("start_time").setAttribute("min", tt);

      // var stratTime = document.getElementById("start_time").value;
      // if(stratTime <= tt)

		    var navListItems = $('div.setup-panel div a'),
		        allWells = $('.setup-content'),
		        allNextBtn = $('.nextBtn'),
		        allPrevBtn = $('.prevBtn');
		    allWells.hide();

		    navListItems.click(function (e) {
		        e.preventDefault();
		        var $target = $($(this).attr('href')),
		            $item = $(this);

		        if (!$item.hasClass('disabled')) {
		            navListItems.removeClass('btn-success').addClass('active');
		            $item.addClass('btn-success');
		            allWells.hide();
		            $target.show();
		            $target.find('input:eq(0)').focus();
		        }
		    });

		    allPrevBtn.click(function () {
          
		        var curStep = $(this).closest(".setup-content"),
		            curStepBtn = curStep.attr("id"),
		            prevStepWizard = $('div.setup-panel div a[href="#' + curStepBtn + '"]').parent().prev().children("a"),
		            curInputs = curStep.find("input[type='text'],input[type='url']"),
		            isValid = true;
		            //alert(curStepBtn);
		        $(".form-group").removeClass("has-error");
		        for (var i = 0; i < curInputs.length; i++) {
		            if (!curInputs[i].validity.valid) {
		                //isValid = false;
		                //$(curInputs[i]).closest(".form-group").addClass("has-error");
		            }
		        }

		        if (isValid) prevStepWizard.removeAttr('disabled').trigger('click');
		    });

		    allNextBtn.click(function () {
          self.loading = true;
		        var curStep = $(this).closest(".setup-content"),
		            curStepBtn = curStep.attr("id"),
		            nextStepWizard = $('div.setup-panel div a[href="#' + curStepBtn + '"]').parent().next().children("a"),
		            curInputs = curStep.find("input[type='text'],input[type='url'],input[type='file'],input[type='date'],input[type='time'],textarea,select"),
		            isValid = true;
            
            setTimeout(() => {
                //  console.log(self.fileData);
                
              //if (typeof self.fileData == 'undefined' && self.fileData != 0) {
              if(self.fileData && (Object.keys(self.fileData).length === 0)){
                Swal.fire('','You have to upload question data first.','error');
                
                isValid =false;
                $('.uploadButton').closest(".form-group").addClass("has-error");
                self.loading = false;
                return false;
              }
            

		        $(".form-group").removeClass("has-error");
		        for (var i = 0; i < curInputs.length; i++) {
		            if (!curInputs[i].validity.valid) {
		                isValid = false; //console.log(curInputs[i]);
		                $(curInputs[i]).closest(".form-group").addClass("has-error");
		            }
		        }
            //console.log('nextStepWizard', nextStepWizard);
            if (isValid) nextStepWizard.removeAttr('disabled').trigger('click');
            self.loading = false;
          }, 2000);
		    });

		    $('div.setup-panel div a.btn-success').trigger('click');
		});
  }
}
