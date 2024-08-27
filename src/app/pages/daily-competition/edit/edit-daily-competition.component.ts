import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient, HttpEvent, HttpEventType } from '@angular/common/http';
import { Router } from '@angular/router';
import { from } from 'rxjs';
import { DcService } from '../../../services/dc.service'
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { environment } from '../../../../environments/environment';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import { ToasterModule, ToasterService } from 'angular2-toaster';
import { AuthenticationService } from '../../../services';
import { formatDate, DatePipe } from '@angular/common';
//import { OwlDateTimeComponent } from '../../../../../projects/picker/src/public_api';
import { DateTimeAdapter } from 'ng-pick-datetime';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import $ from 'jquery';
interface Post {
  startDate: Date;
  endDate: Date;
  //startTime: Time;
  //endTime: Time;
}

@Component({
  selector: 'app-edit-daily-competition',
  templateUrl: './edit-daily-competition.component.html',
  styleUrls: ['./edit-daily-competition.component.scss']
})

export class EditDailyCompetitionComponent implements OnInit {
  s3_url = environment.s3_url;

  form: FormGroup;
  formVar: FormGroup;
  getCompetition: any = [];
  getQuestion: any = [];
  getNarration: any = [];
  setAudience: any = [];
  broadcasterData: any = [];
  oneToSixtyArray: any = [];
  showWaiting_time: string;
  showNarration_time: string;

  activeStepIndex: number;
  image_type: string = '';
  showCropper = false;
  //image cropping
  imageChangedEvent: any = '';
  croppedImage: any = '';

  editData: any = [];
  isEdit = false;
  idEdit = false;
  isSave = true;
  loading = false;
  submitted = false;
  isProcessed: boolean = false;
  public question_value: string = ``;
  selectedType: any = '';
  narrationType: any = '';
  notificationType: any = '';
  showModal: boolean;
  showCropModal: boolean;
  slot_9: boolean = true;
  slot_12: boolean = true;
  slot_3: boolean = true;
  slot_6: boolean = true;
  formData: any;
  public selectedItems = [];
  selectedAll: boolean = false;
  narrationOptions: string = 'url';
  audienceLogo: string;
  appLogo: string;
  companyLogo: string;
  notificationLogo: string;
  audSrc: string;
  audSrcPreview: string;
  dateString: string;
  timeString: string;
  percentDone: any = 0;
  showTargetAudience: boolean = true;
  countryData: any = [];
  nationalityData: any = [];

  logUser: any;
  created_by: number;
  preview: string;
  jstoday = '';

  post: Post = {
    startDate: new Date(Date.now()),
    endDate: new Date(Date.now()),
    //startTime: new Time(Time.now()),
    //endTime: new Time(Time.now())
  }
  min: Date;
  public invalidMoment = new Date().toISOString();
  //public min = new Date(2021, 1, 3, 10, 30);
  //public min = new Date().toISOString();
  public max = new Date(2021, 3, 21, 20, 30);

