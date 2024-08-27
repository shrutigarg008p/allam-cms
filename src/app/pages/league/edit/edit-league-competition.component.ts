import { Component, OnInit , AfterViewInit, ViewChild, ElementRef} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient, HttpEvent, HttpEventType } from '@angular/common/http';
import { Router } from '@angular/router';
import { from } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { environment } from '../../../../environments/environment';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import {ToasterModule, ToasterService} from 'angular2-toaster';
import { AuthenticationService } from '../../../services';
import { LeagueService } from '../../../services/league.service';
import { HeaderService } from '../../../services/header.service';
import { formatDate, DatePipe } from '@angular/common';
import $ from 'jquery';
import { IDropdownSettings } from 'ng-multiselect-dropdown';

interface Post {
  startDate: Date;
  endDate: Date;
  //startTime: Time;
  //endTime: Time;
}

@Component({
  selector: 'app-edit-league-competition',
  templateUrl: './edit-league-competition.component.html',
  styleUrls: ['./edit-league-competition.component.scss']
})

export class EditLeagueCompetitionComponent implements OnInit {
  s3_url =environment.s3_url;

  @ViewChild('figAudio', {static: false}) figAudio: ElementRef; // audio tag reference
  @ViewChild('figAudio1', {static: false}) figAudio1: ElementRef; // audio tag reference

  form: FormGroup;
  formVar : FormGroup;
  getCompetition : any = [];
  getQuestion : any = [];
  getLeagueFile : any = [];
  setAudience : any = [];
  narrationOptions : string = 'file';

  editData:any=[];
  isEdit=false;
  idEdit=false;
  isSave = true;
  loading = false;
  submitted = false;
  questionShow : boolean = false;
  isProcessed: boolean = false;
  public question_value: string = ``;
  selectedType: any = '';
  narrationType:any = '';
  showModal :boolean;
  slot_9: boolean = true;
  slot_12: boolean = true;
  slot_3: boolean = true;
  slot_6: boolean = true;
  questionType :string;
  formData: any;
  public selectedItems = [];
  selectedAll: boolean = false;
  audienceLogo : string;
  appLogo : string;
  companyLogo: string;
  file_url: string;
  file_url1: string;
  audSrc:string;
  audSrc1:string;
  dateString:string;
  timeString:string;
  percentDone: any = 0;
  advFile : any = [];
  waitingTime : any;
  logUser:any;
  created_by:number;
  preview :string;

  dropdownList: any = [];
  dropdownSettings:IDropdownSettings = {};
  fileArr:any=[];
  fileData: any[];
  jstoday = '';

  oneToSixtyArray: any = [];

  post: Post = {
    startDate: new Date(Date.now()),
    endDate: new Date(Date.now()),
    //startTime: new Time(Time.now()),
    //endTime: new Time(Time.now())
  }

  private narrOption: string[] = ["file"];
  private durationOptions: string[] = ["10", "15", "20", "25", "30", "35", "40"];
  private levelOptions: string[] = ["1", "2", "3", "4", "5"];
  constructor(private activatedRoute: ActivatedRoute, private fb: FormBuilder, private leagueService: LeagueService, private headerService: HeaderService, private alertService: ToasterService,private authenticationService: AuthenticationService, private datePipe: DatePipe, private router:Router) {
    this.formVar = this.fb.group({
      logo: [null],
      competitionName: [''],
      description: [''],
      startTime:['00:00:00'],
      endTime: ['00:00:00'],
      waitingTime : ['00:00:00'],
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
      narration_time1:[''],
      narration_type:[''],
      narration_url:[''],
      narration_url1:['']
  }) 

    this.form = this.fb.group({
      question: [''],
      option1: ['',Validators.required],
      option2: ['',Validators.required],
      option3: ['',Validators.required],
      option4: ['',Validators.required],
      answer: [''],
      note: [''],
      level: ['',[Validators.required, Validators.pattern("^[0-9]*$")]],
      duration: ['',[Validators.required, Validators.pattern("^[0-9]*$")]],
      delArray: this.fb.array([])
    });
  }

  ngOnInit() {
    this.formData = {};
    this.jstoday = new Date().toISOString();
    const id = this.activatedRoute.snapshot.paramMap.get('id');
    
    this.logUser    = this.authenticationService.currentUserValue;
    this.logUser    = JSON.parse(this.logUser);
    this.created_by = this.logUser['user'][0]['id'];
    this.getAllCategory();
    this.getSeconds();
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

    this.getLeagueCompetition(id);
  }

