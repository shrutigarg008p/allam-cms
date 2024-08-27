import { Injectable } from '@angular/core';
import { Router , ActivatedRoute } from '@angular/router';
import { HttpClient, HttpParams, HttpHeaders, HttpErrorResponse} from '@angular/common/http';

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
export class DcService {

  allPassedData: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  sharedParam = this.allPassedData.asObservable();
  constructor(private http: HttpClient, private router: Router,  private route: ActivatedRoute) {}

  storePassedObject(passedData) {
      this.allPassedData.next(passedData);
     console.log('this.allPassedData '+JSON.stringify(this.allPassedData))
  }
  // here instead of reterieve like this you can directly subscribe the property in your compoents
  retrievePassedObject() {
    //console.log('this.retrieve '+JSON.stringify(this.allPassedData))
      //return this.allPassedData;
      return this.allPassedData.getValue();
  }
  checkDateForSlot(selectedDate) {
    
    const body = new HttpParams()
    .set('selectedDate', selectedDate);

     return this.http.post(apiUrl+'competition/competition-slot', body.toString(),
     {
       headers: new HttpHeaders()
         .set('Content-Type', 'application/x-www-form-urlencoded')
     });
  }
  checkDateForSlotSpecial(selectedDate) {
    
    const body = new HttpParams()
    .set('selectedDate', selectedDate);

     return this.http.post(apiUrl+'competition/competition-slot-special', body.toString(),
     {
       headers: new HttpHeaders()
         .set('Content-Type', 'application/x-www-form-urlencoded')
     });
  }
  addCompetition(competition, fileData): Observable<any> {
    console.log('competition', competition);
    console.log(fileData);
    //debugger;
    let realDateObject = new Date(competition.startDate);
    console.log(typeof realDateObject)

    var dd = realDateObject.getDate();
    var mm = realDateObject.getMonth(); 
    var yyyy = realDateObject.getFullYear();
    var hh = competition.slot_time.split(':')[0];
    var min = competition.slot_time.split(':')[1];
    var start_date_time = new Date(yyyy, mm, dd, hh, min );
    console.log(start_date_time);

    let endDateObject = new Date(competition.endDate);
    console.log(typeof endDateObject)

    var ddd = endDateObject.getDate();
    var mmm = endDateObject.getMonth(); 
    var yyyyy = endDateObject.getFullYear();
    var hh = competition.slot_time.split(':')[0];
    var min = competition.slot_time.split(':')[1];
    var end_date_time = new Date(yyyyy, mmm, ddd, hh, min );
    console.log(end_date_time);
    var waiting_time = '00:'+competition.minute_time+':'+competition.second_time;
    //var narration_time = '00:'+competition.narration_minute_time+':'+competition.narration_second_time;
    var narration_time = '00:00:'+competition.narration_second_time;
    console.log('waiting_time', waiting_time);
    console.log('narration_time', narration_time);
    var formData: any = new FormData();
    formData.append("logo", competition.logo);
    formData.append("compitition_name", competition.competitionName);
    formData.append("description", competition.description);
    formData.append("start_date", competition.startDate);
    formData.append("start_date_time", start_date_time); //competition.startDate);
    formData.append("end_date_time", end_date_time); //competition.startDate);
    formData.append("end_date", competition.endDate);
    formData.append("start_time", competition.slot_time);
    formData.append("end_time", competition.slot_time);
    formData.append("promotion_type", competition.promotion_type);
    formData.append("facebook_url", competition.facebookUrl);
    formData.append("instagram_url", competition.instragramUrl);
    formData.append("twitter_url", competition.twitterUrl);
    formData.append("snapchat_url", competition.snapchatUrl);
    formData.append("app_logo", competition.app_logo);
    formData.append("app_name", competition.app_name);
    formData.append("apple_store_url", competition.apple_store_url);
    formData.append("google_play_url", competition.google_play_url);
    formData.append("affiliate_url", competition.affiliate_url);
    formData.append("narration_type", competition.narration_type);
    formData.append("narration_url", competition.narration_url);
    formData.append("narration_text", competition.narration_text);
    formData.append("narration_time", narration_time);
    formData.append("company_logo", competition.company_logo);
    formData.append("company_name", competition.company_name);
    formData.append("company_link", competition.company_link);
    formData.append("company_about", competition.company_about);
    formData.append("live_stream_url", competition.live_stream_url);
    formData.append("gender", competition.gender);
    formData.append("age_range", competition.age_range);
    formData.append("city", competition.city);
    formData.append("state", competition.state);
    formData.append("country", competition.country);
    formData.append("nationality", competition.nationality);
    formData.append("area_locality", competition.area_locality);
    formData.append("push_notification", competition.push_notification);
    formData.append("title", competition.title);
    formData.append("image_upload", competition.image_upload);
    formData.append("audience_description", competition.audience_description);
    formData.append("slot_time", competition.slot_time);
    formData.append("competition_type", competition.competition_type);
    formData.append("status", 0);
    formData.append("waiting_time", waiting_time);
    formData.append("broadcaster_id", competition.broadcaster);
    formData.append("fileData", JSON.stringify(fileData));
    formData.append("bypass_audience", competition.bypass_audience);
    formData.append("notification_type", competition.notification_type);
    formData.append("notification_text", competition.notification_text);
    formData.append("notification_logo", competition.notification_logo);
    formData.append("apple_schema", competition.apple_schema);

    return this.http.post(apiUrl+'competition/addCompetition', formData, {
      reportProgress: true,
      observe: 'events'
    })
  }
  updateCompetition(competition, competition_id): Observable<any> {
    console.log(competition);
    //console.log(competition.startDateTime.getDate());
    // var theDate = new Date(competition.startDateTime);
    // console.log(theDate.toDateString());
    
    let realDateObject = new Date(competition.startDate);
    console.log(typeof realDateObject)
    var dd = realDateObject.getDate();

    var mm = realDateObject.getMonth(); 
    var yyyy = realDateObject.getFullYear();
    var hh = competition.slot_time.split(':')[0];
    var min = competition.slot_time.split(':')[1];
    var start_date_time = new Date(yyyy, mm, dd, hh, min );
    console.log(start_date_time);

    let endDateObject = new Date(competition.endDate);
    console.log(typeof endDateObject)

    var ddd = endDateObject.getDate();
    var mmm = endDateObject.getMonth(); 
    var yyyyy = endDateObject.getFullYear();
    var hh = competition.slot_time.split(':')[0];
    var min = competition.slot_time.split(':')[1];
    var end_date_time = new Date(yyyyy, mmm, ddd, hh, min );
    console.log(end_date_time);

    var waiting_time = '00:'+competition.minute_time+':'+competition.second_time;
    //var narration_time = '00:'+competition.narration_minute_time+':'+competition.narration_second_time;
    var narration_time = '00:00:'+competition.narration_second_time;
    console.log('waiting_time', waiting_time);
    console.log('narration_time', narration_time);

    //return;
    var formData: any = new FormData();
    formData.append("logo", competition.logo);
    formData.append("compitition_name", competition.competitionName);
    formData.append("description", competition.description);
    formData.append("start_date", competition.startDate);
    formData.append("start_date_time", start_date_time); //competition.startDate);
    formData.append("end_date_time", end_date_time); //competition.startDate);
    formData.append("end_date", competition.endDate);
    formData.append("start_time", competition.slot_time);
    formData.append("end_time", competition.slot_time);
    formData.append("promotion_type", competition.promotion_type);
    formData.append("instagram_url", competition.instragramUrl);
    formData.append("facebook_url", competition.facebookUrl);
    formData.append("twitter_url", competition.twitterUrl);
    formData.append("snapchat_url", competition.snapchatUrl);
    formData.append("app_logo", competition.app_logo);
    formData.append("app_name", competition.app_name);
    formData.append("apple_store_url", competition.apple_store_url);
    formData.append("google_play_url", competition.google_play_url);
    formData.append("affiliate_url", competition.affiliate_url);
    formData.append("narration_type", competition.narration_type);
    formData.append("narration_url", competition.narration_url);
    formData.append("narration_text", competition.narration_text);
    formData.append("narration_time", narration_time);
    formData.append("company_logo", competition.company_logo);
    formData.append("company_name", competition.company_name);
    formData.append("company_link", competition.company_link);
    formData.append("company_about", competition.company_about);
    formData.append("live_stream_url", competition.live_stream_url);
    formData.append("gender", competition.gender);
    formData.append("age_range", competition.age_range);
    formData.append("city", competition.city);
    formData.append("state", competition.state);
    formData.append("country", competition.country);
    formData.append("nationality", competition.nationality);
    formData.append("area_locality", competition.area_locality);
    formData.append("push_notification", competition.push_notification);
    formData.append("title", competition.title);
    formData.append("image_upload", competition.image_upload);
    formData.append("audience_description", competition.audience_description);
    formData.append("slot_time", competition.slot_time);
    formData.append("competition_type", competition.competition_type);
    formData.append("status", 0);
    formData.append("waiting_time", waiting_time);
    formData.append("broadcaster_id", competition.broadcaster);
    formData.append("bypass_audience", competition.bypass_audience);
    formData.append("notification_type", competition.notification_type);
    formData.append("notification_text", competition.notification_text);
    formData.append("notification_logo", competition.notification_logo);
    formData.append("apple_schema", competition.apple_schema);

    return this.http.post(apiUrl+'competition/updateCompetition/'+competition_id, formData, {
      reportProgress: true,
      observe: 'events'
    })
  }
  
