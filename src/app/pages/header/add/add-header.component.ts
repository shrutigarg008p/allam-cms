import { Component, OnInit } from '@angular/core';

import { Header } from '../../../models/header';
import { Category } from '../../../models/category';
import { HeaderService } from '../../../services/header.service';
import {ToasterModule, ToasterService} from 'angular2-toaster';

import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators,FormControl  } from "@angular/forms";
import { HttpEvent, HttpEventType } from '@angular/common/http';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { ImageCroppedEvent } from 'ngx-image-cropper';

@Component({
  selector: 'app-header',
  templateUrl: './add-header.component.html',
  styleUrls: ['./add-header.component.scss']
})
export class AddHeaderComponent implements OnInit {
  
  newHeader: any = {};
  private toasterService: ToasterService;

  dropdownList: any = [];
  selectedItems: any = [];
  dropdownSettings:IDropdownSettings = {};
  isTitleExist =false;
  preview: string;
  form: FormGroup;
  percentDone: any = 0;
  submitted: boolean=false;
  //categories: any = [];
  showModal:boolean=false;
  loading:boolean=false;

  constructor(public fb: FormBuilder, private headerService: HeaderService, private router:Router ,private alertService: ToasterService) { 
    // Reactive Form
    this.form = this.fb.group({
      title: ['',Validators.required],
      description: [''],
      status : [''],
      avatar: [null],
      categories: ['']
    })
  }

  ngOnInit() {
    this.getAllCategory();

    //console.log(this.selectedItems);
    //console.log(this.categories);
    /*this.dropdownList = [
      { item_id: 1, item_text: 'Mumbai' },
      { item_id: 2, item_text: 'Bangaluru' },
      { item_id: 3, item_text: 'Pune' },
      { item_id: 4, item_text: 'Navsari' },
      { item_id: 5, item_text: 'New Delhi' }
    ];*/
    //this.selectedItems = [
      /*{ item_id: 3, item_text: 'Pune' },
      { item_id: 4, item_text: 'Navsari' }*/
    //];
    this.dropdownSettings = {
      singleSelection: false,
      idField: 'id',
      textField: 'title',
      enableCheckAll : false,
      searchPlaceholderText: 'Search Categories',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 3,
      allowSearchFilter: true
    };
  }


  onItemSelect(item: any) { 
    //this.selectedItems.push(item);
    console.log(item);
    //console.log(this.selectedItems);
  }
  onSelectAll(items: any) {
    console.log(items);
  }

  private getAllCategory() {
        this.headerService.getCategory().subscribe(categories => { 
        this.dropdownList = categories; ;
        //console.log(this.dropdownList);
        });
  }
  
// Image Preview
  uploadFile(event) {
    const file = (event.target as HTMLInputElement).files[0];
    this.form.patchValue({
      avatar: file
    });
    this.form.get('avatar').updateValueAndValidity()

    // File Preview
    const reader = new FileReader();
    reader.onload = () => {
      this.preview = reader.result as string;
    }
    reader.readAsDataURL(file)
  }


  saveHeader() {
    this.submitted=true;
    if (this.form.invalid) {
        return;
    }
     if(this.isTitleExist)
    {
        this.alertService.pop('error', 'Header name already exits.');
        return false
    }
    if(this.selectedItems.length==0){
      Swal.fire('','Please select category.','error');
      return;
    }
    this.loading=true;
    //console.log(this.form.value);
    this.newHeader.title  = this.form.value.title;
    this.newHeader.icon  = this.form.value.avatar;
    this.newHeader.description  = this.form.value.description;
    this.newHeader.status  = this.form.value.status;
    this.newHeader.categories  = this.form.value.categories;

     if(this.newHeader.status)
      {
        this.newHeader.status='1';
      }
      else{
        this.newHeader.status='0';
      }
      console.log(this.newHeader);
        this.headerService.addHeader(this.newHeader)
       .subscribe(res => {
         this.alertService.pop('success', 'Header added successfully');
              this.percentDone = false;
              this.submitted=false;
              this.loading=false;
              this.router.navigate(['/header']);
       })

        /*
        this.headerService.addHeader(this.newHeader)
            .subscribe((event: HttpEvent<any>) => {
            switch (event.type) {
              case HttpEventType.Sent:
                console.log('Request has been made!');
                break;
              case HttpEventType.ResponseHeader:
                console.log('Response header has been received!');
                break;
              case HttpEventType.UploadProgress:
                this.percentDone = Math.round(event.loaded / event.total * 100);
                console.log(`Uploaded! ${this.percentDone}%`);
                break;
              case HttpEventType.Response:             
              this.alertService.pop('success', 'Header added successfully');
              this.percentDone = false;
              this.hideLoader(); 
              this.submitted=false;
              this.router.navigate(['/header']);

      }
    })*/

    }


  cancelNewCategory() {
    this.newHeader = {};
  }

  // Function is defined 
      hideLoader() { 
  
            // Setting display of spinner 
            // element to none 
            document.getElementById('loading-s') 
                .style.display = 'none'; 
        }
        showLoader() { 
  
            // Setting display of spinner 
            // element to none 
            document.getElementById('loading-s') 
                .style.display = 'block'; 
        }
  get f() { return this.form.controls; }
  onKey(event){
    this.headerService.checkCategory({"title": event.target.value})
    .subscribe(
    response => { 
      if(response['status']==1)
      {
        this.isTitleExist=true;
        this.alertService.pop('error', 'Header name already exits.');
      }
      else{
        this.isTitleExist=false;
      }
      return;
      
    },
    error => {
        this.alertService.pop('error', 'Something went wrong. Try again later.');
    });
  }

  //image cropping
    imageChangedEvent: any = '';
    croppedImage: any = '';
  
    fileChangeEvent(event: any): void {
        this.imageChangedEvent = event;
        this.showModal = true;
    }
    imageCropped(event: ImageCroppedEvent) {
        this.croppedImage = event.base64;
       
        this.form.patchValue({
          avatar: this.croppedImage
        });

    }
    imageLoaded() {
        /* show cropper */
    }
    cropperReady() {
        /* cropper ready */
    }
    loadImageFailed() {
        /* show message */
      this.alertService.pop('error', 'Please upload image only');
    }
    closePopup(){
      this.showModal = false;
    }

}
