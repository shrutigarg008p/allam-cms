import { Component, OnInit } from '@angular/core';
import { Apphome } from '../../../models/apphome';
import { ApphomeService } from '../../../services/apphome.service';
import {ToasterModule, ToasterService} from 'angular2-toaster';
import { environment } from '../../../../environments/environment'

import { Router } from '@angular/router';
//import {OrderBy} from "../../../pipes/orderBy"

@Component({
  selector: 'app-apphome',
  templateUrl: './list-apphome.component.html',
  styleUrls: ['./list-apphome.component.scss']
})
export class ListApphomeComponent implements OnInit {
  
  page = 1;
  count = 0;
  pageSize = 10;
  pageSizes = [10, 25, 50, 100];
  sortArr = [1,2,3,4,5,6];
  s3_url =environment.s3_url;
  categories: Apphome[] = []; 
  private toasterService: ToasterService;
  term: string;
  term2: string;
  config: any;
  filters: any;

  isDesc: boolean = false;
  column: string = 'id';
  direction: number;

  constructor(private apphomeService: ApphomeService, private router: Router,private alertService: ToasterService) {
    this.term = ""; 
    this.alertService = alertService; 
    this.config = {
      itemsPerPage: 10,
      currentPage: 1,
      totalItems: 0
    };
  }

  ngOnInit() {
    this.getAllCategory();
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

  private getAllCategory() 
  {
      const params = this.getRequestParams(this.term, this.page, this.pageSize);
     // console.log(params);
      this.apphomeService.getAll().subscribe(categories => { 
        this.categories = categories; 
        this.config.totalItems=categories.length;
      });
  }

  changeStatus(category: Apphome) 
  {
    console.log(category);
    if(category.status==0){
      category.status=1;
    }
    else{
      category.status=0;
    }
   
    this.apphomeService.updateStatus(category)
    .subscribe(
        data => {
        console.log(data);
           this.alertService.pop('success', 'Data updated successfully');
           //this.router.navigate(['/apphome']);
        },
        error => {
          this.alertService.pop('error', error);
     });
    console.log('category updated');
    
  }

  updateOrder(event,id) 
  {
   let _sort_order=event;
   let _id=id;
    this.apphomeService.updateOrder(_sort_order,_id)
    .subscribe(
        data => {
           this.alertService.pop('success', 'Order updated successfully');
        },
        error => {
          this.alertService.pop('error', error);
     });
    console.log('order updated');

  }
  deleteCategory(id) {
  	if(confirm("Are you sure to delete "+name)) {
    this.apphomeService.delete(id).subscribe(() => {  this.alertService.pop('success', 'Category deleted successfully');
    this.getAllCategory() 
    });
    }
  }

  //custom search & pagination
 getRequestParams(searchText, page, pageSize): any { 
    let params = {};

    if (searchText) {
      params[`searchText`] = searchText;
    }
    else{
      params[`searchText`] =0;
    }

    if (page) {
      params[`page`] = page - 1;
    }

    if (pageSize) {
      params[`size`] = pageSize;
    }

    return params;
  }


 handlePageChange(event): void {
    this.page = event;
    this.getAllCategory();
  }

  handlePageSizeChange(event): void {
    this.pageSize = event.target.value;
    this.page = 1;
    this.getAllCategory();
  }
}
