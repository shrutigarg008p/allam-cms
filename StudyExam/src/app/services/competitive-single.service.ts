import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import { Question } from '../models/question';

@Injectable({ providedIn: 'root' })
export class CompetitiveSingleService {
    constructor(private http: HttpClient) { }

    getAll() {
        return this.http.get<Question[]>(environment.apiUrl+'pocquestion/all_question');
    }

    saveQuizInTemp(question) 
    {
      return this.http.post(environment.apiUrl+'competitive-single/save_quiz_in_temp', question);
  	}

    saveQuizInImage(imageData){
      return this.http.post(environment.apiUrl+'study-exam/save_quiz_image', imageData);
    }

    saveQuiz(question: Question,quiz_temp_id) 
    {
      console.log('--before servirprint--')
      console.log(question);
      console.log('--after service print');
      return this.http.post(environment.apiUrl+'competitive-single/save_quiz/'+quiz_temp_id, question);
    }



}