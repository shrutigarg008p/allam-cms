import { Component, OnInit } from '@angular/core';
//import { CategoryService } from '../../../services/referendum.service';
import {ToasterModule, ToasterService} from 'angular2-toaster';
import { Router , ActivatedRoute} from '@angular/router';
import * as SurveyCreator from "survey-creator";  

//import {OrderBy} from "../../../pipes/orderBy"
import { environment } from '../../../../environments/environment';

import $ from 'jquery';

const apiUrl =environment.apiUrl;

@Component({
  selector: 'app-referendum',
  templateUrl: './survey-create.component.html',
  styleUrls: ['./survey-create.component.scss']
})
export class SurveyCreateComponent implements OnInit {

  private toasterService: ToasterService;
  
  surveyName : string = "";
  json :string = "{}";
  surveyId: number = 0;

  constructor(private router: Router, private activeroute: ActivatedRoute, private alertService: ToasterService) {
    
  }

  ngOnInit() {

    this.surveyId = this.activeroute.snapshot.params['id'];
    this.getSurvey(this.surveyId);
    $(document).ready(function(){
      $("#svd-survey-settings").css("display","none");
      $("#svd-options").css("display","none");
      $("#svd-save").css("display","");
    });
  }

  goBack=function(){
    this.router.navigate(['/referendum']);
  }
  
  onSurveySaved(json){
    var self=this;
    var data = {Id : this.surveyId, Json: json};
    //debugger;
    var xhr = new XMLHttpRequest();
    xhr.open("POST", apiUrl + "survay/changeJson");
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.send(JSON.stringify(data));
    this.alertService.pop('success', 'Survey saved successfully');
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