  get f() { return this.formVar.controls; }
  get ff() { return this.form.controls; }

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
  private getDetailCategories(id) {
    this.leagueService.getByIdCategories(id).subscribe(categories => { 
      //console.log(categories[0]);
      this.selectedItems = JSON. parse(categories[0].categories);
    });
  }

  /* showQuestion(formVar){
    if(formVar.question_type == "category" && formVar.categories.length > 0){
      var categoriesIds = [];
      for (let i = 0; i < formVar.categories.length; i++) {
        var id = formVar.categories[i].id;
        categoriesIds.push(id);
      }
      console.log(categoriesIds);
      this.leagueService.getCategoryQuestion(categoriesIds).subscribe(categories => { 
        this.getQuestion = categories;
        console.log('categories', categories);
        });
    }
  } */
  showQuestion(formVar){
    //console.log('formVar', formVar);
    this.loading = true;
    var categoriesIds = [];
    if(formVar.question_type == "category"){
      this.getQuestion = new Array<File>();
    }
    
    if(formVar.question_type == "category" && formVar.categories.length > 0){
      for (let i = 0; i < formVar.categories.length; i++) {
        var id = formVar.categories[i].id;
        categoriesIds.push(id);
      }
      //console.log('categoriesIds', categoriesIds);
      this.leagueService.getCategoryQuestion(categoriesIds).subscribe(categories => { 
        this.getQuestion = categories;
        //console.log('categories', categories);
        $('#foo').removeAttr('disabled').trigger('click');
        });
    }
    //this.loading = false;
  }
  public getFileStatus(getStatus:any):void { console.log(getStatus)
    this.loading = getStatus;
  }
  getLeagueCompetition(id){
    //console.log(id);
    this.leagueService.editCompetition(id).subscribe(competition => { 
        console.log(competition.data)
      this.getCompetition = competition.data[0].competition[0];

      if(this.getCompetition.league_date < this.jstoday) {
        this.alertService.pop('error', 'League Competiton has completed, you can not edit!');
        this.router.navigate(['/league']);
      }

      if(this.getCompetition.question_type == 'bulk'){
        this.getQuestion = competition.data[1].question;
        this.questionShow = true; 
      }else{
        this.questionShow = false;
        this.getDetailCategories(id);
      }
      
      this.getLeagueFile = competition.data[2].leagueFile[0];

      var fileArray = competition.data[2].leagueFile;
      if(fileArray && (Object.keys(fileArray).length > 0)){
        for (let index = 0; index < fileArray.length; index++) {
          this.advFile.push(fileArray[index]);
        }
      }
      this.preview = this.s3_url+this.getCompetition.logo;
      //this.appLogo = this.s3_url+this.getCompetition.app_logo;
      //this.audienceLogo = this.s3_url+this.setAudience.image_upload;
      this.companyLogo = this.s3_url+this.getCompetition.company_logo;
      this.file_url = this.s3_url+this.getLeagueFile.file_url;
      this.file_url1 = this.s3_url+this.getLeagueFile.file_url1;

      this.selectedType = this.getCompetition.promotion_type;
      this.questionType = this.getCompetition.question_type;
      //this.narrationType = this.getNarration.narration_type;
      console.log(this.getCompetition.compitition_name);
      //console.log(this.getLeagueFile.narration_text);
      //split time here
      var arr = this.getCompetition.waiting_time.split(':');
      var hour = parseInt(arr[0]) ;
      var min = arr[1] ;
      var sec = arr[2] ;

      var file_time_arr = this.getLeagueFile.file_time.split(':');
      var narration_time = file_time_arr[2] ;
      console.log(narration_time);
      var file_time_arr1 = this.getLeagueFile.file_time1.split(':');
      var narration_time1 = file_time_arr1[2] ;


      this.formVar.patchValue({
        logo: [null],
        competitionName: this.getCompetition.compitition_name,
        description: this.getCompetition.description,
        //startTime: this.getCompetition.start_time,
        endTime: this.getCompetition.end_time,
        //waitingTime : this.getCompetition.waiting_time,
        //startDate: this.datePipe.transform(this.getCompetition.start_date,"yyyy-MM-dd"),
        endDate: this.datePipe.transform(this.getCompetition.end_date,"yyyy-MM-dd"),
        companyName: this.getCompetition.company_name,
        companyLogo: [null],
        companyUrl: this.getCompetition.company_url,
        companyDescription: this.getCompetition.company_about,
        // excelFile: [null],
        // zipFile: [null],
        file: [null],
        question_type: this.getCompetition.question_type,
        categories: ['', Validators.required],
        imageInput: [''],
        startDateTime:  this.getCompetition.start_date_time,
        minute_time: min,
        second_time: sec,
        narration_text: this.getLeagueFile.narration_text,
        narration_time: narration_time,
        narration_text1: this.getLeagueFile.narration_text1,
        narration_time1:narration_time1,
      });
    });
  }
  editItem(event)
  {
    this.editData = event;
    this.isEdit   = true;
    this.isSave   = false;
    this.idEdit   = this.editData.id;
    document.getElementById('buttonHide') 
            .style.display = 'none'; 
    //this.question_value=this.editData.question;
    
    //console.log('---------------->>');
    //console.log(this.question_value);
    //console.log('<<----------------');

    this.form.patchValue({
        question: this.editData.question,
        option1: this.editData.option1,
        option2: this.editData.option2,
        option3: this.editData.option3,
        option4: this.editData.option4,
        answer: this.editData.answer,
        class: this.editData.class,
        note: this.editData.note,
        level:this.editData.level,
        duration:this.editData.duration
        });
  }
  goBack(){
    this.isEdit   = false;
    this.isSave   = true;
    document.getElementById('buttonHide').style.display = 'block';
  }
  onClick(event)
	{
	    this.showModal = true; // Show-Hide Modal Check
  }
  hide()
	{
	    this.showModal = false;
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
    this.dateString = dateStringISO.split(',')[0];
    this.timeString = dateStringISO.split(',')[1];

    this.waitingTime = '00:'+formValue.minute_time+':00';
    
    console.log(this.dateString);
    console.log(this.timeString);
    $('#reviewStep').removeAttr('disabled').trigger('click');
  }
  
