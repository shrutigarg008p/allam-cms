import { Injectable } from '@angular/core';
import { Router , ActivatedRoute } from '@angular/router';
import { HttpClient, HttpParams, HttpHeaders, HttpEvent, HttpRequest} from '@angular/common/http';

import { environment } from '../../environments/environment'
import { Observable, BehaviorSubject } from 'rxjs';
import 'rxjs/add/operator/map';
//import { Header } from '../models/header';

//import { BehaviorSubject } from 'rxjs/BehaviorSubject';

const apiUrl =environment.apiUrl;
interface ComPostResponse {
  data: any
}

@Injectable()
export class LeagueService {

  constructor(private http: HttpClient, private router: Router,  private route: ActivatedRoute) {}

  uploadFile(file: File): Observable<HttpEvent<any>> {
    const formData: FormData = new FormData();

    formData.append('file', file);

    const req = new HttpRequest('POST', `${apiUrl}league/uploadLeagueImages`, formData, {
      reportProgress: true,
      responseType: 'json'
    });

    return this.http.request(req);
  }
  getFiles(): Observable<any> {
    return this.http.get(`${apiUrl}files`);
  }
  getByIdCategories(id: number) {
    return this.http.get(apiUrl+'league/categories/' + id);
  }
  updateQuestionCompetition(question) 
    {
      console.log('--before servirprint--')
      console.log(question);
      console.log('--after service print');
      return this.http.post(apiUrl+'league/update_question_competition', question);
    }
  deleteQuestion(id: number) {
      return this.http.delete(environment.apiUrl+'league/delete_question/' + id);
  }

  updateStatus(status, competition_id) {
    const body = new HttpParams()
    .set('status', status);

     return this.http.post(apiUrl+'league/update_status/'+competition_id, body.toString(),
     {
       headers: new HttpHeaders()
         .set('Content-Type', 'application/x-www-form-urlencoded')
     });
  }
  deleteCompetition(id: number) {
    return this.http.delete(environment.apiUrl+'competition/delete_competition/' + id);
  }

  addLeague(competition, fileData, myFiles): Observable<any> {
    //console.log(competition);
    console.log(myFiles);
    var formData: any = new FormData();

    /* for (var i = 0; i < myFiles.length; i++) { 
      formData.append("file[]", myFiles[i]);
    } */
    var waiting_time = '00:'+competition.minute_time+':'+competition.second_time;
    var narration_time = '00:'+competition.narration_minute_time+':'+competition.narration_second_time;
    console.log('waiting_time', waiting_time);
    console.log('narration_time', narration_time);

    var narration_time = '00:00:'+competition.narration_time;
    if(competition.narration_time==120){
      narration_time = '00:02:00';
    }
    
    var narration_time1 = '00:00:'+competition.narration_time1;
    var narration_time2 = '00:00:'+competition.narration_time2;

    formData.append("logo", competition.logo);
    formData.append("compitition_name", competition.competitionName);
    formData.append("description", competition.description);
    formData.append("start_date_time", competition.startDateTime);
    formData.append("end_date", competition.endDate);
    //formData.append("start_time", competition.startTime);
    formData.append("end_time", competition.endTime);
    formData.append("waiting_time", waiting_time);
    formData.append("company_name", competition.companyName);
    formData.append("company_logo", competition.companyLogo);
    formData.append("company_url", competition.companyUrl);
    formData.append("company_about", competition.companyDescription);
    formData.append("status", competition.status);
    formData.append("question_type", competition.question_type);
    formData.append("created_by", competition.created_by);
    formData.append("categories", JSON.stringify(competition.categories));
    formData.append("fileData", JSON.stringify(fileData));
    formData.append("fileArray", JSON.stringify(myFiles));

    if(competition.narration_text != ''){
      formData.append("narration_text", competition.narration_text);
      formData.append("narration_text1", competition.narration_text1);
      formData.append("narration_text2", competition.narration_text2);
      
    }else{
      formData.append("narration_url", competition.narration_url);
      formData.append("narration_url1", competition.narration_url1);
      formData.append("narration_url2", competition.narration_url2);
    }
    formData.append("narration_time", narration_time);
    formData.append("narration_time1", narration_time1);
    formData.append("narration_time2", narration_time2);
    

    return this.http.post(apiUrl+'league/addLeague', formData, {
      reportProgress: true,
      observe: 'events'
    })
  }
  updateCompetition(competition, competition_id, myFiles): Observable<any> {
    console.log(competition);
    console.log(myFiles);
    var formData: any = new FormData();

    /* for (var i = 0; i < myFiles.length; i++) { 
      formData.append("file[]", myFiles[i]);
    } */
    //var waiting_time = '00:'+competition.minute_time+':'+competition.second_time;
    //var narration_time = '00:'+competition.narration_minute_time+':'+competition.narration_second_time;

    let realDateObject = new Date(competition.startDateTime);
    console.log(typeof realDateObject)
    var dd = realDateObject.getDate();

    var mm = realDateObject.getMonth(); 
    var yyyy = realDateObject.getFullYear();
    var hh = realDateObject.getHours();
    var min = realDateObject.getMinutes();
    var start_date_time = new Date(yyyy, mm, dd, hh, min );
    console.log(start_date_time);

    var waiting_time = '00:'+competition.minute_time+':00';
    console.log('waiting_time', waiting_time);
    //console.log('narration_time', narration_time);
    var narration_time = '00:00:'+competition.narration_time;
    var narration_time1 = '00:00:'+competition.narration_time1;

    formData.append("logo", competition.logo);
    formData.append("compitition_name", competition.competitionName);
    formData.append("description", competition.description);
    formData.append("start_date_time", start_date_time); //competition.startDate);
    formData.append("start_date", competition.startDate);
    formData.append("end_date", competition.endDate);
    //formData.append("start_time", start_time);
    formData.append("end_time", competition.endTime);
    formData.append("waiting_time", waiting_time);
    formData.append("company_name", competition.companyName);
    formData.append("company_logo", competition.companyLogo);
    formData.append("company_url", competition.companyUrl);
    formData.append("company_about", competition.companyDescription);
    formData.append("status", competition.status);
    formData.append("question_type", competition.question_type);
    formData.append("created_by", competition.created_by);
    formData.append("categories", JSON.stringify(competition.categories));
    //formData.append("fileData", JSON.stringify(fileData));
    formData.append("fileArray", JSON.stringify(myFiles));

    if(competition.narration_text != ''){
      formData.append("narration_text", competition.narration_text);
      formData.append("narration_text1", competition.narration_text1);
      
    }else{
      formData.append("narration_url", competition.narration_url);
      formData.append("narration_url1", competition.narration_url1);
    }
    formData.append("narration_time", narration_time);
    formData.append("narration_time1", narration_time1);

    return this.http.post(apiUrl+'league/updateCompetition/'+competition_id, formData, {
      reportProgress: true,
      observe: 'events'
    })
  }
  getAll() {
    return this.http.get<any[]>(apiUrl+'league');
  }

