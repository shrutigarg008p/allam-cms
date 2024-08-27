import { Component, OnInit } from '@angular/core';

import { Quiz } from '../../../models/quiz';
import { QuizService } from '../../../services/quiz.service';

import { Router } from '@angular/router';

@Component({
  selector: 'app-quiz',
  templateUrl: './edit-quiz.component.html',
  styleUrls: ['./edit-quiz.component.scss']
})
export class EditQuizComponent implements OnInit {

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

  updateQuiz() {
  	//this.getDetail(this.activeAouter.snapshot.params['id']);
    this.quizService.updateQuiz(this.editedQuiz);
    this.editQuizForm = false;
    this.editedQuiz = {};
  }

  removeUser(user: Quiz) {
    this.quizService.deleteQuiz(user);
  }

}
