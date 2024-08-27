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
  templateUrl: './survey-analysis.component.html',
  styleUrls: ['./survey-analysis.component.scss']
})
export class SurveyAnalysisComponent implements OnInit {

  private toasterService: ToasterService;
  
  surveyName : string = "";
  json :any = "{}";
  results :any = [];
  surveyId: number = 0;

  constructor(private router: Router, private activeroute: ActivatedRoute, private alertService: ToasterService) {
    
  }

  ngOnInit() {

    this.surveyId = this.activeroute.snapshot.params['id'];
    this.getSurvey(this.surveyId);
  }

  goBack=function(){
    this.router.navigate(['/referendum']);
  }
  
  getSurvey(surveyId) {
    var self=this;
    var xhr = new XMLHttpRequest();
    xhr.open("GET", apiUrl + "survay/getSurvey?surveyId=" + this.surveyId);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.onload = function() {
      var result = xhr.response ? JSON.parse(xhr.response) : {};
      self.json = result;
      self.loadResults();
    };
    xhr.send();
  }

  loadResults = function() {
    var self=this;
    var xhr = new XMLHttpRequest();
    xhr.open("GET", apiUrl + "survay/results?postId=" + this.surveyId);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.onload = function() {
      var result = xhr.response ? JSON.parse(xhr.response) : [];
      self.results=
        result.map(function(r) {
          return JSON.parse(r || "{}");
        });
      
    };
    
    xhr.send();
  };
}