  private durationOptions: string[] = ["10", "15", "20", "25", "30", "35", "40"];
  private levelOptions: string[] = ["1", "2", "3", "4", "5"];
  private narrOption: string[] = ["url"];
  check_validation: boolean = false;
  constructor(private activatedRoute: ActivatedRoute, private fb: FormBuilder, private dcService: DcService, private alertService: ToasterService, private authenticationService: AuthenticationService, private datePipe: DatePipe, private router: Router, dateTimeAdapter: DateTimeAdapter<any>) {
    const currentDate = new Date();
    this.min = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
    //this.minDate = {year:currentDate.getFullYear(), month:currentDate.getMonth()+1, day: currentDate.getDate()};

    dateTimeAdapter.setLocale('en-IN'); // change locale to Europe/London
    this.formVar = this.fb.group({
      logo: [null],
      competitionName: [''],
      description: [''],
      excelFile: [null],
      zipFile: [null],
      //startTime:[formatTime(this.post.startTime, 'HH:ss', 'en')],
      //endTime: [formatTime(this.post.endTime, 'HH;ss', 'en')],
      startTime: [''],
      endTime: ['00:00'],
      startDate: [formatDate(this.post.startDate, 'yyyy-MM-dd', 'en')],
      endDate: [formatDate(this.post.endDate, 'yyyy-MM-dd', 'en')],
      promotion_type: [''],
      instragramUrl: [''],
      twitterUrl: [''],
      snapchatUrl: [''],
      facebookUrl: [''],
      app_logo: [''],
      app_name: [''],
      apple_store_url: [''],
      google_play_url: [''],
      affiliate_url: [''],
      narration_type: [''],
      narration_url: [''],
      narration_text: [''],
      narration_time: ['00:00'],
      company_logo: [''],
      company_name: [''],
      company_link: [''],
      company_about: [''],
      live_stream_url: [''],
      gender: [''],
      state: [''],
      area_locality: [''],
      age_range: [''],
      nationality: [''],
      city: [''],
      country: [''],
      push_notification: [''],
      audience_description: [''],
      title: [''],
      image_upload: [''],
      slot_time: [''],
      competition_type: ['daily'],
      imageInput: [],
      waiting_time: ['00:05'],
      startDateTime: [''],
      broadcaster: [''],
      bypass_audience: ['no'],
      minute_time: [''],
      second_time: [''],
      narration_minute_time: [''],
      narration_second_time: [''],
      notification_type: [''],
      notification_text: [''],
      notification_logo: [''],
      apple_schema: ['']

    })

    this.form = this.fb.group({
      question: [''],
      option1: ['', Validators.required],
      option2: ['', Validators.required],
      option3: ['', Validators.required],
      option4: ['', Validators.required],
      answer: [''],
      note: [''],
      level: ['', [Validators.required, Validators.pattern("^[0-9]*$")]],
      duration: ['', [Validators.required, Validators.pattern("^[0-9]*$")]],
      delArray: this.fb.array([])
    });
  }

  @ViewChild('figAudio', { static: false }) figAudio: ElementRef; // audio tag reference

  ngOnInit() {
    this.formData = {};
    this.jstoday = new Date().toISOString();

    const id = this.activatedRoute.snapshot.paramMap.get('id');
    this.getBroadcaster();
    this.getCountry();
    this.getSeconds();
    this.getDailyCompetition(id);

    this.logUser = this.authenticationService.currentUserValue;
    this.logUser = JSON.parse(this.logUser);
    this.created_by = this.logUser['user'][0]['id'];
  }

  get f() { return this.formVar.controls; }
  get ff() { return this.form.controls; }

  private getSeconds() {
    for (var value = 0; value < 60; value++) {
      var values;
      if (value.toString().length < 2) {
        values = "0" + value
      } else {
        values = value
      }

      this.oneToSixtyArray.push(values);
    }
  }

