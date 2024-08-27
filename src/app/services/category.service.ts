import { Injectable } from '@angular/core';
import { Router , ActivatedRoute } from '@angular/router';
import { HttpClient, HttpParams, HttpHeaders, HttpErrorResponse} from '@angular/common/http';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import { Category } from '../models/category';
import { environment } from '../../environments/environment'

const apiUrl =environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  headers = new HttpHeaders().set('Content-Type', 'application/json');

  constructor(private http: HttpClient, private router: Router,  private route: ActivatedRoute,) { }

   
  getAll() {
      return this.http.get<Category[]>(apiUrl+'category/list');
  }

  /*create(category: Category) {
    return this.http.post(apiUrl+'category', category);
  }*/

  // Create User
  addCategory_old(category: Category): Observable<any> {
    console.log(category);
    var formData: any = new FormData();
    formData.append("title", category.title);
    formData.append("icon", category.icon);
    formData.append("description", category.description);
    formData.append("status", category.status);

    return this.http.post<Category>(apiUrl+'category/add', formData, {
      reportProgress: true,
      observe: 'events'
    })
  }

  addCategory(category: Category) {
    return this.http.post<Category>(apiUrl+'category/add', category)
  }

  getById(id: number) {
        return this.http.get(apiUrl+'category/get/' + id);
  }
  checkCategory(params:any) {
        return this.http.get(apiUrl+'category/check_category',{params} );
  }
  update_old(category: Category,id) {
    const formData = new FormData();
    formData.append("title", category.title);
    formData.append("icon", category.icon);
    formData.append("description", category.description);
    formData.append("status", category.status);

     return this.http.patch(apiUrl+'category/update/'+id, formData, {
      reportProgress: true,
      observe: 'events'
     });
  }
  update(category: Category,id:number) {
     return this.http.patch(apiUrl+'category/update/'+id, category);
  }

  updateStatus(category: Category) {
     return this.http.patch(apiUrl+'category/update_status', category);
  }

  delete(id: number) {
        return this.http.delete(apiUrl+'category/del/' + id);
  }

}
