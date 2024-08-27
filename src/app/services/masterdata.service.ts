import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import { Masterdata } from '../models/masterdata';

@Injectable({ providedIn: 'root' })
export class MasterdataService {
    constructor(private http: HttpClient) { }


    getAll(type='school') 
    {
      if(type=='school'){
        return this.http.get(environment.apiUrl+'masterdata/get_school');
      }
      else if(type=='university'){
        return this.http.get(environment.apiUrl+'masterdata/get_university');
      }
      else if(type=='quiz'){
        return this.http.get(environment.apiUrl+'masterdata/get_quiz');
      }
      else if(type=='subquiz'){
        return this.http.get(environment.apiUrl+'masterdata/get_sub_quiz');
      }
      else if(type=='subject'){
        return this.http.get(environment.apiUrl+'masterdata/get_subject');
      }
      else if(type=='district'){
        return this.http.get(environment.apiUrl+'masterdata/get_district');
      }
      else if(type=='country'){
        return this.http.get(environment.apiUrl+'masterdata/get_country');
      }
  	}

    updateStatus(masterdata: Masterdata,type='') 
    {
      if(type=='school'){
       return this.http.patch(environment.apiUrl+'masterdata/update_school_status', masterdata);
      }
      else if(type=='university'){
        return this.http.patch(environment.apiUrl+'masterdata/update_university_status',masterdata);
      }
      else if(type=='quiz'){
         return this.http.patch(environment.apiUrl+'masterdata/update_quiz_status',masterdata);
      }
      else if(type=='subquiz'){
         return this.http.patch(environment.apiUrl+'masterdata/update_sub_quiz_status',masterdata);
      }
      else if(type=='subject'){
         return this.http.patch(environment.apiUrl+'masterdata/update_subject_status',masterdata);
      }
      else if(type=='district'){
         return this.http.patch(environment.apiUrl+'masterdata/update_district_status',masterdata);
      }
      else if(type=='country'){
         return this.http.patch(environment.apiUrl+'masterdata/update_country_status',masterdata);
      }
    }
    
    //school
    addSchool(masterdata: Masterdata) 
    {
      return this.http.post(environment.apiUrl+'masterdata/add_school', masterdata);
    }

    schoolById(id: number) {
     return this.http.get(environment.apiUrl+'masterdata/school_by_id/'+id);
    }


    updateSchool(masterdata: Masterdata,id) {
       return this.http.patch(environment.apiUrl+'masterdata/update_school/'+id, masterdata);
    }

    //university
    addUniversity(masterdata: Masterdata) 
    {
      return this.http.post(environment.apiUrl+'masterdata/add_university', masterdata);
    }

    universityById(id: number) {
     return this.http.get(environment.apiUrl+'masterdata/university_by_id/'+id);
    }


    updateUniversity(masterdata: Masterdata,id) {
       return this.http.patch(environment.apiUrl+'masterdata/update_university/'+id, masterdata);
    }

    //quiz
    addQuiz(masterdata: Masterdata) 
    {
      return this.http.post(environment.apiUrl+'masterdata/add_quiz', masterdata);
    }

    quizById(id: number) {
     return this.http.get(environment.apiUrl+'masterdata/quiz_by_id/'+id);
    }


    updateQuiz(masterdata: Masterdata,id) {
       return this.http.patch(environment.apiUrl+'masterdata/update_quiz/'+id, masterdata);
    }

    //subquiz
    addSubQuiz(masterdata: Masterdata) 
    {
      return this.http.post(environment.apiUrl+'masterdata/add_sub_quiz', masterdata);
    }

    subQuizById(id: number) {
     return this.http.get(environment.apiUrl+'masterdata/sub_quiz_by_id/'+id);
    }


    updateSubQuiz(masterdata: Masterdata,id) {
       return this.http.patch(environment.apiUrl+'masterdata/update_sub_quiz/'+id, masterdata);
    }

    //subject
    addSubject(masterdata: Masterdata) 
    {
      //console.log(masterdata);
      var formData: any = new FormData();
      formData.append("name", masterdata.name);
      formData.append("icon", masterdata.icon);
      return this.http.post(environment.apiUrl+'masterdata/add_subject', masterdata);
    }

    subjectById(id: number) {
     return this.http.get(environment.apiUrl+'masterdata/subject_by_id/'+id);
    }


    updateSubject(masterdata: Masterdata,id) {
       return this.http.patch(environment.apiUrl+'masterdata/update_subject/'+id, masterdata);
    }


     //district
    addDistrict(masterdata: Masterdata) 
    {
      return this.http.post(environment.apiUrl+'masterdata/add_district', masterdata);
    }

    districtById(id: number) {
     return this.http.get(environment.apiUrl+'masterdata/district_by_id/'+id);
    }


    updateDistrict(masterdata: Masterdata,id) {
       return this.http.patch(environment.apiUrl+'masterdata/update_district/'+id, masterdata);
    }


    //country
    addCountry(masterdata: Masterdata) 
    {
      return this.http.post(environment.apiUrl+'masterdata/add_country', masterdata);
    }

    countryById(id: number) {
     return this.http.get(environment.apiUrl+'masterdata/country_by_id/'+id);
    }


    updateCountry(masterdata: Masterdata,id) {
       return this.http.patch(environment.apiUrl+'masterdata/update_country/'+id, masterdata);
    }




    delete(id: number) {
          //return this.http.delete(environment.apiUrl+'user/delete/' + id);
    }

}