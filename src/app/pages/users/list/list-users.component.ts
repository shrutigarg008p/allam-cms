import { Component, OnInit } from '@angular/core';
import { Users } from '../../../models/users';
import { UserService } from '../../../services/user.service';
import {ToasterModule, ToasterService} from 'angular2-toaster';
import { TsupervisorService } from '../../../services/tsupervisor.service';


import { Router } from '@angular/router';
//import {OrderBy} from "../../../pipes/orderBy"

@Component({
  selector: 'app-users',
  templateUrl: './list-users.component.html',
  styleUrls: ['./list-users.component.scss']
})
export class ListUsersComponent implements OnInit {

  users: Users[]; 
  private toasterService: ToasterService;
  term: string;
  config: any;
  filters: any;

  isDesc: boolean = false;
  column: string = 'id';
  direction: number;


  showModal : boolean;
  userHeading:any;
  userTitle:any;
  userName:any;
  userEmail:any;
  userMobile:any;
  userCountry:any;

  constructor(private tsupervisorService:TsupervisorService,private userService: UserService, private router: Router,private alertService: ToasterService) {
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
        this.userService.getAll().subscribe(users => { 
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

    openPopup(user_id){
    this.showModal = true;
    this.tsupervisorService.getUserByID(user_id).subscribe(response => { 
          this.userHeading  =response[0].role_name+' Details';
          this.userTitle    ='';
          this.userName     =response[0].first_name+' '+response[0].last_name;
          this.userEmail    =response[0].email;
          this.userMobile   =response[0].phone_number;
          this.userCountry  =response[0].country;
    });
    
  }
  closePopup(){
    this.showModal = false;
    this.userHeading  ='';
    this.userTitle    ='';
    this.userName     ='';
    this.userEmail    ='';
    this.userMobile   ='';
    this.userCountry  ='';
  }

}
