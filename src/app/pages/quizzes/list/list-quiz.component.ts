import { Component, OnInit } from '@angular/core';
import { Quiz } from '../../../models/quiz';
import { QuizService } from '../../../services/quiz.service';

import { Router } from '@angular/router';

@Component({
  selector: 'app-quiz',
  templateUrl: './list-quiz.component.html',
  styleUrls: ['./list-quiz.component.scss']
})
export class ListQuizComponent implements OnInit {

  quizs: Quiz[];
  term: string;
  config: any;
  
  constructor(private quizService: QuizService, private router: Router) { 
      //Create dummy data
    /*for (var i = 0; i < this.quizs.length; i++) {
      this.collection.data.push(
        {
          id: i + 1,
          value: "items number " + (i + 1)
        }
      );
    }*/
    
    this.config = {
      itemsPerPage: 3,
      currentPage: 1,
      totalItems: this.getQuizs().length
    };
    }

  ngOnInit() {
    this.quizs = this.getQuizs();
  }

  pageChanged(event){
    this.config.currentPage = event;
  }

  getQuizs(): Quiz[] {
    return this.quizService.getQuizsFromData();
  }

  removeQuiz(quiz: Quiz) {
  	if(confirm("Are you sure to delete- "+quiz.title)) {
    	this.quizService.deleteQuiz(quiz);
  	}
    
  }
}