  getLeagueList(): Observable<ComPostResponse>{
    return this.http.get<ComPostResponse>(apiUrl+'league/get_league_list');
  }
  editCompetition(id): Observable<ComPostResponse>{
    return this.http.get<ComPostResponse>(apiUrl+'league/edit_competition/'+id);
  }

  private httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' })
  };
  interestLeaguePost(competition): Observable<any>{
    //console.log(competition);
  
    const body = new HttpParams()
    .set('competition_id', competition.id)
    .set('interest_id', competition.interest_by)
    .set('status', competition.status);
     return this.http.post(apiUrl+'league/league_interest', body.toString(),
     {
       headers: new HttpHeaders()
         .set('Content-Type', 'application/x-www-form-urlencoded')
     });
  }
  groupLeaguePost(competition): Observable<any>{
    //console.log(competition);
    const body = new HttpParams()
    .set('competition_id', competition.id)
    .set('interest_id', competition.interest_by)
    .set('status', competition.status);
     return this.http.post(apiUrl+'league/league_group', body.toString(),
     {
       headers: new HttpHeaders()
         .set('Content-Type', 'application/x-www-form-urlencoded')
     });
  }
  getCategoryQuestion(categories){
    let params = new HttpParams();
    params = params.append('categories', categories.join(','));
    return this.http.get<any[]>(apiUrl+'league/getCategoryQuestion', { params: params });
  }

  update(competition, id) {
    const formData = new FormData();
    formData.append("logo", competition.logo);
    formData.append("compitition_name", competition.competitionName);
    formData.append("description", competition.description);
    formData.append("start_date", competition.startDate);
    formData.append("end_date", competition.endDate);
    formData.append("start_time", competition.startTime);
    formData.append("end_time", competition.endTime);
    formData.append("waiting_time", competition.waitingTime);
    formData.append("status", competition.status);

     return this.http.patch(apiUrl+'category/'+id, formData, {
      reportProgress: true,
      observe: 'events'
     });
  }

  delete(id: number) {
        return this.http.delete(apiUrl+'league/' + id);
  }
   
}