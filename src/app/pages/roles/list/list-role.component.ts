import { Component, OnInit } from '@angular/core';
import { Role } from '../../../models/role';
import { RoleService } from '../../../services/role.service';
import {ToasterModule, ToasterService} from 'angular2-toaster';

import { Router } from '@angular/router';
//import {OrderBy} from "../../../pipes/orderBy"

@Component({
  selector: 'app-role',
  templateUrl: './list-role.component.html',
  styleUrls: ['./list-role.component.scss']
})
export class ListRoleComponent implements OnInit {

  roles: Role[]; 
  private toasterService: ToasterService;
  term: string;
  config: any;
  filters: any;

  isDesc: boolean = false;
  column: string = 'id';
  direction: number;

  constructor(private roleService: RoleService, private router: Router,private alertService: ToasterService) {
    this.term = ""; 
    this.alertService = alertService; 
    this.config = {
      itemsPerPage: 5,
      currentPage: 1,
      totalItems: 0
    };
  }

  ngOnInit() {
    this.getAllRole();
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

  private getAllRole() {
        this.roleService.getAll().subscribe(roles => { 
        this.roles = roles['data']; 
        this.config.totalItems=roles['data'].length;
        });
  }

  changeStatus(role: Role) 
  {
    console.log(role);
    if(role.status=="0"){
      role.status="1";
    }
    else{
      role.status="0";
    }
   
    this.roleService.updateStatus(role,role.id)
    .subscribe(
        data => {
        console.log(data);
           this.alertService.pop('success', 'Status updated successfully');
           this.router.navigate(['/role']);
        },
        error => {
          this.toasterService.pop('error', error);
     });
    console.log('Role updated');
    
  }

  deleteRole(id) {
  	if(confirm("Are you sure to delete "+name)) {
    this.roleService.delete(id).subscribe(() => {  this.alertService.pop('success', 'Role deleted successfully');
    this.getAllRole() 
    });
    }
  }
}
