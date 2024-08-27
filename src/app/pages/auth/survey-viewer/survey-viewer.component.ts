import { Component, OnInit } from '@angular/core';
//import { CategoryService } from '../../../services/referendum.service';
import {ToasterModule, ToasterService} from 'angular2-toaster';
import { Router , ActivatedRoute} from '@angular/router';

//import {OrderBy} from "../../../pipes/orderBy"
import { environment } from '../../../../environments/environment';

import $ from 'jquery';

const apiUrl =environment.apiUrl;

@Component({
  selector: 'app-referendum',
  templateUrl: './survey-viewer.component.html',
  styleUrls: ['./survey-viewer.component.scss']
})
export class SurveyViewerComponent implements OnInit {

  private toasterService: ToasterService;
  parent: string="";
  surveyName : string = "";
  json :string = "{}";
  surveyId: number = 0;
  userId:number = 0;

  constructor(private router: Router, private activeroute: ActivatedRoute, private alertService: ToasterService) {
    
  }

  ngOnInit() {
    this.parent = this.activeroute.snapshot.params['parent'];
    this.surveyId = this.activeroute.snapshot.params['id'];
    this.userId = this.activeroute.snapshot.params['user_id'];
    console.log(this.userId);
    if(this.parent!="admin" && typeof(this.userId) == "undefined"){
      this.userId = 0;
      alert('User is not logged in');
    }
    //console.log(this.surveyId);
    this.getSurvey(this.surveyId);
    this.getSurveyName(this.surveyId);
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

  sendData(results){
    console.log(results);
    var self=this;
    var data = {postId : this.surveyId, surveyResult: results, userId: this.userId};
    console.log(data);
    //debugger;
    var xhr = new XMLHttpRequest();
    xhr.open("POST", apiUrl + "survay/post");
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.send(JSON.stringify(data));
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