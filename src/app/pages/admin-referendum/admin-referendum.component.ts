import { Component, OnInit } from '@angular/core';
import {ToasterModule, ToasterService} from 'angular2-toaster';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
const apiUrl =environment.apiUrl;

@Component({
  selector: 'admin-referendum',
  templateUrl: './admin-referendum.component.html',
  styleUrls: ['./admin-referendum.component.scss']
})
export class AdminReferendumComponent implements OnInit 
{
  private toasterService: ToasterService;
  availableSurveys : any = [];
  filteredSurveys: any=[];
  accessKey : string;
  surveyType:string;
  constructor(private router: Router,private alertService: ToasterService) 
  {
    this.surveyType="0";
  }

  ngOnInit() {
    this.loadSurveys(); 
  }
  openPreview=function(id,status){
    this.router.navigate(['/admin-referendum/preview/'+id+'/'+status+'/admin']);
  }
  changeStatus=function(id){
    var self=this;
    var xhr = new XMLHttpRequest();
    xhr.open("GET", apiUrl + "survay/changeSurveyStatus?accessKey=" + this.accessKey + "&id=" + id);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.onload = function() {
      var result = xhr.response ? JSON.parse(xhr.response) : null;
      self.loadSurveys();
    };
    xhr.send();
  }

  handleTypeChange (evt) {
    var target = evt.target;
    debugger;
    if (target.value=="0") {
      this.filteredSurveys=this.availableSurveys;
    } else if (target.value=="1") {
      this.filteredSurveys=this.availableSurveys.filter(survey=>survey.is_public==true);
    }
    else{
      this.filteredSurveys=this.availableSurveys.filter(survey=>survey.is_public==false);
    }
  }

  loadSurveys = function() {
    var self = this;
    var xhr = new XMLHttpRequest();
    xhr.open("GET", apiUrl + "survay/getAdminSurveys?accessKey=" + this.accessKey);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.onload = function() {
      var result = xhr.response ? JSON.parse(xhr.response) : {};
      self.availableSurveys=self.filteredSurveys=
        Object.keys(result).map(function(key) {
          return {
            id: key,
            name: result[key].name || "",
            advertiser: result[key].username || "",
            IsApproved: result[key].is_approved || false,
            is_public: result[key].is_public || false,
            survey: result[key].json || result[key]
          };
        });
    };
    xhr.send();
  };
}
