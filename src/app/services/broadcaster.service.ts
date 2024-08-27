import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import { Signup } from '../models';
import { Question } from '../models/studyexam';

@Injectable({ providedIn: 'root' })
export class BroadcasterService {
    constructor(private http: HttpClient) { }
    
    getAllCompetitions(id) {
      //debugger;
      var date = new Date(new Date().toUTCString());
      var clientDate=(new Date(date).getFullYear() + "-" + (new Date(date).getMonth() + 1) + "-" + new Date(date).getDate() + " " + new Date(date).getHours()+ ":" + new Date(date).getMinutes()+ ":" + new Date(date).getSeconds())
     return this.http.get(environment.apiUrl+'competition/get-broadcaster-data/'+id);
    }

    goLive(id) {
      return this.http.get(environment.apiUrl+'competition/go-live/'+id);
     }
}