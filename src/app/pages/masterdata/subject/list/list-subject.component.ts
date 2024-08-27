import { Component, OnInit } from '@angular/core';
import { Masterdata } from '../../../../models/masterdata';
import { MasterdataService } from '../../../../services/masterdata.service';
import {ToasterModule, ToasterService} from 'angular2-toaster';

import { Router } from '@angular/router';
//import {OrderBy} from "../../../../pipes/orderBy"

@Component({
  selector: 'app-subject',
  templateUrl: './list-subject.component.html',
  styleUrls: ['./list-subject.component.scss']
})
export class ListSubjectComponent implements OnInit {

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
    this.getAll();
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

  private getAll() {
        this.masterdataService.getAll('subject').subscribe(response => { 
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

   
    this.masterdataService.updateStatus(masterdata,'subject')
    .subscribe(
        data => {
        console.log(data);
           this.alertService.pop('success', 'Status updated successfully');
           this.router.navigate(['/masterdata/subject']);
        },
        error => {
          this.toasterService.pop('error', error);
     });
    console.log('user updated');
    
  }

}
