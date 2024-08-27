import { Component, OnInit } from '@angular/core';

//import { CategoryService } from '../../../services/referendum.service';
import { Users } from '../../../models/users';
import { UserService } from '../../../services/user.service';
import {ToasterModule, ToasterService} from 'angular2-toaster';
import { Router } from '@angular/router';
//import {OrderBy} from "../../../pipes/orderBy"
import { environment } from '../../../../environments/environment';
import { AuthenticationService } from '../../../services';
const apiUrl =environment.apiUrl;

@Component({
  selector: 'app-referendum',
  templateUrl: './list-referendum.component.html',
  styleUrls: ['./list-referendum.component.scss']
})
export class ListReferendumComponent implements OnInit {

  private toasterService: ToasterService;
  availableSurveys : any = [];
  filteredSurveys: any=[];
  accessKey : string;
  created_by:number;
  logUser:any;
  surveyType:string;
  constructor(private router: Router,private alertService: ToasterService, private authenticationService:AuthenticationService) {
    this.surveyType="0";
  }

  ngOnInit() {
    this.logUser    = this.authenticationService.currentUserValue;
    this.logUser    = JSON.parse(this.logUser);
    this.created_by = this.logUser['user'][0]['id']; 
    this.loadSurveys();
  }

  preview(id){
    this.router.navigate(['/admin-referendum/preview/'+id+'/false/advertiser']);
  }

  addSurvey = function(){
    this.router.navigate(['/referendum/audience-referendum/0']);
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

  editSurvey = function(id, name){
    this.router.navigate(['/referendum/audience-referendum/'+id]);
    //this.router.navigate(['/referendum/create-survey/'+name+'/'+id]);
  }

  downloadSurvey = function(id){
    this.router.navigate(['/referendum/download-referendum/'+id]);
  }
  resultsSurvey=function(id){
    this.router.navigate(['/referendum/analysis-referendum/'+id]);
  }
  
  loadSurveys = function() {
    var self = this;
    var xhr = new XMLHttpRequest();
    xhr.open("GET", apiUrl + "survay/getActive?login_id="+this.created_by+"&accessKey=" + this.accessKey);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.onload = function() {
      var result = xhr.response ? JSON.parse(xhr.response) : {};
      self.availableSurveys = self.filteredSurveys=
        Object.keys(result).map(function(key) {
          return {
            id: key,
            name: result[key].name || key,
            is_public: result[key].is_public || false,
            IsApproved: result[key].is_approved || false,
            survey: result[key].json || result[key]
          };
        });
    };
    xhr.send();
  };

  deleteSurvey = function(id) {
    var self=this;
    if (confirm("Are you sure?")) {
      var xhr = new XMLHttpRequest();
      xhr.open("GET", apiUrl + "survay/delete?accessKey=" + this.accessKey + "&id=" + id);
      xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
      xhr.onload = function() {
        var result = xhr.response ? JSON.parse(xhr.response) : null;
        self.loadSurveys();
      };
      xhr.send();
    }
  };

  copyLink = function(id) {
    var self=this;
    let selBox = document.createElement('textarea');
    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';
    selBox.value = window.location.origin + "/authentication/survey-viewer/app/" + id + "/1";
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand('copy');
    document.body.removeChild(selBox);
  };
}
