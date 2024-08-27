import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { Question } from '../../models/studyexam';

@Injectable({ providedIn: 'root' })
export class CurriculumSingleService {
    constructor(private http: HttpClient) { }

    getAll() {
        return this.http.get<Question[]>(environment.apiUrl+'cms-pocquestion/all_question');
    }

    getMasterData() {
        return this.http.get(environment.apiUrl+'cms-curriculum-single/get_master_data');
    }
   
    getDraftQuestionByUser(id: number) {
        return this.http.get(environment.apiUrl+'cms-curriculum-single/get_draft_question_by_user/' + id);
    }

    saveQuiz(question: Question) 
    {
      return this.http.post(environment.apiUrl+'cms-curriculum-single/save_quiz', question);
  	}

    saveQuestionInDraft(question: Question) 
    {
      return this.http.post(environment.apiUrl+'cms-curriculum-single/save_question_in_deaft', question);
    }

     updateQuestionInDraft(question: Question) 
    {
      console.log('--before servirprint--')
      console.log(question);
      console.log('--after service print');
      return this.http.post(environment.apiUrl+'cms-curriculum-single/update_question_in_deaft', question);
    }

    deleteDraftQuestion(id: number) {
        return this.http.delete(environment.apiUrl+'cms-curriculum-single/delete_draft_question/' + id);
    }


}