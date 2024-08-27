import { Component, OnInit } from '@angular/core';
import { Masterdata } from '../../../../models/masterdata';
import { MasterdataService } from '../../../../services/masterdata.service';
import {ToasterModule, ToasterService} from 'angular2-toaster';

import { Router } from '@angular/router';
//import {OrderBy} from "../../../../pipes/orderBy"

@Component({
  selector: 'app-school',
  templateUrl: './list-school.component.html',
  styleUrls: ['./list-school.component.scss']
})
export class ListSchoolComponent implements OnInit {

  masterdata: Masterdata[]; 
  private toasterService: ToasterService;
  term: string;
  config: any;
  filters: any;

  isDesc: boolean = false;
  column: string = 'id';
  direction: number;

  constructor(private masterdataService: MasterdataService, private router: Router,private alertService: ToasterService) {
    this.term = ""; 
    this.alertService = alertService; 
    this.config = {
      itemsPerPage: 5,
      currentPage: 1,
      totalItems: 0
    };
  }

  ngOnInit() {
    this.getAllSchool();
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

  private getAllSchool() {
        this.masterdataService.getAll('school').subscribe(response => { 
        this.masterdata = response['data']; 
        this.config.totalItems=response['data'].length;
        });
  }

  changeStatus(masterdata: Masterdata) 
  {
    console.log(masterdata);
    if(masterdata.status=="0"){
      masterdata.status="1";
    }
    else{
      masterdata.status="0";
    }

   
    this.masterdataService.updateStatus(masterdata,'school')
    .subscribe(
        data => {
        console.log(data);
           this.alertService.pop('success', 'Status updated successfully');
           this.router.navigate(['/masterdata/school']);
        },
        error => {
          this.toasterService.pop('error', error);
     });
    console.log('user updated');
    
  }

}
