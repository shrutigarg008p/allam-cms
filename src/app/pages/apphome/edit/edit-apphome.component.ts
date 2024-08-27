import { Component, OnInit } from '@angular/core';

import { Apphome } from '../../../models/apphome';
import { ApphomeService } from '../../../services/apphome.service';
import {ToasterModule, ToasterService} from 'angular2-toaster';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormControl} from "@angular/forms";
import { HttpEvent, HttpEventType } from '@angular/common/http';
import { ImageCroppedEvent } from 'ngx-image-cropper';

import { environment } from '../../../../environments/environment'
import Swal from 'sweetalert2/dist/sweetalert2.js';

@Component({
  selector: 'app-apphome',
  templateUrl: './edit-apphome.component.html',
  styleUrls: ['./edit-apphome.component.scss']
})
export class EditApphomeComponent implements OnInit {
  sortArr = [1,2,3,4,5,6];
  isCutomArr = [{"id":1,"name":"Yes"},{"id":0,"name":"No"}];
  isGuestArr = [{"id":1,"name":"Yes"},{"id":0,"name":"No"}];
  loading:boolean=false;
  s3_url =environment.s3_url;
  categories: Apphome[] = [];
  categoryForm: boolean;
  isNewCategory: boolean;
  newCategory: any = {};
  editCategoryForm: boolean;
  editedCategory: any = {};
  id: number;
  _is_custom:any=0;
  _is_guest:any=0;
  private toasterService: ToasterService;

  preview: string;
  preview2: string;
  form: FormGroup;
  percentDone: any = 0;
  uploadError: string;
  //preview: string;
  submitted: boolean=false;
  isFile:boolean=false;
  isFile2:boolean=false;
  showModal:boolean=false;
  showModal2:boolean=false;
  constructor(public fb: FormBuilder, private apphomeService: ApphomeService, private activeAouter: ActivatedRoute, private router: Router,private alertService: ToasterService) { }

  ngOnInit() {
    this.id = this.activeAouter.snapshot.params['apphomeId'];
    this.form = this.fb.group({
      default_name: ['',Validators.required],
      custom_name: [''],
      is_custom: [''],
      is_guest: [''],
      sort_order: [''],
      status : [''],
      default_image: [null],
      custom_image: [null],
    })

    this.getDetail(this.id);
  }
 

  private getDetail(id) {
        this.apphomeService.getById(id).subscribe(categories => { 
        this.editedCategory = categories[0];  
        this.form.patchValue({
            default_name: categories[0].default_name,
            custom_name: categories[0].custom_name,
            is_custom: categories[0].is_custom,
            is_guest: categories[0].is_guest,
            sort_order: categories[0].sort_order,
            status: categories[0].status,
            //is_active: categories.is_active,
            id: categories[0].id
          });
          this.preview = this.s3_url+categories[0].default_image;
          this.croppedImage = this.s3_url+categories[0].default_image;

          this.preview2 = this.s3_url+categories[0].custom_image;
          this.croppedImage2 = this.s3_url+categories[0].custom_image;
          this._is_custom=categories[0].is_custom;
          this._is_guest=categories[0].is_guest;
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
      default_image: file
    });
    this.form.get('default_image').updateValueAndValidity()

    // File Preview
    const reader = new FileReader();
    reader.onload = () => {
      this.preview = reader.result as string;
    }
    reader.readAsDataURL(file)
  }


  updateCategory() 
  {
    this.submitted=true;
     if (this.form.invalid) {
        return;
    }
    
    this.editedCategory.default_name  = this.form.value.default_name;
    this.editedCategory.default_image = this.form.value.default_image;

    this.editedCategory.is_custom     = this.form.value.is_custom;
    this.editedCategory.is_guest     = this.form.value.is_guest;
    if(this.form.value.is_custom==1)
    {
     if(this.form.value.custom_name==''){
        Swal.fire('','Custom competition name is required','error');
        return;
     }
      this.editedCategory.custom_name   = this.form.value.custom_name;
      this.editedCategory.custom_image  = this.form.value.custom_image;
    }
    this.editedCategory.sort_order    = this.form.value.sort_order;
    this.editedCategory.isFile        = this.isFile;
    this.editedCategory.isFile2       = this.isFile2;
    this.loading=true;
     this.apphomeService.update(this.editedCategory,this.id)
       .subscribe(res => {
          this.alertService.pop('success', 'Data updated successfully');
          this.percentDone = false;
          this.submitted=false;
          this.loading=false;
          this.router.navigate(['/apphome']);
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
          default_image: this.croppedImage
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


    ////
    //image cropping2
    imageChangedEvent2: any = '';
    croppedImage2: any = '';
  
    fileChangeEvent2(event: any): void {
        this.imageChangedEvent2 = event;
        this.showModal2 = true;
        this.isFile2=true;
    }
    imageCropped2(event: ImageCroppedEvent) {
        this.croppedImage2 = event.base64;
       
        this.form.patchValue({
          custom_image: this.croppedImage2
        });
        this.isFile2=true;

    }
    imageLoaded2() {
        /* show cropper */
    }
    cropperReady2() {
        /* cropper ready */
    }
    loadImageFailed2() {
        /* show message */
        this.alertService.pop('error', 'Please upload image only');
    }
    closePopup2(){
      this.showModal2 = false;
    }

 isCutom(event: any) {
  this._is_custom=event;
  console.log("_is_custom-->"+this._is_custom+'<<--')
 }
 isGuest(event: any) {
  this._is_guest=event;
  console.log("_is_guest-->"+this._is_guest+'<<--')
 }
}
