import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import { Question } from '../models/question';

@Injectable({ providedIn: 'root' })
export class PocquestionService {
    constructor(private http: HttpClient) { }

    getAll() {
        return this.http.get<Question[]>(environment.apiUrl+'pocquestion/all_question');
    }

   getQuiz() {
        return this.http.get<any>(environment.apiUrl+'study-exam/all_quiz');
    }

    addQuestion(question: Question) 
    {
      console.log('--before servirprint--')
      console.log(question);
      console.log('--after service print');
      return this.http.post(environment.apiUrl+'pocquestion/add_question', question);
  	}

    addBulkQuestion(questionData) 
    {
      // console.log('--before servirprint--')
       console.log(questionData);
      // console.log('--after service print');
      return this.http.post(environment.apiUrl+'study-exam/add_question', {
        selectedData: questionData
      });
    }

    addBulkQuestionCompetitive(questionData, studyData) 
    {
      // console.log('--before servirprint--')
      // console.log(questionData);
      // console.log('--after service print');
      return this.http.post(environment.apiUrl+'study-exam/add_question_competitive', {
        selectedData: questionData,
        quizData : studyData
      });
    }

}