  getCountry(): Observable<ComPostResponse>{
    return this.http.get<ComPostResponse>(apiUrl+'competition/get_country');
  }
  getNationality(): Observable<ComPostResponse>{
    return this.http.get<ComPostResponse>(apiUrl+'competition/get_nationality');
  }


  getBroadcaster(): Observable<ComPostResponse>{
    return this.http.get<ComPostResponse>(apiUrl+'competition/get-broadcaster');
  }
  getBroadcasterData(broadcaster_id): Observable<ComPostResponse>{
    return this.http.get<ComPostResponse>(apiUrl+'competition/get-broadcaster-data/'+broadcaster_id);
  }

  getSlot(){
    return this.http.get(apiUrl+'competition/competition-slot');
  }
  getSlotSpecial(){
    return this.http.get(apiUrl+'competition/competition-slot-special');
  }
  getList(): Observable<ComPostResponse>{
    return this.http.get<ComPostResponse>(apiUrl+'competition/get_list');
  }
  getSpecialList(): Observable<ComPostResponse>{
    return this.http.get<ComPostResponse>(apiUrl+'competition/get_special_list');
  }
  editCompetition(id): Observable<ComPostResponse>{
    return this.http.get<ComPostResponse>(apiUrl+'competition/edit_competition/'+id);
  }
  updateQuestionCompetition(question) 
  {
    console.log('--before servirprint--')
    console.log(question);
    console.log('--after service print');
    return this.http.post(apiUrl+'competition/update_question_competition', question);
  }
  updateStatus(status, competition_id) {
    const body = new HttpParams()
    .set('status', status);

     return this.http.post(apiUrl+'competition/update_status/'+competition_id, body.toString(),
     {
       headers: new HttpHeaders()
         .set('Content-Type', 'application/x-www-form-urlencoded')
     });
  }
  deleteQuestion(id: number) {
      return this.http.delete(environment.apiUrl+'competition/delete_question/' + id);
  }
  deleteCompetition(id: number) {
    return this.http.delete(environment.apiUrl+'competition/delete_competition/' + id);
  }

