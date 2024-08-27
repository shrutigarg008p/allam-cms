import { Component, OnInit } from '@angular/core';

import { Header } from '../../../models/header';
import { HeaderService } from '../../../services/header.service';
import {ToasterModule, ToasterService} from 'angular2-toaster';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators,FormControl} from "@angular/forms";
import { HttpEvent, HttpEventType } from '@angular/common/http';

import { IDropdownSettings } from 'ng-multiselect-dropdown';

import { environment } from '../../../../environments/environment'
import Swal from 'sweetalert2/dist/sweetalert2.js';
import { ImageCroppedEvent } from 'ngx-image-cropper';


@Component({
  selector: 'app-header',
  templateUrl: './edit-header.component.html',
  styleUrls: ['./edit-header.component.scss']
})
export class EditHeaderComponent implements OnInit {

  s3_url =environment.s3_url;
  header: Header[] = [];
  categoryForm: boolean;
  isNewCategory: boolean;
  newCategory: any = {};
  editCategoryForm: boolean;
  editedCategory: any = {};
  id: number;
  submitted:boolean=false;
  private toasterService: ToasterService;

  preview: string;

  isFile:boolean=false;
  showModal:boolean=false;
  loading:boolean=false;

  form: FormGroup;
  percentDone: any = 0;
  uploadError: string;
  //preview: string;

  dropdownList: any = [];
  selectedItems: any = [];
  dropdownSettings:IDropdownSettings = {};

  constructor(public fb: FormBuilder, private headerService: HeaderService, private activeAouter: ActivatedRoute, private router: Router,private alertService: ToasterService) { }

  ngOnInit() {
    this.id = this.activeAouter.snapshot.params['categoryId'];

    this.form = this.fb.group({
      title: ['',Validators.required],
      description: [''],
      status : [''],
      icon: [null],
      categories: ['']
    })

    this.getAllCategory();

    this.getDetail(this.id);
    this.getDetailCategories(this.id);

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
 

  private getDetail(id) {
        this.headerService.getById(id).subscribe(categories => { 
        //this.editedCategory = categories[0];  
        this.form.patchValue({
            title: categories[0].title,
            description: categories[0].description,
            status: categories[0].status,
            //is_active: categories.is_active,
            id: categories[0].id
          });
          this.preview = this.s3_url+categories[0].icon;
          this.croppedImage = this.s3_url+categories[0].icon;
        });
  }

  private getDetailCategories(id) {
        this.headerService.getByIdCategories(id).subscribe(categories => { 
        
          this.selectedItems = JSON. parse(categories[0].category_ids);
        });
  }

  /*  import * as AWS from 'aws-sdk';

  let s3= new AWS.S3();
  const url = s3.getSignedUrl('getObject', {
      Bucket: myBucket,
      Key: myKey
  })
  console.log(url)*/

  // Image Preview
  uploadFile(event) {
    const file = (event.target as HTMLInputElement).files[0];
    this.form.patchValue({
      icon: file
    });
    this.form.get('icon').updateValueAndValidity()

    // File Preview
    const reader = new FileReader();
    reader.onload = () => {
      this.preview = reader.result as string;
    }
    reader.readAsDataURL(file)
  }

  updateCategory_old() 
  {
    this.submitted=true;
    if (this.form.invalid) {
        return;
    }

    if(this.selectedItems.length==0){
      Swal.fire('','Please select category.','error');
      return;
    }

    this.editedCategory.title  = this.form.value.title;
    this.editedCategory.icon  = this.form.value.icon;
    this.editedCategory.description  = this.form.value.description;
    this.editedCategory.status  = this.form.value.status;
    this.editedCategory.categories  = this.form.value.categories;

     if(this.editedCategory.status)
      {
        this.editedCategory.status='1';
      }
      else{
        this.editedCategory.status='0';
      }
      this.editedCategory.created_at='2020-09-09';

      this.headerService.update(this.editedCategory,this.id)
            
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
              //console.log('User successfully created!', event.body);
              this.alertService.pop('success', 'Header updated successfully');
              this.percentDone = false;
              this.submitted=false;
              this.router.navigate(['/header']);
      }
    })
  }

  updateCategory() 
  {
    this.submitted=true;
    if (this.form.invalid) {
        return;
    }

    if(this.selectedItems.length==0){
      Swal.fire('','Please select category.','error');
      return;
    }
    this.loading=true;

    this.editedCategory.title  = this.form.value.title;
    this.editedCategory.icon  = this.form.value.icon;
    this.editedCategory.description  = this.form.value.description;
    this.editedCategory.status  = this.form.value.status;
    this.editedCategory.categories  = this.form.value.categories;
    this.editedCategory.isFile  =this.isFile;

     if(this.editedCategory.status)
      {
        this.editedCategory.status='1';
      }
      else{
        this.editedCategory.status='0';
      }
      this.headerService.update(this.editedCategory,this.id)
       .subscribe(res => {
          this.alertService.pop('success', 'Header updated successfully');
          this.percentDone = false;
          this.submitted=false;
          this.loading=false;
          this.router.navigate(['/header']);
      });
  }


  get f() { return this.form.controls; }

     //image cropping
    imageChangedEvent: any = '';
    croppedImage: any = '';
  
    fileChangeEvent(event: any): void {
        this.imageChangedEvent = event;
        this.showModal = true;
        this.isFile=true;
    }
    imageCropped(event: ImageCroppedEvent) {
        this.croppedImage = event.base64;
       
        this.form.patchValue({
          icon: this.croppedImage
        });
        this.isFile=true;

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
