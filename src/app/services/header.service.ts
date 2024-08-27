import { Injectable } from '@angular/core';
import { Router , ActivatedRoute } from '@angular/router';
import { HttpClient, HttpParams, HttpHeaders, HttpErrorResponse} from '@angular/common/http';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import { Header } from '../models/header';
import { environment } from '../../environments/environment'

const apiUrl =environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class HeaderService {

  headers = new HttpHeaders().set('Content-Type', 'application/json');

  constructor(private http: HttpClient, private router: Router,  private route: ActivatedRoute,) { }

   
  getAll() {
      return this.http.get<Header[]>(apiUrl+'header/list');
  }

  getCategory(){
    return this.http.get(apiUrl+'header/category');
  }

  /*create(header: Header) {
    return this.http.post(apiUrl+'header', Header);
  }*/

  // Create header
  addHeader_old(header: Header): Observable<any> {
    //console.log(header);
    var formData: any = new FormData();
    formData.append("title", header.title);
    formData.append("icon", header.icon);
    formData.append("description", header.description);
    formData.append("status", header.status);
    formData.append("category_ids", JSON.stringify(header.categories));

    return this.http.post<Header>(apiUrl+'header/add', formData, {
      reportProgress: true,
      observe: 'events'
    })
  }

  addHeader(header: Header) {
  console.log('service');
  console.log(header);
    return this.http.post<Header>(apiUrl+'header/add', header);
  }

  getById(id: number) {
        return this.http.get(apiUrl+'header/get_by_id/' + id);
  }

  getByIdCategories(id: number) {
        return this.http.get(apiUrl+'header/categories/' + id);
  }

  update_old(header: Header,id) {
    const formData = new FormData();
    formData.append("title", header.title);
    formData.append("icon", header.icon);
    formData.append("description", header.description);
    formData.append("status", header.status);
    formData.append("category_ids", JSON.stringify(header.categories));
    //console.log(formData);
     return this.http.patch(apiUrl+'header/update/'+id, formData, {
      reportProgress: true,
      observe: 'events'
     });
  }

  update(header: Header,id:number) {
     return this.http.patch(apiUrl+'header/update/'+id, header);
  }

  updateStatus(header: Header) {
     return this.http.patch(apiUrl+'header/update_status', header);
  }

  delete(id: number) {
        return this.http.delete(apiUrl+'header/del/' + id);
  }
  checkCategory(params:any) {
        return this.http.get(apiUrl+'header/check_category',{params} );
  }
}
