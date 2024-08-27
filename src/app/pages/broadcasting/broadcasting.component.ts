import { Component, OnInit, Pipe, Output, EventEmitter } from '@angular/core';
import { Question } from '../../models/studyexam';
import {ToasterModule, ToasterService} from 'angular2-toaster'
import { AuthenticationService } from '../../services';
import { BroadcasterService } from '../../services/broadcaster.service';

import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators,FormControl } from '@angular/forms';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import { CurriculumSingleService } from '../../services/studyexam/curriculum-single.service';
import { environment } from '../../../environments/environment'

@Component({
  selector: 'app-broadcasting',
  templateUrl: './broadcasting.component.html',
  //pipes: [OrderBy] 
})


export class BroadcastingComponent implements OnInit {
  s3_url =environment.s3_url;
  private toasterService: ToasterService;
  loading=false;
  returnUrl: string;
  created_by:number;
  logUser:any;
  competitionArr:[];

  constructor(private fb: FormBuilder,private route: ActivatedRoute,
  private broadcasterService: BroadcasterService,
  private router: Router,
  private alertService: ToasterService, 
  private authenticationService: AuthenticationService) { 
  
  }
  ngOnInit() 
  {
      var self=this;
      this.logUser    = this.authenticationService.currentUserValue;
      this.logUser    = JSON.parse(this.logUser);
      this.created_by = this.logUser['user'][0]['id'];     
      this.getAllCompetitions();
      setInterval(function() {
        self.getAllCompetitions();
      }, 60 * 1000);
      
  }

  public getAllCompetitions() {
    this.broadcasterService.getAllCompetitions(this.created_by).subscribe(response => { 
      this.competitionArr = response['data'];
      console.log( this.competitionArr);
    },
    error => {
        this.alertService.pop('error', 'Something went wrong. Try again later.');
    });
  }

  goLive(competitionId, date){
    var today = new Date();
    var competitionDate = new Date(date);
    var diffMs = (competitionDate.getTime() - today.getTime()); // milliseconds between now & Christmas
    var diff = Math.abs(Math.round(diffMs/60000));
    var qUrl = '/broadcasting/broadcaster-live/'+btoa(competitionId + "|" + diff);
    this.router.navigate([]).then(result => {  window.open(qUrl, '_blank'); });
  }

  checkDisabled(date){
    var today = new Date();
    var competitionDate = new Date(date);
    var diffMs = (competitionDate.getTime() - today.getTime()); // milliseconds between now & Christmas
    var diff = Math.abs(Math.round(diffMs/60000));
    if(diff>15 || diff<0){
      return true;
    }
    else{
      return false;
    }
  }
}
