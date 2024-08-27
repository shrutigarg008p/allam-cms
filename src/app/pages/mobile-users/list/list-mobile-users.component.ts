import { Component, OnInit } from '@angular/core';
import { Users } from '../../../models/users';
import { UserService } from '../../../services/user.service';
import {ToasterModule, ToasterService} from 'angular2-toaster';

import { Router } from '@angular/router';
//import {OrderBy} from "../../../pipes/orderBy"

@Component({
  selector: 'app-mobile-users',
  templateUrl: './list-mobile-users.component.html',
  styleUrls: ['./list-mobile-users.component.scss']
})
export class ListMobileUsersComponent implements OnInit {

  users: Users[]; 
  private toasterService: ToasterService;
  term: string;
  config: any;
  filters: any;
  showModal : boolean;
  userDetail: object;
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
        this.userService.getMobileUsers().subscribe(users => { 
          this.users = users['data']; 
          this.config.totalItems=users['data'].length;
          debugger;
          this.userDetail=this.users[0];
        });
  }

  openPopup(detail){
    debugger;
    this.showModal = true;
    this.userDetail=detail;   
  }
  closePopup(){
    this.showModal = false;
    this.userDetail=this.users[0];
  }

}
