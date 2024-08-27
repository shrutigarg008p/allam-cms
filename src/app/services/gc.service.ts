import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import { Question } from '../models/studyexam';

@Injectable({ providedIn: 'root' })
export class GcService {
    constructor(private http: HttpClient) { }

    getAll() {
        return this.http.get<Question[]>(environment.apiUrl+'cms-pocquestion/all_question');
    }

   getQuiz() {
      return this.http.get<any>(environment.apiUrl+'gc/all_quiz');
    }

    getQuizByUser(id: number) {
      return this.http.get<any>(environment.apiUrl+'gc/all_quiz_by_user/'+id);
    }

    deleteDraftQuestion(id: number) {
        return this.http.delete(environment.apiUrl+'gc/delete_draft_question/' + id);
    }

    addQuestion(question: Question) 
    {
      console.log('--before servirprint--')
      console.log(question);
      console.log('--after service print');
      return this.http.post(environment.apiUrl+'cms-pocquestion/add_question', question);
  	}

    addBulkQuestionTemp(questionData, created_by,header_id,category_id) 
    {
      return this.http.post(environment.apiUrl+'gc/add_question_temp', {
        selectedData: questionData, created_by: created_by,header_id:header_id,category_id:category_id
      });
    }

    addSingleQuestionTemp(questionData, created_by) 
    {
      var formData: any = new FormData();
      formData.append("option1", questionData.option1);
      formData.append("option2", questionData.option2);
      formData.append("option3", questionData.option3);
      formData.append("option4", questionData.option4);
      formData.append("answer", questionData.answer);
      formData.append("video_file", questionData.video_file);
      formData.append("question", questionData.question);
      formData.append("question_type", questionData.question_type);
      formData.append("question_text", questionData.question_text);
      formData.append("heading", questionData.heading);
      formData.append("category", questionData.category);
      formData.append("note", questionData.note);
      formData.append("level", questionData.level);
      formData.append("duration", questionData.duration);
      formData.append("created_by", questionData.created_by);
      return this.http.post(environment.apiUrl+'gc/add_single_question_temp',formData);
    }
    updateQuestionInDraft(questionArr) 
    {
      var formDataEdit: any = new FormData();
      formDataEdit.append("option1", questionArr.option1);
      formDataEdit.append("option2", questionArr.option2);
      formDataEdit.append("option3", questionArr.option3);
      formDataEdit.append("option4", questionArr.option4);
      formDataEdit.append("answer", questionArr.answer);
      formDataEdit.append("video_file", questionArr.video_file);
      formDataEdit.append("question", questionArr.question);
      formDataEdit.append("question_type", questionArr.question_type);
      formDataEdit.append("question_text", questionArr.question_text);
      formDataEdit.append("heading", questionArr.heading);
      formDataEdit.append("category", questionArr.category);
      formDataEdit.append("note", questionArr.note);
      formDataEdit.append("level", questionArr.level);
      formDataEdit.append("duration", questionArr.duration);
      formDataEdit.append("created_by", questionArr.created_by);
      formDataEdit.append("question_image_url", questionArr.question_image_url);
      formDataEdit.append("question_image", questionArr.question_image);
      formDataEdit.append("qui_type", questionArr.question_type);
      formDataEdit.append("id", questionArr.id);
      formDataEdit.append("isFile", questionArr.isFile);
      formDataEdit.append("isVideo", questionArr.isVideo);
      console.log(formDataEdit);
      return this.http.post(environment.apiUrl+'gc/update_question_in_draft',formDataEdit);
    }

    updateSingleQuestionInDraft(question) 
    {
      var formData: any = new FormData();
      formData.append("option1", question.option1);
      formData.append("option2", question.option2);
      formData.append("option3", question.option3);
      formData.append("option4", question.option4);
      formData.append("answer", question.answer);
      formData.append("video_file", question.video_file);
      formData.append("question", question.question);
      formData.append("question_type", question.question_type);
      formData.append("question_text", question.question_text);
      formData.append("heading", question.heading);
      formData.append("category", question.category);
      formData.append("note", question.note);
      formData.append("level", question.level);
      formData.append("duration", question.duration);
      formData.append("created_by", question.created_by);
      formData.append("question_image_url", question.question_image_url);
      formData.append("qui_type", question.question_type);
      formData.append("id", question.id);
      formData.append("isFile", question.isFile);
      formData.append("isVideo", question.isVideo);


      return this.http.post(environment.apiUrl+'gc/update_single_question_in_draft', formData);
    }
    updateSingleQuestionInDraft_old(question: Question) 
    {
      console.log('--before servirprint--')
      console.log(question);
      console.log('--after service print');
      return this.http.post(environment.apiUrl+'gc/update_single_question_in_draft', question);
    }

    publishQuestion(question: Question) 
    {
      return this.http.post(environment.apiUrl+'gc/publish_question', question);
    }
    addBulkQuestion(questionData) 
    {
      // console.log('--before servirprint--')
       console.log(questionData);
      // console.log('--after service print');
      return this.http.post(environment.apiUrl+'gc/add_question', {
        selectedData: questionData
      });
    }


    getDraftQuestionByUser(id: number,type:any) {
      return this.http.get(environment.apiUrl+'gc/get_draft_question_by_user/' + id+'/'+type);
    }

    
    getDraftQuizByUser(id: number,quiz_id) {
        return this.http.get(environment.apiUrl+'gc/get_draft_quiz_by_user/' + id+'/'+quiz_id);
    }

    getAllQuestionByUser(id: number,role_id:any,params:any) {
      return this.http.get<any>(environment.apiUrl+'gc/get_all_question_by_user/'+id+'/'+role_id,{ params });
    }

  update_status(question: Question) {
     return this.http.patch(environment.apiUrl+'gc/update_status', question);
  }

   getHeading() {
    return this.http.get<any>(environment.apiUrl+'gc/get_heading');
  }
  getCategoryByHeading(id: number) {
  if(id){
    return this.http.get<any>(environment.apiUrl+'gc/get_category_by_heading/'+id);
  }
  }

    publishSingleQuestion(question: Question) 
    {
      return this.http.post(environment.apiUrl+'gc/publish_single_question', question);
    }

}