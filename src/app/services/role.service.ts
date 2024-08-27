import { Injectable } from '@angular/core';
import { Router , ActivatedRoute } from '@angular/router';
import { HttpClient, HttpParams, HttpHeaders} from '@angular/common/http';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import { Role } from '../models/role';
import { Permission } from '../models/permission';
import { environment } from '../../environments/environment'

const apiUrl =environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class RoleService {


  constructor(private http: HttpClient, private router: Router,  private route: ActivatedRoute,) { }

   
  getAll() {
      return this.http.get<Role[]>(apiUrl+'user/roles');
  }

  getAllPermission() {
      return this.http.get<Permission[]>(apiUrl+'user/permissions');
  }


  createRole(role: Role) {
    return this.http.post(apiUrl+'user/create_role', role);
  }

  getById(id: number) {
        return this.http.get(apiUrl+'user/role/' + id);
  }

  updateStatus(role: Role,id) {
     return this.http.patch(apiUrl+'user/update_role_status/'+id, role);
  }

  updateRole(role: Role,id) {
     return this.http.patch(apiUrl+'user/update_role/'+id, role);
  }

  delete(id: number) {
        return this.http.delete(apiUrl+'user/role/' + id);
  }

}
