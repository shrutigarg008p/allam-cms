import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { formatDate, DatePipe } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpEvent, HttpEventType } from '@angular/common/http';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { from } from 'rxjs';
import { LeaderboardService } from '../../services/leaderboard.service';
import { DcService } from '../../services/dc.service';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import {ToasterModule, ToasterService} from 'angular2-toaster';
import { environment } from '../../../environments/environment';
import * as _ from 'lodash';

/* interface FilterFormValue {
  sex: string;
  category: string;
  status: string;
} */
interface Post {
  startDate: Date;
  endDate: Date;
  //startTime: Time;
  //endTime: Time;
}

@Component({
  selector: 'app-user-notification',
  templateUrl: './user-notification.component.html',
  styleUrls: ['./user-notification.component.scss']
})
export class UserNotificationComponent implements OnInit {

  formVar: FormGroup;
  dailyList: any = [];
  filteredStudents: any = [];
  countryData : any = [];
  imageChangedEvent: any = '';
  image_type: string = '';
  showCropModal: boolean;

  //filterForm: FormGroup;
  // filter by value
  filters : any = { gender: "both", competitionType: "daily_competition", created_at: new Date()};
  audienceFilter :any= { gender: "both", competitionType: "daily_competition", created_at: new Date()};
  term: string;
  term1: string;
  term2: string;
  setOffset:string;
  competitionSelect : any = [];
  page = 1;
  count = 0;
  pageSize = 5;
  pageSizes = [5, 10, 25, 50, 100];

  public invalidMoment =  new Date().toISOString();
  //public min = new Date(2021, 1, 3, 10, 30);
  public min = new Date().toISOString();
  public max = new Date();
  public  now = new Date();
  public created_at =  new Date();
  post: Post = {
    startDate: new Date(Date.now()),
    endDate: new Date(Date.now()),
    //startTime: new Time(Time.now()),
    //endTime: new Time(Time.now())
  }
  private sumbitted = false;
  loading : boolean
  percentDone: any = 0;
  fileData: any[];
  notificationLogo: string;

  private competitionOption: any[] = [{"id":"daily_competition","title":"Challenge Race"}, {"id":"special_competition","title":"Special Competition"}, {"id":"league_competition","title":"League Competition"}];

  private actionOption: any[] = [{"id":"0","title":"Gender"}, {"id":"1","title":"Age"}, {"id":"2","title":"Country"}, {"id":"3", "title":"Rank"}];
  private actionValueOption: any[] = [{"id":"Both","title":"Both"}, {"id":"Male","title":"Male"}, {"id":"Female","title":"Female"}];

  constructor(public fb: FormBuilder, private router: Router, private activatedRoute: ActivatedRoute, private dataService: DcService, private leaderboardService: LeaderboardService, private alertService: ToasterService, private datePipe: DatePipe) { 
    // Reactive Form
    this.formVar = this.fb.group({
      notification_logo: [null],
      title: [''],
      description: [''],
      startDateTime: [''],
      // notification_time: ['00:00'],
      // notification_date: [formatDate(this.post.startDate, 'yyyy-MM-dd', 'en')],
      imageInput: [''],
      isPublish: [true]
    })
   }
  
  ngOnInit() {
    this.term1='';
    this.term2='0';
    this.term='';
  }

  get f() { return this.formVar.controls; }

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
    if (image_type == 'notification_logo') {
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
/*   uploadCompetitionLogo(event) {
    this.imageChangedEvent = '';
    let fileIn = event.target.files[0]; // <--- File Object for future use.
    this.formVar.controls['imageInput'].setValue(fileIn ? fileIn.name : ''); // <-- Set Value for Validation
    this.imageChangedEvent = event;
    this.showCropModal = true;
    this.image_type = 'notification_logo';
    const file = (event.target as HTMLInputElement).files[0];
    console.log('file', file);
    console.log('this.imageChangedEvent', this.imageChangedEvent)
  } */
  uploadNotificationLogo(event) {
    this.imageChangedEvent = '';
    let fileIn = event.target.files[0]; // <--- File Object for future use.
    this.formVar.controls['imageInput'].setValue(fileIn ? fileIn.name : ''); // <-- Set Value for Validation
    this.imageChangedEvent = event;
    this.showCropModal = true;
    this.image_type = 'notification_logo';
    const file = (event.target as HTMLInputElement).files[0];
    console.log('file', file);
    console.log('this.imageChangedEvent', this.imageChangedEvent)
  }

  public onSubmit(): void {
    this.sumbitted = true;
    this.loading = true;
    console.log('submit');
    if (!this.formVar.valid) {
      //this.formVar.markAllAsTouched();
      //this.stepper.validateSteps();
    }

    this.dataService.addGenericNotification(this.formVar.value)
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
              this.alertService.pop('success', 'Generic notification added successfully!');
              this.router.navigate(['/usernotification']);
            } else {
              this.alertService.pop('error', event.body.message);
            }
            this.percentDone = false;
            this.loading = false;

        }
      },
        err => {
          this.loading = false;
        })
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
    //this.getLeaderboard();
  }

  handlePageSizeChange(event): void {
    this.pageSize = event.target.value;
    this.page = 1;
    //this.getLeaderboard();
  }

}
