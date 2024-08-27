import { Component, OnInit } from '@angular/core';
import { Category } from '../../../models/category';
import { CategoryService } from '../../../services/category.service';
import {ToasterModule, ToasterService} from 'angular2-toaster';

import { Router } from '@angular/router';
//import {OrderBy} from "../../../pipes/orderBy"

@Component({
  selector: 'app-category',
  templateUrl: './list-category.component.html',
  styleUrls: ['./list-category.component.scss']
})
export class ListCategoryComponent implements OnInit {
  
  page = 1;
  count = 0;
  pageSize = 5;
  pageSizes = [5, 10, 25, 50, 100];

  categories: Category[] = []; 
  private toasterService: ToasterService;
  term: string;
  term2: string;
  config: any;
  filters: any;

  isDesc: boolean = false;
  column: string = 'id';
  direction: number;

  constructor(private categoryService: CategoryService, private router: Router,private alertService: ToasterService) {
    this.term = ""; 
    this.alertService = alertService; 
    this.config = {
      itemsPerPage: 5,
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
      this.categoryService.getAll().subscribe(categories => { 
        this.categories = categories; 
        this.config.totalItems=categories.length;
      });
  }

  changeStatus(category: Category) 
  {
    console.log(category);
    if(category.status=="0"){
      category.status="1";
    }
    else{
      category.status="0";
    }
   
    this.categoryService.updateStatus(category)
    .subscribe(
        data => {
        console.log(data);
           this.alertService.pop('success', 'Category updated successfully');
           //this.router.navigate(['/category']);
        },
        error => {
          this.alertService.pop('error', error);
     });
    console.log('category updated');
    
  }

  deleteCategory(id) {
  	if(confirm("Are you sure to delete "+name)) {
    this.categoryService.delete(id).subscribe(() => {  this.alertService.pop('success', 'Category deleted successfully');
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
