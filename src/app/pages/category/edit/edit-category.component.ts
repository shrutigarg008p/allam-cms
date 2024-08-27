import { Component, OnInit } from '@angular/core';

import { Category } from '../../../models/category';
import { CategoryService } from '../../../services/category.service';
import {ToasterModule, ToasterService} from 'angular2-toaster';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormControl} from "@angular/forms";
import { HttpEvent, HttpEventType } from '@angular/common/http';
import { ImageCroppedEvent } from 'ngx-image-cropper';

import { environment } from '../../../../environments/environment'

@Component({
  selector: 'app-category',
  templateUrl: './edit-category.component.html',
  styleUrls: ['./edit-category.component.scss']
})
export class EditCategoryComponent implements OnInit {
  loading:boolean=false;
  s3_url =environment.s3_url;
  categories: Category[] = [];
  categoryForm: boolean;
  isNewCategory: boolean;
  newCategory: any = {};
  editCategoryForm: boolean;
  editedCategory: any = {};
  id: number;
  private toasterService: ToasterService;

  preview: string;
  form: FormGroup;
  percentDone: any = 0;
  uploadError: string;
  //preview: string;
  submitted: boolean=false;
  isFile:boolean=false;
  showModal:boolean=false;
  constructor(public fb: FormBuilder, private categoryService: CategoryService, private activeAouter: ActivatedRoute, private router: Router,private alertService: ToasterService) { }

  ngOnInit() {
    this.id = this.activeAouter.snapshot.params['categoryId'];
    this.form = this.fb.group({
      title: ['',Validators.required],
      description: [''],
      status : [''],
      icon: [null]
    })

    this.getDetail(this.id);
  }
 

  private getDetail(id) {
        this.categoryService.getById(id).subscribe(categories => { 
        this.editedCategory = categories[0];  
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
    this.editedCategory.title  = this.form.value.title;
    this.editedCategory.icon  = this.form.value.icon;
    this.editedCategory.description  = this.form.value.description;
    this.editedCategory.status  = this.form.value.status;

     if(this.editedCategory.status)
      {
        this.editedCategory.status='1';
      }
      else{
        this.editedCategory.status='0';
      }
      this.editedCategory.created_at='2020-09-09';

      this.categoryService.update(this.editedCategory,this.id)
            
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
              this.alertService.pop('success', 'Category updated successfully');
              this.percentDone = false;
              this.submitted=false;
              
              this.router.navigate(['/category']);
      }
    })
  }
  updateCategory() 
  {
    this.submitted=true;
     if (this.form.invalid) {
        return;
    }
    this.loading=true;
    this.editedCategory.title  = this.form.value.title;
    this.editedCategory.icon  = this.form.value.icon;
    this.editedCategory.description  = this.form.value.description;
    this.editedCategory.status  = this.form.value.status;
    this.editedCategory.isFile  =this.isFile;

     if(this.editedCategory.status)
      {
        this.editedCategory.status='1';
      }
      else{
        this.editedCategory.status='0';
      }

      this.categoryService.update(this.editedCategory,this.id)
       .subscribe(res => {
          this.alertService.pop('success', 'Category updated successfully');
          this.percentDone = false;
          this.submitted=false;
          this.loading=false;
          this.router.navigate(['/category']);
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