  /* getQuizReportsName(competition_type: string): Observable<ComPostResponse>{
    return this.http.get<ComPostResponse>(apiUrl+'competition/reports_competition_name/' + competition_type);
  } */
  getQuizReportsName(filters): Observable<any>{
    //console.log(filters)
    const body = new HttpParams()
    .set('competition_type', filters.competitionType)
    
    .set('created_at', filters.created_at);
     return this.http.post(apiUrl+'competition/reports_competition_name', body.toString(),
     {
       headers: new HttpHeaders()
         .set('Content-Type', 'application/x-www-form-urlencoded')
     });
  }

  getQuizReports( reportFilter): Observable<any>{
    console.log('reportFilter', reportFilter);
    const body = new HttpParams()
    .set('competition_id', reportFilter.competitionId)
    .set('competition_type', reportFilter.competitionType)
    .set('created_at', reportFilter.created_at)
     return this.http.post(apiUrl+'competition/quiz_reports', body.toString(),
     {
       headers: new HttpHeaders()
         .set('Content-Type', 'application/x-www-form-urlencoded')
     });

  }
  
  /* Social report */
  getQuizSocialReportsName(filters): Observable<any>{
    //console.log(filters)
    const body = new HttpParams()
    .set('competition_type', filters.competitionType)
    
    .set('created_at', filters.created_at);
     return this.http.post(apiUrl+'competition/social_reports_competition_name', body.toString(),
     {
       headers: new HttpHeaders()
         .set('Content-Type', 'application/x-www-form-urlencoded')
     });
  }
  getQuizSocialReports( reportFilter): Observable<any>{
    console.log('reportFilter', reportFilter);
    const body = new HttpParams()
    .set('competition_id', reportFilter.competitionId)
    .set('competition_type', reportFilter.competitionType)
    .set('created_at', reportFilter.created_at)
     return this.http.post(apiUrl+'competition/social_reports', body.toString(),
     {
       headers: new HttpHeaders()
         .set('Content-Type', 'application/x-www-form-urlencoded')
     });

  }

