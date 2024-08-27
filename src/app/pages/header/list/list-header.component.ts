import { Component, OnInit } from '@angular/core';
import { Header } from '../../../models/header';
import { HeaderService } from '../../../services/header.service';
import {ToasterModule, ToasterService} from 'angular2-toaster';

import { Router } from '@angular/router';
//import {OrderBy} from "../../../pipes/orderBy"

@Component({
  selector: 'app-header',
  templateUrl: './list-header.component.html',
  styleUrls: ['./list-header.component.scss']
})
export class ListHeaderComponent implements OnInit {
  page = 1;
  count = 0;
  pageSize = 5;
  pageSizes = [5, 10, 25, 50, 100];

  categories: Header[] = []; 
  private toasterService: ToasterService;
  term: string;
  term2: string;
  config: any;
  filters: any;

  isDesc: boolean = false;
  column: string = 'id';
  direction: number;

  constructor(private headerService: HeaderService, private router: Router,private alertService: ToasterService) {
    this.term = ""; 
    this.alertService = alertService; 
    this.config = {
      itemsPerPage: 5,
      currentPage: 1,
      totalItems: 0
    };
  }

  ngOnInit() {
    this.getAllHeader();
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

  private getAllHeader() 
  {
      const params = this.getRequestParams(this.term, this.page, this.pageSize);
      console.log(params);
        this.headerService.getAll().subscribe(categories => { 
        this.categories = categories; 
        this.config.totalItems=categories.length;
        });
  }

  changeStatus(category: Header) 
  {
    console.log(category);
    if(category.status=="0"){
      category.status="1";
    }
    else{
      category.status="0";
    }
   
    this.headerService.updateStatus(category)
    .subscribe(
        data => {
        console.log(data);
           this.alertService.pop('success', 'Header updated successfully');
           //this.router.navigate(['/header']);
        },
        error => {
          this.toasterService.pop('error', error);
     });
    console.log('category updated');
    
  }

  deleteHeader(id) {
  	if(confirm("Are you sure to delete "+name)) {
    this.headerService.delete(id).subscribe(() => {  this.alertService.pop('success', 'Header deleted successfully');
    this.getAllHeader() 
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
    this.getAllHeader();
  }

  handlePageSizeChange(event): void {
    this.pageSize = event.target.value;
    this.page = 1;
    this.getAllHeader();
  }

}