  onChange(event) {
	    this.selectedType = event.target.value;
	}
	narrationonChange(event) {
	    this.narrationType = event.target.value;
  }
  // Image Preview
	uploadCompetitionLogo(event) {
    let fileIn = event.target.files[0]; // <--- File Object for future use.
    this.formVar.controls['imageInput'].setValue(fileIn ? fileIn.name : ''); // <-- Set Value for Validation

    const file = (event.target as HTMLInputElement).files[0];
    this.formVar.patchValue({
      logo: file
    });
    this.formVar.get('logo').updateValueAndValidity()

    // File Preview
    const reader = new FileReader();
    reader.onload = () => {
      this.preview = reader.result as string;
    }
    reader.readAsDataURL(file)
}
uploadAudienceLogo(event) {
    const file = (event.target as HTMLInputElement).files[0];
    this.formVar.patchValue({
      image_upload: file
    });
    this.formVar.get('image_upload').updateValueAndValidity()

    // File Preview
    const reader = new FileReader();
    reader.onload = () => {
      this.audienceLogo = reader.result as string;
    }
    reader.readAsDataURL(file)
}
uploadAppLogo(event) {
    const file = (event.target as HTMLInputElement).files[0];
    this.formVar.patchValue({
      app_logo: file
    });
    this.formVar.get('app_logo').updateValueAndValidity()

    // File Preview
    const reader = new FileReader();
    reader.onload = () => {
      this.appLogo = reader.result as string;
    }
    reader.readAsDataURL(file)
}
uploadCompanyLogo(event) {
    const file = (event.target as HTMLInputElement).files[0];
    this.formVar.patchValue({
      company_logo: file
    });
    this.formVar.get('company_logo').updateValueAndValidity()

    // File Preview
    const reader = new FileReader();
    reader.onload = () => {
      this.companyLogo = reader.result as string;
    }
    reader.readAsDataURL(file)
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

  selectAll() {
    this.selectedAll = !this.selectedAll;
    this.selectedItems = [];
    for (var i = 0; i < this.getQuestion.length; i++) {
        this.getQuestion[i].selected = this.selectedAll;
        //console.log(this.selectedAll)
        if(this.selectedAll == true){
          this.selectedItems.push(this.getQuestion[i].id);
        }else{
          this.selectedItems.splice(this.selectedItems.indexOf(this.getQuestion[i].id),1);
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
removeByAttr = function(arr, attr, value){
    var i = arr.length;
    while(i--){
       if( arr[i] 
           && arr[i].hasOwnProperty(attr) 
           && (arguments.length > 2 && arr[i][attr] === value ) ){ 

           arr.splice(i,1);

       }
    }
    return arr;
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
            //console.log(item_id);
            //console.log(self.getQuestion);
            //self.getQuestion.splice(self.getQuestion.indexOf(item_id),1);
            self.leagueService.deleteQuestion(item_id).subscribe(() => {  
              console.log('deleted draft row'); 
              //self.getDraftQuestion();
              //self.getQuestion.splice(self.getQuestion.indexOf(item_id),1);
              this.removeByAttr(self.getQuestion, 'id', item_id);
            });

            if(self.getQuestion.length==0){
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
                 self.getQuestion.forEach(function(arrItem){  
                    if (value == arrItem.id) { 
                        self.getQuestion.splice(self.getQuestion.indexOf(arrItem),1);
                        self.leagueService.deleteQuestion(value).subscribe(() => {  
                          console.log('deleted draft row'); 
                        });
                    } 
                 });
            });

          if(self.getQuestion.length==0){
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
  public onSubmit(): void {
    this.submitted = true;
    console.log('submit');
    if (!this.formVar.valid) {
      //this.formVar.markAllAsTouched();
      //this.stepper.validateSteps();
    }
    console.log('submit', this.fileArr.locationArray);
    //console.log('Submitted data', this.formVar.value);
    const competition_id = this.activatedRoute.snapshot.paramMap.get('id');
    this.leagueService.updateCompetition(this.formVar.value, competition_id, this.fileArr.locationArray)
        
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
                this.alertService.pop('success', 'League Competiton updated successfully!');
                this.router.navigate(['/league']);
              }else{
                this.alertService.pop('error', event.body.message);
             }
             this.percentDone = false;
              
        }
    })
}
  onUpdateTemp() {
    this.submitted = true;
    if (this.form.invalid) {
        return;
    }
    if(!this.form.value.answer){
      Swal.fire('','Please select correct answer.','error');
      return;
    }
    /* if(this.question_value=='' ){
      Swal.fire('','Please write question.','error');
      return;
    } */
    //this.gridview=true;
   
    //this.form.value.q_id=this.row_id;
    // this.row_id=this.row_id+1;
    //this.form.value.question=this.question_value;
    this.form.value.created_by=this.created_by; 
    //this.questionArr.push(this.form.value);
    //console.log(this.form.value);
    //this.form.reset();
    this.loading = true;
      /////update in temp////
      this.form.value.id=this.idEdit;
      //console.log(this.form.value);
      console.log('---------->>>>>>>>')  
      this.leagueService.updateQuestionCompetition(this.form.value)
        .subscribe(
            data => {
              if(data['status']==200){
                const competition_id = this.activatedRoute.snapshot.paramMap.get('id');
                  //this.getDailyCompetition(competition_id);
                  
                  var getArr = data['data'][0];
                  //console.log(data['data'][0]);
                  this.getQuestion = this.getQuestion.map(u => u.id !== getArr.id ? u : getArr);
                  //this.getQuestion = (arr1, arr2) => arr1 && arr1.map(obj => arr2 && arr2.find(p => p.id === obj.id) || obj);
                  this.alertService.pop('success', 'Question successfully updated');
                  //setTimeout(()=>this.router.navigate(['/study-exam']), 1000);
                  this.idEdit=false; 
                  this.isEdit=false;
                  this.isProcessed=true;
                  this.isSave=true;
                  document.getElementById('buttonHide').style.display = 'block'; 
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
  ngAfterViewInit(){
    var self = this;
    $(document).ready(function () {
      var today = new Date().toISOString().split('T')[0];
      var todayTime = new Date().toISOString().split('T')[1];
      var tt = todayTime.split('.')[0];
      console.log(today);
      console.log(todayTime);
      console.log(tt);
      //document.getElementsByName("start_time")[0].setAttribute('min', today);
      //document.getElementById("start_date").setAttribute("min", today);
      //document.getElementById("end_date").setAttribute("min", today);
      //document.getElementById("start_time").setAttribute("min", tt);

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

        allNextBtn.click(function () { //console.log('hi');
          self.loading = true;
		        var curStep = $(this).closest(".setup-content"),
		            curStepBtn = curStep.attr("id"),
		            nextStepWizard = $('div.setup-panel div a[href="#' + curStepBtn + '"]').parent().next().children("a"),
		            curInputs = curStep.find("input[type='text'],input[type='url'],input[type='file'],input[type='date'],input[type='time'],textarea,select"),
		            isValid = true;
                //console.log('hello');
            
                setTimeout(() => {
                  //  console.log(self.getQuestion);
                  
                //if (typeof self.getQuestion == 'undefined' && self.getQuestion != 0) {
                if(self.getQuestion && (Object.keys(self.getQuestion).length === 0)){
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