  getDailyCompetition(id) {
    //console.log(id);

    this.dcService.editCompetition(id).subscribe(competition => {
      //  console.log(competition.data)
      this.getCompetition = competition.data[0].competition[0];
      this.getQuestion = competition.data[1].question;
      this.getNarration = competition.data[2].narration[0];
      this.setAudience = competition.data[3].setAudience[0];
      //console.log('time ', this.getCompetition.start_time)

      if (this.getCompetition.league_date < this.jstoday) {
        this.alertService.pop('error', 'Daily Competiton has completed, you can not edit!');
        this.router.navigate(['/daily']);
      }


      this.preview = this.s3_url + this.getCompetition.logo;
      this.appLogo = this.s3_url + this.getCompetition.app_logo;
      this.audienceLogo = this.s3_url + this.setAudience.image_upload;
      this.companyLogo = this.s3_url + this.getNarration.company_logo;
      this.audSrcPreview = this.s3_url + this.getNarration.narration_url;
      this.notificationLogo = this.s3_url + this.getCompetition.notification_logo;
      //console.log('this.getNarration.narration_text', this.getNarration.narration_text)
      if (this.getNarration.narration_text == '') {
        this.narrationOptions = 'url';
      } else {
        this.narrationOptions = 'text';
      }

      // var dateObj = new Date(this.getCompetition.start_date + ' ' + this.getCompetition.start_time);
      // console.log(dateObj);
      this.selectedType = this.getCompetition.promotion_type;
      this.narrationType = this.getCompetition.narration_type;
      this.notificationType = this.getCompetition.notification_type;
      //console.log(this.getCompetition.notification_type);
      var set_audience = 'no';
      if (this.getCompetition.set_audience == true) {
        set_audience = 'no';
        this.showTargetAudience = true;
      } else {
        set_audience = 'yes';
        this.showTargetAudience = false;
      }

      //split time here
      var arr = this.getCompetition.waiting_time.split(':');
      var hour = parseInt(arr[0]);
      var min = arr[1];
      var sec = arr[2];
      console.log(this.getCompetition.start_date);

      let realDateObject = new Date(this.getCompetition.start_date);
      console.log(typeof realDateObject)
      var dd = realDateObject.getDate();
      var mm = realDateObject.getMonth();
      var yyyy = realDateObject.getFullYear();
      var start_date = new Date(yyyy, mm, dd);
      this.formVar.patchValue({
        logo: [null],
        competitionName: this.getCompetition.compitition_name,
        description: this.getCompetition.description,
        startTime: this.getCompetition.start_time,
        endTime: this.getCompetition.end_time,
        startDate: start_date, //this.datePipe.transform(this.getCompetition.start_date,"yyyy/MM/dd"),
        endDate: this.datePipe.transform(this.getCompetition.end_date, "yyyy-MM-dd"),
        promotion_type: this.getCompetition.promotion_type,
        instragramUrl: this.getCompetition.instagram_url,
        twitterUrl: this.getCompetition.twitter_url,
        snapchatUrl: this.getCompetition.snapchat_url,
        facebookUrl: this.getCompetition.facebook_url,
        app_logo: this.getCompetition.app_logo,
        app_name: this.getCompetition.app_name,
        apple_store_url: this.getCompetition.apple_store_url,
        google_play_url: this.getCompetition.google_play_url,
        affiliate_url: this.getCompetition.affiliate_url,
        narration_type: this.getCompetition.narration_type,
        narration_url: this.getNarration.narration_url,
        narration_text: this.getNarration.narration_text,
        narration_time: this.getNarration.narration_time,
        narration_second_time: this.getNarration.narration_time.split(':')[2],
        company_logo: this.getNarration.company_logo,
        company_name: this.getNarration.company_name,
        company_link: this.getNarration.company_link,
        company_about: this.getNarration.company_about,
        live_stream_url: this.getNarration.live_stream_url,
        gender: this.setAudience.gender,
        state: this.setAudience.state,
        area_locality: this.setAudience.area_locality,
        age_range: this.setAudience.age_range,
        nationality: this.setAudience.nationality,
        city: this.setAudience.city,
        country: this.setAudience.country,
        push_notification: this.setAudience.push_notification,
        audience_description: this.setAudience.audience_description,
        title: this.setAudience.title,
        image_upload: this.setAudience.image_upload,
        slot_time: this.getCompetition.slot_time,
        //competition_type:['daily'],
        imageInput: [''],
        waiting_time: this.getCompetition.waiting_time,
        minute_time: min,
        second_time: sec,
        startDateTime: this.getCompetition.league_date,
        broadcaster: this.getCompetition.broadcaster_id,
        bypass_audience: set_audience,
        notification_type: this.getCompetition.notification_type,
        notification_text: this.getCompetition.notification_text,
        apple_schema: this.getCompetition.apple_schema,
      });
    });


  }
  editItem(event) {
    this.editData = event;
    this.isEdit = true;
    this.isSave = false;
    this.idEdit = this.editData.id;
    document.getElementById('buttonHide')
      .style.display = 'none';
    //this.question_value=this.editData.question;

    //console.log('---------------->>');
    //console.log(this.question_value);

    //const domEditableElement = document.querySelector('.ck-editor__editable');
    //const editorInstance = domEditableElement.ckeditorInstance;
    //editorInstance.setData(this.editData.question );

    //console.log('<<----------------');

    this.form.patchValue({
      question: this.editData.question_name,
      option1: this.editData.option1,
      option2: this.editData.option2,
      option3: this.editData.option3,
      option4: this.editData.option4,
      answer: this.editData.answer,
      class: this.editData.class,
      note: this.editData.note,
      level: this.editData.level,
      duration: this.editData.duration
    });

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
  getBroadcaster() {
    this.dcService.getBroadcaster().subscribe(broadcaster => {
      this.broadcasterData = broadcaster.data;
      //console.log('broadcaster '+JSON.stringify(broadcaster));
    })
  }
  goBack() {
    this.isEdit = false;
    this.isSave = true;
    document.getElementById('buttonHide').style.display = 'block';
  }
  onClick(event) {
    this.showModal = true; // Show-Hide Modal Check
  }
  hide() {
    this.showModal = false;
  }
  setFormPreview(formValue) {
    this.formData = formValue;

    //var date_timeUTC = new Date(this.formData.startDateTime).toISOString();
    //this.dateString = date_timeUTC.split(' ').slice(0, 4).join(' ');
    //this.timeString = date_timeUTC.split(' ').slice(4, 5).join(' ');

    //var dateStringISO = new Date(this.formData.startDateTime).toLocaleString('en-IN', {timeZone: "Asia/Kolkata"})
    //this.dateString = dateStringISO.split(',')[0];
    //this.timeString = dateStringISO.split(',')[1];

    //console.log(this.dateString);
    //console.log(this.timeString);
    this.showNarration_time = '00:00:' + formValue.narration_second_time;
  }
  onChange(event) {
    this.selectedType = event.target.value;
    console.log(this.selectedType)
    if (this.selectedType == '1') {
      this.check_validation = true;
    } else {
      this.check_validation = false;
    }
  }

  checkValid() {
    if (this.formVar.value.instragramUrl != '' || this.formVar.value.twitterUrl != '' || this.formVar.value.snapchatUrl != '' || this.formVar.value.facebookUrl != '') {
      return false;
    } else {
      return true;
    }
  }



  validateUrl(value) {
    return /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:[/?#]\S*)?$/i.test(value);
  }

  narrationonChange(event) {
    this.narrationType = event.target.value;
  }
  narrationOption(event) {
    this.narrationOptions = event.target.value;
  }
  notificationonChange(event) {
    this.notificationType = event.target.value;
  }
  changeBypassAudience(event) {
    //console.log(event.target.value);
    var isSetAudience = event.target.value;
    if (isSetAudience == 'yes') {
      this.showTargetAudience = false;
    } else {
      this.showTargetAudience = true;
    }
  }
  getCountry() {
    this.dcService.getCountry().subscribe(broadcaster => {
      this.countryData = broadcaster.data;
      //console.log('broadcaster '+JSON.stringify(broadcaster));
    });
    this.dcService.getNationality().subscribe(national => {
      this.nationalityData = national.data;
      //console.log('nationalityData '+JSON.stringify(this.nationalityData));
    });

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
    if (image_type == 'logo') {
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
    } else if (image_type == 'image_upload') {
      const base64 = event.base64;
      const imageName = 'image_upload.png';
      const imageBlob = this.dataURItoBlob(base64);
      const imageFile = new File([imageBlob], imageName, { type: 'image/png' });

      this.formVar.patchValue({
        image_upload: imageFile
      });
      this.formVar.get('image_upload').updateValueAndValidity()
      // File Preview
      this.audienceLogo = event.base64;
    } else if (image_type == 'app_logo') {
      const base64 = event.base64;
      const imageName = 'app_logo.png';
      const imageBlob = this.dataURItoBlob(base64);
      const imageFile = new File([imageBlob], imageName, { type: 'image/png' });

      this.formVar.patchValue({
        app_logo: imageFile
      });
      this.formVar.get('app_logo').updateValueAndValidity()
      // File Preview
      this.appLogo = event.base64;
    } else if (image_type == 'company_logo') {
      const base64 = event.base64;
      const imageName = 'company_logo.png';
      const imageBlob = this.dataURItoBlob(base64);
      const imageFile = new File([imageBlob], imageName, { type: 'image/png' });

      this.formVar.patchValue({
        company_logo: imageFile
      });
      this.formVar.get('company_logo').updateValueAndValidity()
      // File Preview
      this.companyLogo = event.base64;
    } else if (image_type == 'notification_logo') {
      const base64 = event.base64;
      const imageName = 'notification_logo.png';
      const imageBlob = this.dataURItoBlob(base64);
      const imageFile = new File([imageBlob], imageName, { type: 'image/png' });

      this.formVar.patchValue({
        notification_logo: imageFile
      });
      this.formVar.get('notification_logo').updateValueAndValidity()
      // File Preview
      this.notificationLogo = event.base64;
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
    Swal.fire('', 'Please upload image only', 'error');
  }

  closePopup() {
    this.showCropModal = false;
  }

  // Image Preview
  uploadCompetitionLogo(event) {
    this.imageChangedEvent = '';
    let fileIn = event.target.files[0]; // <--- File Object for future use.
    this.formVar.controls['imageInput'].setValue(fileIn ? fileIn.name : ''); // <-- Set Value for Validation
    this.imageChangedEvent = event;
    this.showCropModal = true;
    this.image_type = 'logo';
    const file = (event.target as HTMLInputElement).files[0];
    console.log('file', file);
    console.log('this.imageChangedEvent', this.imageChangedEvent)
  }


  uploadAudienceLogo(event) {
    const file = (event.target as HTMLInputElement).files[0];
    this.imageChangedEvent = event;
    this.showCropModal = true;
    this.image_type = 'image_upload';
    // this.formVar.patchValue({
    //   image_upload: file
    // });
    // this.formVar.get('image_upload').updateValueAndValidity()

    // // File Preview
    // const reader = new FileReader();
    // reader.onload = () => {
    //   this.audienceLogo = reader.result as string;
    // }
    // reader.readAsDataURL(file)
  }

  uploadAppLogo(event) {
    this.imageChangedEvent = '';
    const file = (event.target as HTMLInputElement).files[0];
    this.imageChangedEvent = event;
    this.showCropModal = true;
    this.image_type = 'app_logo';
    console.log('app_logofile', file);
    console.log('this.imageChangedEvent', this.imageChangedEvent);
  }
  uploadCompanyLogo(event) {
    const file = (event.target as HTMLInputElement).files[0];
    this.imageChangedEvent = event;
    this.showCropModal = true;
    this.image_type = 'company_logo';
  }
  uploadNotificationLogo(event) {
    const file = (event.target as HTMLInputElement).files[0];
    this.imageChangedEvent = event;
    this.showCropModal = true;
    this.image_type = 'notification_logo';
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
    }
  }

  selectAll() {
    this.selectedAll = !this.selectedAll;
    this.selectedItems = [];
    for (var i = 0; i < this.getQuestion.length; i++) {
      this.getQuestion[i].selected = this.selectedAll;
      //console.log(this.selectedAll)
      if (this.selectedAll == true) {
        this.selectedItems.push(this.getQuestion[i].id);
      } else {
        this.selectedItems.splice(this.selectedItems.indexOf(this.getQuestion[i].id), 1);
      }

    }
    //console.log(this.selectedItems)
  }
  checkIfAllSelected(event, val) {
    if (event.target.checked) {
      this.selectedItems.push(val);
    }
    else {
      this.selectedItems.splice(this.selectedItems.indexOf(val), 1);
    }
    //console.log(this.selectedItems)
  }
  removeByAttr = function (arr, attr, value) {
    var i = arr.length;
    while (i--) {
      if (arr[i]
        && arr[i].hasOwnProperty(attr)
        && (arguments.length > 2 && arr[i][attr] === value)) {

        arr.splice(i, 1);

      }
    }
    return arr;
  }

  deleteOneItem(item_id) {
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
        self.dcService.deleteQuestion(item_id).subscribe(() => {
          console.log('deleted draft row');
          //self.getDraftQuestion();
          //self.getQuestion.splice(self.getQuestion.indexOf(item_id),1);
          this.removeByAttr(self.getQuestion, 'id', item_id);
        });

        if (self.getQuestion.length == 0) {
          this.isProcessed = false;
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
  deletItem() { //console.log('this.selectedItems '+this.selectedItems)
    if (this.selectedItems.length == 0) {
      Swal.fire('Oh', 'No item selected to delete :)', 'error');
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
          self.getQuestion.forEach(function (arrItem) {
            if (value == arrItem.id) {
              self.getQuestion.splice(self.getQuestion.indexOf(arrItem), 1);
              self.dcService.deleteQuestion(value).subscribe(() => {
                console.log('deleted draft row');
              });
            }
          });
        });

        if (self.getQuestion.length == 0) {
          this.isProcessed = false;
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
    //console.log('Submitted data', this.formVar.value);
    const competition_id = this.activatedRoute.snapshot.paramMap.get('id');
    this.dcService.updateCompetition(this.formVar.value, competition_id)

      .subscribe((event: HttpEvent<any>) => {
        console.log('event.type ' + event.type);
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
            console.log('event.body.message ' + event.body.message);
            //console.log('User successfully created!', event.body);
            if (event.body.message == 'Record inserted') {
              this.alertService.pop('success', 'Daily Competiton updated successfully!');
              this.router.navigate(['/daily']);
            } else {
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
    if (!this.form.value.answer) {
      Swal.fire('', 'Please select correct answer.', 'error');
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
    this.form.value.created_by = this.created_by;
    //this.questionArr.push(this.form.value);
    //console.log(this.form.value);
    //this.form.reset();
    this.loading = true;
    /////update in temp////
    this.form.value.id = this.idEdit;
    //console.log(this.form.value);
    console.log('---------->>>>>>>>')
    this.dcService.updateQuestionCompetition(this.form.value)
      .subscribe(
        data => {
          if (data['status'] == 200) {
            const competition_id = this.activatedRoute.snapshot.paramMap.get('id');
            //this.getDailyCompetition(competition_id);

            var getArr = data['data'][0];
            //console.log(data['data'][0]);
            this.getQuestion = this.getQuestion.map(u => u.id !== getArr.id ? u : getArr);
            //this.getQuestion = (arr1, arr2) => arr1 && arr1.map(obj => arr2 && arr2.find(p => p.id === obj.id) || obj);
            this.alertService.pop('success', 'Question successfully updated');
            //setTimeout(()=>this.router.navigate(['/study-exam']), 1000);
            this.idEdit = false;
            this.isEdit = false;
            this.isProcessed = true;
            this.isSave = true;
            document.getElementById('buttonHide').style.display = 'block';
          }
          else {
            this.alertService.pop('error', 'Something went wrong. Try again later.');
          }
          this.loading = false;
          this.submitted = false
        },
        error => {
          this.alertService.pop('error', 'Something went wrong. Try again later.');
          this.loading = false;
          this.submitted = false

        });
  }
  ngAfterViewInit() {
    $(document).ready(function () {
      var today = new Date().toISOString().split('T')[0];
      var todayTime = new Date().toISOString().split('T')[1];
      var tt = todayTime.split('.')[0];
      console.log(today);
      //console.log(todayTime);
      //console.log(tt);
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
        var curStep = $(this).closest(".setup-content"),
          curStepBtn = curStep.attr("id"),
          nextStepWizard = $('div.setup-panel div a[href="#' + curStepBtn + '"]').parent().next().children("a"),
          curInputs = curStep.find("input[type='text'],input[type='url'],input[type='file'],input[type='date'],input[type='time'],textarea,select"),
          isValid = true;
        //console.log('hello');
        $(".form-group").removeClass("has-error");
        for (var i = 0; i < curInputs.length; i++) {
          if (!curInputs[i].validity.valid) {
            isValid = false;
            $(curInputs[i]).closest(".form-group").addClass("has-error");
          }
        }
        console.log(isValid);
        if (isValid) nextStepWizard.removeAttr('disabled').trigger('click');
      });

      $('div.setup-panel div a.btn-success').trigger('click');
    });
  }
}
