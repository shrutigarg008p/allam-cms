import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { Question } from '../../models/studyexam';

@Injectable({ providedIn: 'root' })
export class CompetitiveSingleService {
    constructor(private http: HttpClient) { }

    getAll() {
        return this.http.get<Question[]>(environment.apiUrl+'cms-cms-pocquestion/all_question');
    }

    getMasterData() {
        return this.http.get(environment.apiUrl+'cms-curriculum-single/get_master_data');
    }

    getDraftQuestionByUser(id: number,quiz_id:number) {
        return this.http.get(environment.apiUrl+'cms-competitive-single/get_draft_question_by_user/' + id+'/'+quiz_id);
    }

    getDraftQuizByUser(id: number,quiz_id:number) {
        return this.http.get(environment.apiUrl+'cms-competitive-single/get_draft_quiz_by_user/' + id+'/'+quiz_id);
    }

    saveQuestionInDraft(question: Question) 
    {
      return this.http.post(environment.apiUrl+'cms-competitive-single/save_question_in_deaft', question);
    }

    updateQuestionInDraft(question: Question) 
    {
      console.log('--before servirprint--')
      console.log(question);
      console.log('--after service print');
      return this.http.post(environment.apiUrl+'cms-competitive-single/update_question_in_deaft', question);
    }

    deleteDraftQuestion(id: number) {
        return this.http.delete(environment.apiUrl+'cms-competitive-single/delete_draft_question/' + id);
    }

    saveQuizInTemp(question) 
    {
      return this.http.post(environment.apiUrl+'cms-competitive-single/save_quiz_in_temp', question);
  	}

    saveQuizInImage(imageData){
      return this.http.post(environment.apiUrl+'cms-study-exam/save_quiz_image', imageData);
    }

    saveQuizImageNew(imageData){
      return this.http.post(environment.apiUrl+'cms-study-exam/save_quiz_image_new', imageData);
    }

    saveQuiz(question: Question,quiz_temp_id) 
    {
      return this.http.post(environment.apiUrl+'cms-competitive-single/save_quiz/'+quiz_temp_id, question);
    }

    // Update 
    updateQuizInImage(imageData){
      return this.http.post(environment.apiUrl+'cms-study-exam/update_quiz_image', imageData);
    }

     updateQuizImageNew(imageData){
      return this.http.post(environment.apiUrl+'cms-study-exam/update_quiz_image_new', imageData);
    }

    updateQuizInTemp(question, quiz_temp_id) 
    {
      return this.http.post(environment.apiUrl+'cms-competitive-single/update_quiz_in_temp/'+quiz_temp_id, question);
    }



}