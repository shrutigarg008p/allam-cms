import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { Question } from '../../models/studyexam';

@Injectable({ providedIn: 'root' })
export class PocquestionService {
    constructor(private http: HttpClient) { }

    getAll() {
        return this.http.get<Question[]>(environment.apiUrl+'cms-pocquestion/all_question');
    }

   getQuiz() {
      return this.http.get<any>(environment.apiUrl+'cms-study-exam/all_quiz');
    }

    getQuizByUser(id: number) {
      return this.http.get<any>(environment.apiUrl+'cms-study-exam/all_quiz_by_user/'+id);
    }

    deleteDraftQuestion(id: number) {
        return this.http.delete(environment.apiUrl+'cms-study-exam/delete_draft_question/' + id);
    }

    addQuestion(question: Question) 
    {
      console.log('--before servirprint--')
      console.log(question);
      console.log('--after service print');
      return this.http.post(environment.apiUrl+'cms-pocquestion/add_question', question);
  	}

    addBulkQuestionTemp(questionData, created_by) 
    {
       //console.log('--before servirprint--')
       console.log(questionData);
      // console.log('--after service print');
      return this.http.post(environment.apiUrl+'cms-study-exam/add_question_temp', {
        selectedData: questionData, created_by: created_by
      });
    }
    updateQuestionInDraft(question: Question) 
    {
      console.log('--before servirprint--')
      console.log(question);
      console.log('--after service print');
      return this.http.post(environment.apiUrl+'cms-study-exam/update_question_in_deaft', question);
    }
    saveQuiz(question: Question) 
    {
      return this.http.post(environment.apiUrl+'cms-study-exam/save_quiz', question);
    }
    addBulkQuestion(questionData) 
    {
      // console.log('--before servirprint--')
       console.log(questionData);
      // console.log('--after service print');
      return this.http.post(environment.apiUrl+'cms-study-exam/add_question', {
        selectedData: questionData
      });
    }

    addBulkQuestionCompetitive(questionData, studyData) 
    {
      // console.log('--before servirprint--')
      // console.log(questionData);
      // console.log('--after service print');
      return this.http.post(environment.apiUrl+'cms-study-exam/add_question_competitive', {
        selectedData: questionData,
        quizData : studyData
      });
    }

    getDraftQuestionByUser(id: number) {
      return this.http.get(environment.apiUrl+'cms-study-exam/get_draft_question_by_user/' + id);
    }

    ////////// Here start for competitive data ///////////////

    addBulkQuestionCompetitiveTemp(questionData, created_by, quiz_temp_id) 
    {
       //console.log('--before servirprint--')
       console.log(questionData);
      // console.log('--after service print');
      return this.http.post(environment.apiUrl+'cms-study-exam/add_question_competitive_temp', {
        selectedData: questionData, created_by: created_by, quiz_temp_id: quiz_temp_id
      });
    }
    updateQuestionCompetitiveDraft(question: Question) 
    {
      console.log('--before servirprint--')
      console.log(question);
      console.log('--after service print');
      return this.http.post(environment.apiUrl+'cms-study-exam/update_question_competitive_draft', question);
    }
    saveCompetitiveQuiz(question, quiz_temp_id) 
    {
      return this.http.post(environment.apiUrl+'cms-study-exam/save_competitive_quiz', {questionData : question, quiz_temp_id: quiz_temp_id});
    }

    getDraftQuestionCompetitiveByUser(id: number, quiz_temp_id) {
      return this.http.get(environment.apiUrl+'cms-study-exam/get_draft_question_competitive_by_user/' + id+'/'+quiz_temp_id);
    }
    getDraftQuizByUser(id: number,quiz_id) {
        return this.http.get(environment.apiUrl+'cms-study-exam/get_draft_quiz_by_user/' + id+'/'+quiz_id);
    }


}