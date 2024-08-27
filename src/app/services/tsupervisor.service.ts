import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import { Signup } from '../models';
import { Question } from '../models/studyexam';

@Injectable({ providedIn: 'root' })
export class TsupervisorService {
    constructor(private http: HttpClient) { }

    updateStatus(user: Signup,id) {
     return this.http.patch(environment.apiUrl+'user/update_user_status/'+id, user);
    }
    
    getAllTeacher() {
     return this.http.get(environment.apiUrl+'user/get_all_teacher');
    }

    getPublishQuestion(id: string) {
      return this.http.get(environment.apiUrl+'cms-study-exam/get_publish_question_by_user/' + id);
    }
    getPublishQuestionNew(id: string,params:any) {
      return this.http.get(environment.apiUrl+'cms-study-exam/get_publish_question_by_user_new/' + id,{ params });
    }
    approvePublishQuestion(id: number,user_id:number,user: []) {
        return this.http.patch(environment.apiUrl+'cms-study-exam/approve_publish_question/' + id+'/'+ user_id,user);
    }

    updateQuestionByTsBulk(question: Question) 
    {
      console.log('--before servirprint--')
      console.log(question);
      console.log('--after service print');
      return this.http.post(environment.apiUrl+'cms-study-exam/update_question_by_ts', question);
    }
    updateQuestionById(question: Question) 
    {
      console.log('--before servirprint--')
      console.log(question);
      console.log('--after service print');
      return this.http.post(environment.apiUrl+'cms-study-exam/update_question_by_id', question);
    }

    updateQuestionByTsSingle(question: Question) 
    {
      console.log('--before servirprint--')
      console.log(question);
      console.log('--after service print');
      return this.http.post(environment.apiUrl+'cms-curriculum-single/update_question_by_ts', question);
    }

    getActiveQuestion() {
      return this.http.get(environment.apiUrl+'cms-study-exam/get_active_question');
    }
    getActiveQuestionNew(params) {
      return this.http.get(environment.apiUrl+'cms-study-exam/get_active_question_new',{params});
    }

    getActiveQuiz() {
      return this.http.get(environment.apiUrl+'cms-study-exam/get_all_quiz');
    }

    getUserByID(id: string) {
      return this.http.get(environment.apiUrl+'cms-study-exam/get_user_by_id/' + id);
    }

    updateQuizStatus(quiz: object) 
    {
      return this.http.patch(environment.apiUrl+'cms-study-exam/update_status', quiz);
    }

    deletePublishQuestion(id: number,user_id:number,user: []) {
        return this.http.patch(environment.apiUrl+'cms-study-exam/delete_publish_question/' + id+'/'+ user_id,user);
    }
}