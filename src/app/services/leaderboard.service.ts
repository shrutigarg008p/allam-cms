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

@Injectable({
  providedIn: 'root'
})
export class LeaderboardService {

  constructor(private http: HttpClient, private router: Router,  private route: ActivatedRoute) { }

  getAll() {
    return this.http.get<any[]>(apiUrl+'competition/');
  }
  getCompetitionName(filters): Observable<any>{
    //console.log(filters)
    const body = new HttpParams()
    .set('competition_type', filters.competitionType)
    
    .set('created_at', filters.created_at);
     return this.http.post(apiUrl+'competition/leaderboard_competition_name', body.toString(),
     {
       headers: new HttpHeaders()
         .set('Content-Type', 'application/x-www-form-urlencoded')
     });

  }
  getLeaderboard( audienceFilter): Observable<any>{
    console.log('audienceFilter', audienceFilter);
    const body = new HttpParams()
    .set('competition_id', audienceFilter.competitionId)
    .set('competition_type', audienceFilter.competitionType)
    .set('action_flag', audienceFilter.action_flag)
    .set('action_value', audienceFilter.action_value)
    .set('sort_type', audienceFilter.rank)
     return this.http.post(apiUrl+'competition/leaderboard', body.toString(),
     {
       headers: new HttpHeaders()
         .set('Content-Type', 'application/x-www-form-urlencoded')
     });

  }
}
