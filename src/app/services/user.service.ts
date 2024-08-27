import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import { Signup } from '../models';

@Injectable({ providedIn: 'root' })
export class UserService {
    constructor(private http: HttpClient) { }

    getAll() {
        return this.http.get<Signup[]>(environment.apiUrl+'user/get_all');
    }

    getBroadcaster() {
        return this.http.get<Signup[]>(environment.apiUrl+'user/get_broadcaster');
    }

    getMobileUsers() {
        return this.http.get<Signup[]>(environment.apiUrl+'user/get_mobile_users');
    }

    isEmaiIDExist(email: string) {
        return this.http.get(environment.apiUrl+'user/check_email/'+email);
    }

    signup(signup: Signup) 
    {
      var formData: any = new FormData();
      formData.append("register_as", signup.register_as);
      formData.append("user_avatar", signup.user_avatar);
      formData.append("name", signup.name);
      formData.append("email", signup.email);
      formData.append("mobile", signup.mobile);
      formData.append("country", signup.country);
      formData.append("website", signup.website);
      formData.append("password", signup.password);

      return this.http.post(environment.apiUrl+'user/signup', formData);
  	}

    verifyEmail(id: string) {
        return this.http.get(environment.apiUrl+'user/verify_email/'+id);
    }

    verifyCheckEmail(id: string) {
        return this.http.get(environment.apiUrl+'user/verify_check_email/'+id);
    }


    forgot(email: string) {
     return this.http.get(environment.apiUrl+'user/forgot_password/'+email);
    }

    resetPassword(signup: Signup) {
     return this.http.patch(environment.apiUrl+'user/reset_password', signup);
    }

    updateStatus(user: Signup,id) {
     return this.http.patch(environment.apiUrl+'user/update_user_status/'+id, user);
    }
    
    addUser(signup: Signup) 
    {
      return this.http.post(environment.apiUrl+'user/add_user', signup);
    }

    addBroadcaster(signup: Signup) 
    {
      return this.http.post(environment.apiUrl+'user/add_broadcaster', signup);
    }
    
    userById(id: number) {
     return this.http.get(environment.apiUrl+'user/user_by_id/'+id);
    }

    generatePassword(signup: Signup) {
     return this.http.patch(environment.apiUrl+'user/generate_password', signup);
    }

    changePassword(signup: Signup) {
     return this.http.patch(environment.apiUrl+'user/change_password', signup);
    }

    updateUser(user: Signup,id) {
       return this.http.patch(environment.apiUrl+'user/update_user/'+id, user);
    }

    delete(id: number) {
          //return this.http.delete(environment.apiUrl+'user/delete/' + id);
    }

    getCountry() {
     return this.http.get(environment.apiUrl+'user/get_all_country');
    }

    sendMessage(data){
        return this.http.post(environment.apiUrl+'message/send' , data);
    }

    viewRequestList(){
        return this.http.get(environment.apiUrl+'message/get-RequestList');
    }

    seenMessages(data){
        return this.http.post(environment.apiUrl+'message/get-message' , data);
    }

    readMessage(id , data){
        return this.http.put(environment.apiUrl+'message/read-message/'+id ,data);
    }

    notificationUnread(){
        return this.http.get(environment.apiUrl+'message/get-MessageNotification');
    }

}