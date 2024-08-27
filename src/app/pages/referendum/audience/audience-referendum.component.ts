import { Component, OnInit } from '@angular/core';
//import { CategoryService } from '../../../services/referendum.service';
import {ToasterModule, ToasterService} from 'angular2-toaster';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
//import {OrderBy} from "../../../pipes/orderBy"
import { ReferendumService } from '../../../services/referendum.service';

import { environment } from '../../../../environments/environment';
import { AuthenticationService } from '../../../services';
import { AlaamValidator } from '../../../utils/alaamValidator.util';
import {formatDate} from '@angular/common';

const apiUrl =environment.apiUrl;
const s3Url=environment.s3_url;

@Component({
  selector: 'app-referendum',
  templateUrl: './audience-referendum.component.html',
  styleUrls: ['./audience-referendum.component.scss']
})
export class AudienceReferendumComponent implements OnInit {

  private toasterService: ToasterService;
  
  formVar: FormGroup;
  title : boolean = true;
  details : boolean = false;
  set_audience : boolean = false;
  preview : string;
  private sumbitted = false;
  created_by:number;
  logUser:any;
  found: Array <any> = [];
  referendum_icon_str: string;
  surveyId: number = 0;
  todayDate: string;
  private shouldValidate = (): boolean => {
    return this.sumbitted === true;
  }

  constructor(private router: Router, private activeroute: ActivatedRoute, public fb: FormBuilder, private alertService: ToasterService, private referendumService: ReferendumService, private authenticationService:AuthenticationService) {
    this.formVar = this.fb.group({
      logo: [null],
      title: ['',Validators.required],
      description: ['',Validators.required],
      ref_time: ['',Validators.required],
      price_type: [''],
      ref_date: ['',Validators.compose([Validators.required, AlaamValidator.dateValidator])],
      ref_lottery_date: ['',Validators.compose([AlaamValidator.dateValidator])],
      price_number: ['',[Validators.pattern("^[1-9][0-9]*$")]],
      gender: ['',Validators.required],
      state: ['',Validators.required],
      area_locality: ['',Validators.required],
      age_range: ['',Validators.required],
      nationality: ['',Validators.required],
      city: ['',Validators.required],
      country: ['',Validators.required],
      push_notification: ['',Validators.required],
      is_public:['false',Validators.required],
      is_target:['true',Validators.required],
      referendum_icon_url:['']
    });
  }

  ngOnInit() {
    this.logUser    = this.authenticationService.currentUserValue;
    this.logUser    = JSON.parse(this.logUser);
    this.created_by = this.logUser['user'][0]['id']; 
    this.surveyId = this.activeroute.snapshot.params['id'];
    this.todayDate=formatDate(new Date(), 'yyyy-MM-dd', 'en');
    if(this.surveyId!=0){
      this.loadData();
    }
  }

  goBack=function(){
    this.router.navigate(['/referendum']);
  }

  setTitles(direction){
    this.title = true;
    this.details = false;
    this.set_audience = false;
  }

  setDetails(direction){
    if (direction=='next' && (this.f.title.invalid || this.f.description.invalid)) {
      return;
    }
    if(this.f.logo.value==null){
      this.alertService.pop("error", "Please upload a logo");
      return;
    }
    this.title = false;
    this.details = true;
    this.set_audience = false;
  }
  get f() { return this.formVar.controls; }

  setAudience(direction){
    debugger;
    if (direction=='next' && (this.f.ref_time.invalid || this.f.price_type.invalid  || this.f.ref_date.invalid  || this.f.ref_lottery_date.invalid  || this.f.price_number.invalid)) {
      return;
    }
    this.title = false;
    this.details = false;
    this.set_audience = true;
  }

  loadData=function(){
    var self=this;
    var xhr = new XMLHttpRequest();
    xhr.open("GET", apiUrl + "survay/getFullSurvey?surveyId=" + this.surveyId);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.onload = function() {
      var result = xhr.response ? JSON.parse(xhr.response) : {};
      var configuration = JSON.parse(result.configuration);
      debugger;
      self.formVar.patchValue({
        logo: [null],
        title: configuration.title,
        description: configuration.description,
        ref_time: configuration.ref_time,
        price_type: configuration.price_type,
        ref_date: configuration.ref_date,
        ref_lottery_date: configuration.ref_lottery_date,
        price_number: configuration.price_number,
        gender: configuration.gender,
        state: configuration.state,
        area_locality: configuration.area_locality,
        age_range: configuration.age_range,
        nationality: configuration.nationality,
        city: configuration.city,
        country: configuration.country,
        push_notification: configuration.push_notification,
        referendum_icon_url:configuration.referendum_icon_url,
        is_public: configuration.is_public || "false",
        is_target: configuration.is_target || "true"
      });
      self.preview=s3Url +configuration.referendum_icon_url;
    };
    xhr.send();
  }
    // Image Preview
  uploadRefLogo(event) {
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

  public onSubmit(): void {
    debugger;
        if (this.formVar.value["is_target"].value=="true" &&  this.formVar.invalid) {
          return;
        }
        this.sumbitted = true;
        console.log('submit');
        if (!this.formVar.valid) {
          //this.formVar.markAllAsTouched();
          //this.stepper.validateSteps();
        }
        console.log('Submitted data', this.formVar.value);
        var config = this.formVar.value;
        if(!Array.isArray(config.logo)){
          /* Add image start*/
          const formData = new FormData();
          formData.append('logo', this.formVar.value.logo);

          this.referendumService.saveReferendumInImage(formData).subscribe(
            (data) => { console.log(data)
            if(data['status']==200){
              this.referendum_icon_str = data['referendum_icon'];
              this.found = this.formVar.value;
              this.found['referendum_icon_url'] = this.referendum_icon_str;

              console.log(this.found);
              this.createSurvey(this.found );
            }
          },
          (err) => console.log(err)
          );
        }
        else{
          this.createSurvey(this.formVar.value);
        }
    /* End here */
    
  }

  createSurvey = function(formData) {
    var self = this;
    var name = formData.title;
    var config = JSON.stringify(formData);
    var xhr = new XMLHttpRequest();
    xhr.open(
      "GET",
      apiUrl + "survay/create?accessKey=" + this.accessKey + "&login_id=" + this.created_by+ "&name=" + name+ "&config=" + config + "&id="+this.surveyId + "&is_public="+formData.is_public
    );
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.onload = function() {
      var result = xhr.response ? JSON.parse(xhr.response) : null;
      console.log('result '+ JSON.stringify(result));
      //!!onCreate && onCreate(xhr.status == 200, result, xhr.response);
      self.router.navigate(['/referendum/create-survey/'+result.Name+'/'+result.Id]);
    };
    xhr.send();
  };

}