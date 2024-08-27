import { Component, OnInit } from '@angular/core';
import { Quiz } from '../../../models/quiz';
import { QuizService } from '../../../services/quiz.service';

@Component({
  selector: 'app-quiz',
  templateUrl: './list-quiz.component.html',
  styleUrls: ['./list-quiz.component.scss']
})
export class ListQuizComponent implements OnInit {

  quizs: Quiz[];
  quizForm: boolean;
  isNewQuiz: boolean;
  newQuiz: any = {};
  editQuizForm: boolean;
  editedQuiz: any = {};

  constructor(private quizService: QuizService) { }

  ngOnInit() {
    this.quizs = this.getQuizs();
  }

  getQuizs(): Quiz[] {
    return this.quizService.getQuizsFromData();
  }

  showEditQuizForm(quiz: Quiz) {
    if (!quiz) {
      this.quizForm = false;
      return;
    }
    this.editQuizForm = true;
    this.editedQuiz = quiz;
  }

  showAddQuizForm() {
    // resets form if edited user
    if (this.quizs.length) {
      this.newQuiz = {};
    }
    this.quizForm = true;
    this.isNewQuiz = true;
  }

  removeQuiz(quiz: Quiz) {
  	if(confirm("Are you sure to delete "+name)) {
    	this.quizService.deleteQuiz(quiz);
  	}
    
  }
}
