import { Component, OnInit } from '@angular/core';
import {ToasterModule, ToasterService} from 'angular2-toaster';
import { Router , ActivatedRoute} from '@angular/router';
import { environment } from '../../../environments/environment';
const apiUrl =environment.apiUrl;

@Component({
  selector: 'preview-referendum',
  templateUrl: './preview-referendum.component.html',
  styleUrls: ['./preview-referendum.component.scss']
})
export class PreviewReferendumComponent implements OnInit 
{
  private toasterService: ToasterService;
  availableSurveys : any = [];
  accessKey : string="";
  json :string = "{}";
  surveyId: number = 0;
  surveyName : string = "";
  userType : string = "";
  isApprove: boolean=false;
  constructor(private router: Router, private activeroute: ActivatedRoute, private alertService: ToasterService) 
  {}

  ngOnInit() {
    this.surveyId = this.activeroute.snapshot.params['id'];
    this.isApprove = (this.activeroute.snapshot.params['status'] =="true");
    this.userType=this.activeroute.snapshot.params['usertype'];
    this.getSurvey(this.surveyId);
    this.getSurveyName(this.surveyId);
  }
  goBack=function(id){
    this.router.navigate(['/admin-referendum']);
  }
  goAdvertiserBack=function(id){
    this.router.navigate(['/referendum']);
  }
  changeStatus=function(){
    var self=this;
    var xhr = new XMLHttpRequest();
    xhr.open("GET", apiUrl + "survay/changeSurveyStatus?accessKey=" + this.accessKey + "&id=" + this.surveyId);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.onload = function() {
      var result = xhr.response ? JSON.parse(xhr.response) : null;
      self.isApprove=!self.isApprove;
    };
    xhr.send();
  }
  getSurveyName(surveyId){
    var self=this;
    var xhr = new XMLHttpRequest();
    xhr.open("GET", apiUrl + "survay/getSurveyName?surveyId=" + this.surveyId);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.onload = function() {
      var result = xhr.response ? JSON.parse(xhr.response) : {};
      //console.log(result);
      self.surveyName = result[0];
    };
    xhr.send();
  }

  getSurvey(surveyId) {
    var self=this;
    var xhr = new XMLHttpRequest();
    xhr.open("GET", apiUrl + "survay/getSurvey?surveyId=" + this.surveyId);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.onload = function() {
      var result = xhr.response ? JSON.parse(xhr.response) : {};
      self.json = result;
    };
    xhr.send();
  }
}
