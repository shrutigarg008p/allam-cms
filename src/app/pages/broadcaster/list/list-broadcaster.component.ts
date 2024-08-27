import { Component, OnInit } from '@angular/core';
import { Users } from '../../../models/users';
import { UserService } from '../../../services/user.service';
import {ToasterModule, ToasterService} from 'angular2-toaster';

import { Router } from '@angular/router';
//import {OrderBy} from "../../../pipes/orderBy"

@Component({
  selector: 'app-broadcaster',
  templateUrl: './list-broadcaster.component.html',
  styleUrls: ['./list-broadcaster.component.scss']
})
export class ListBroadcasterComponent implements OnInit {

  users: Users[]; 
  private toasterService: ToasterService;
  term: string;
  config: any;
  filters: any;

  isDesc: boolean = false;
  column: string = 'id';
  direction: number;

  constructor(private userService: UserService, private router: Router,private alertService: ToasterService) {
    this.term = ""; 
    this.alertService = alertService; 
    this.config = {
      itemsPerPage: 5,
      currentPage: 1,
      totalItems: 0
    };
  }

  ngOnInit() {
    this.getAllUser();
  }

  pageChanged(event){
    this.config.currentPage = event;
  }

  sort(property){
    console.log(property);
      this.isDesc = !this.isDesc; //change the direction    
      this.column = property;
      this.direction = this.isDesc ? 1 : -1;
  }

  private getAllUser() {
        this.userService.getBroadcaster().subscribe(users => { 
        this.users = users['data']; 
        this.config.totalItems=users['data'].length;
        });
  }

  changeStatus(user: Users) 
  {
    console.log(user);
    if(user.status=="0"){
      user.status="1";
    }
    else{
      user.status="0";
    }
   
    this.userService.updateStatus(user,user.id)
    .subscribe(
        data => {
        console.log(data);
           this.alertService.pop('success', 'Status updated successfully');
           this.router.navigate(['/users']);
        },
        error => {
          this.toasterService.pop('error', error);
     });
    console.log('user updated');
    
  }

}
