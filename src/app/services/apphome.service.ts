import { Injectable } from '@angular/core';
import { Router , ActivatedRoute } from '@angular/router';
import { HttpClient, HttpParams, HttpHeaders, HttpErrorResponse} from '@angular/common/http';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import { Apphome } from '../models/apphome';
import { environment } from '../../environments/environment'

const apiUrl =environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class ApphomeService {

  headers = new HttpHeaders().set('Content-Type', 'application/json');

  constructor(private http: HttpClient, private router: Router,  private route: ActivatedRoute,) { }

   
  getAll() {
      return this.http.get<Apphome[]>(apiUrl+'apphome/list');
  }


  addApphome(apphome: Apphome) {
    return this.http.post<Apphome>(apiUrl+'apphome/add', apphome)
  }

  getById(id: number) {
        return this.http.get(apiUrl+'apphome/get/' + id);
  }
  checkApphome(params:any) {
        return this.http.get(apiUrl+'apphome/check_apphome',{params} );
  }

  update(apphome: Apphome,id:number) {
     return this.http.patch(apiUrl+'apphome/update/'+id, apphome);
  }

  updateStatus(apphome: Apphome) {
     return this.http.patch(apiUrl+'apphome/update_status', apphome);
  }

  updateOrder(sort_order,id) 
  {
    let body_= [];
     return this.http.post(apiUrl+'apphome/update_order/'+sort_order+'/'+id,body_);
  }

  delete(id: number) {
        return this.http.delete(apiUrl+'apphome/del/' + id);
  }

}
