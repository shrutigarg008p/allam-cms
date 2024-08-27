import { Component, OnInit } from '@angular/core';

import { Quiz } from '../../../models/quiz';
import { QuizService } from '../../../services/quiz.service';

import { ActivatedRoute, Router } from '@angular/router';

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
  id: number;

  constructor(private quizService: QuizService, private activeAouter: ActivatedRoute, private router: Router) { }

  ngOnInit() {
    //this.quizs = this.getQuizs();
    this.getDetail(this.activeAouter.snapshot.params['quizId']);
    //var ss = this.activeAouter.snapshot.params['quizId'];
    //console.log(ss);
  }
 /* getQuizs(): Quiz[] {
    return this.quizService.getQuizsFromData();
    this.quizService.showEditQuiz(id);
  }
*/
  /*showEditQuizForm(quiz: Quiz) {
    if (!quiz) {
      this.quizForm = false;
      return;
    }
    this.editQuizForm = true;
    this.editedQuiz = quiz;
  }*/

  getDetail(id) {
    this.editedQuiz =  this.quizService.showEditQuiz(id);
  }

  updateQuiz() {
  	//this.getDetail(this.activeAouter.snapshot.params['id']);
    this.quizService.updateQuiz(this.editedQuiz);
    this.editQuizForm = false;
    this.editedQuiz = {};

    console.log('Quiz created!')
      //this.router.navigateByUrl('/quiz/');
    this.router.navigate(['/quiz']);
  }

  removeUser(user: Quiz) {
    this.quizService.deleteQuiz(user);
  }

}