  addGenericNotification(competition): Observable<any> {
    console.log('GenericNotification', competition);
    //debugger;
    let realDateObject = new Date(competition.startDateTime);
    console.log(typeof realDateObject)

    var dd = realDateObject.getDate();
    var mm = realDateObject.getMonth(); 
    var yyyy = realDateObject.getFullYear();
    var hh = realDateObject.getHours();
    var min = realDateObject.getMinutes();
    var start_date_time = new Date(yyyy, mm, dd, hh, min );
    console.log(start_date_time);

    var formData: any = new FormData();
    formData.append("notification_logo", competition.notification_logo);
    formData.append("title", competition.title);
    formData.append("description", competition.description);
    formData.append("start_date", competition.startDateTime);
    formData.append("start_date_time", start_date_time); //competition.startDate);
    formData.append("active", competition.isPublish);

    return this.http.post(apiUrl+'competition/addGenericNotification', formData, {
      reportProgress: true,
      observe: 'events'
    })
  }
}

// export class DcService{

//   //allPassedData: BehaviorSubject<any> = new BehaviorSubject<any>([]);
//   //private paramSource = new BehaviorSubject<any>(null);
//   //sharedParam = this.paramSource.asObservable();

//   //private paramSource = new ReplaySubject(1);
//   /*private paramSource = new BehaviorSubject<any>({
//     firstName: 'Kevin',
//     email: 'ksmith@fanreact.com',
//     g: 'M'
//   });*/
//   //sharedParam = this.paramSource.asObservable();

//   // private fileData = new BehaviorSubject<any>(null);
//   // sharedParam = this.fileData.asObservable();
//  //private employeeData= new BehaviorSubject<any>(null);

//   private data = new BehaviorSubject<any>("")
//   currentData = this.data.asObservable();

// 	constructor() { }

//   setData(data) {
//       this.data.next(data);

//       console.log('--datat--')
//       console.log(data)
//   }

//    /* getEvent(): Observable<any> {
//         return this.employeeData.asObservable();
//     }

//     setEvent(param: any): void {
//         this.employeeData.next(param);
//     }*/

//   /*changeParam(param: any[]) {
//     this.fileData.next(param)
//   }*/

// 	/*storePassedObject(passedData) {
//     this.allPassedData.next(passedData);
//      console.log('--service--')
//      console.log(passedData)
//   }
//   // here instead of reterieve like this you can directly subscribe the property in your compoents
//   retrievePassedObject() {
//       return this.allPassedData;
//   }

//   getNewUserInfo() {
//     return this.paramSource.asObservable();
//   }*/

  
// }