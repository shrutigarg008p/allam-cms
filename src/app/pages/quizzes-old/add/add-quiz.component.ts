import { Component, OnInit } from '@angular/core';

import { Quiz } from '../../../models/quiz';
import { QuizService } from '../../../services/quiz.service';

import { Router } from '@angular/router';

@Component({
  selector: 'app-quiz',
  templateUrl: './add-quiz.component.html',
  styleUrls: ['./add-quiz.component.scss']
})
export class AddQuizComponent implements OnInit {

  quizs: Quiz[];
  quizForm: boolean;
  isNewQuiz: boolean;
  newQuiz: any = {};
  
  constructor(private quizService: QuizService, private router: Router) { }

  ngOnInit() {
    this.quizs = this.getQuizs();
  }

  getQuizs(): Quiz[] {
    return this.quizService.getQuizsFromData();
  }

  showAddQuizForm() {
    // resets form if edited user
    if (this.quizs.length) {
      this.newQuiz = {};
    }
    this.quizForm = true;
    this.isNewQuiz = true;
  }

  saveQuiz(quiz: Quiz) {
    //if (this.isNewQuiz) {
      // add a new quiz
      this.quizService.addQuiz(quiz);

      console.log('Quiz created!')
      //this.router.navigateByUrl('/quiz/');
      this.router.navigate(['/quiz']);
    //}
    this.quizForm = false;
  }

  cancelNewQuiz() {
    this.newQuiz = {};
    this.quizForm = false;
  }
}
