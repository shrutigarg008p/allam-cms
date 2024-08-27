import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from '../../environments/environment';


@Injectable({ providedIn: 'root' })
export class ReferendumService {
    constructor(private http: HttpClient) { }

    saveReferendumInImage(imageData){
      return this.http.post(environment.apiUrl+'survay/save_referendum_image', imageData);
    }
}