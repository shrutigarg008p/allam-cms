import { Component, OnInit, Pipe } from '@angular/core';
import { Question } from '../models/question';
import { QuestionService } from '../services/question.service';
import { PocquestionService } from '../services/pocquestion.service';
import {ToasterModule, ToasterService} from 'angular2-toaster'

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


  
  constructor(private pocquestionService: PocquestionService,private questionService: QuestionService, private router: Router,private alertService: ToasterService) { 

   this.term = ""; 
    this.alertService = alertService; 
    this.config = {
      itemsPerPage: 5,
      currentPage: 1,
      totalItems: 0
    };
    }

  ngOnInit() {
    this.showCompetitive();
  }

  showCompetitive(){
    this.pocquestionService.getQuiz()
            .subscribe(
                data => {
                    this.quizData = data;
                    
                },
                error => {
                    this.alertService.pop('error', 'Something went wrong. Try again later.');
                    //this.router.navigate(['/question']);
                });
  }


}
