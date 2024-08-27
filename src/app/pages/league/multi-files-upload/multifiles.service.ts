import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders, HttpEvent, HttpRequest} from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../../../environments/environment'

const apiUrl =environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class MultifilesService {

  constructor(  private http: HttpClient) { }

  

  saveFiles(total_form)
  { console.log(total_form);
    let httpHeaders = new HttpHeaders({
      'Content-Type': 'multipart/form-data', 
    });
    let options = {
        headers: httpHeaders
    };
    return this.http.post(`${apiUrl}league/uploadLeagueImages`,total_form);
  }
  uploadFile(file: File): Observable<HttpEvent<any>> {
    const formData: FormData = new FormData();

    formData.append('file', file);

    const req = new HttpRequest('POST', `${apiUrl}league/uploadLeagueImages`, formData, {
      reportProgress: true,
      responseType: 'json'
    });

    return this.http.request(req);
  }
  
}
