import { Component, OnInit, Pipe } from '@angular/core';
import { Question } from '../../models/studyexam';
import { QuestionService } from '../../services/studyexam/question.service';
import { PocquestionService } from '../../services/studyexam/pocquestion.service';
import {ToasterModule, ToasterService} from 'angular2-toaster';
import { AuthenticationService } from '../../services';

import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  //pipes: [OrderBy] 
})


export class DashboardComponent implements OnInit {

  questions:  any;

  private toasterService: ToasterService;

  term: string;
  config: any;
  filters: any;

  isDesc: boolean = false;
  column: string = 'id';
  direction: number;

  quizData: any[];
  quizDraftData: any[];

  logUser:any;
  created_by:number;

  
  constructor(private pocquestionService: PocquestionService,
  private questionService: QuestionService, 
  private router: Router,
  private alertService: ToasterService,
  private authenticationService: AuthenticationService) { 

   this.term = ""; 
    this.alertService = alertService; 
    this.config = {
      itemsPerPage: 5,
      currentPage: 1,
      totalItems: 0
    };
    }

  ngOnInit() {
      this.logUser    = this.authenticationService.currentUserValue;
      this.logUser    = JSON.parse(this.logUser);
      this.created_by = this.logUser['user'][0]['id']; 
      this.showCompetitive();
  }

  showCompetitive(){
    this.pocquestionService.getQuizByUser(this.created_by)
            .subscribe(
                data => {
                    this.quizData = data['quiz'];
                    this.quizDraftData=data['draft_quiz'];
                    
                },
                error => {
                    this.alertService.pop('error', 'Something went wrong. Try again later.');
                    //this.router.navigate(['/question']);
                });
  }

  baseEncode(id){
    return btoa(id);
  }

}
