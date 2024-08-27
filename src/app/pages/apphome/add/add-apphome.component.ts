import { Component, OnInit } from '@angular/core';

import { Apphome } from '../../../models/apphome';
import { ApphomeService } from '../../../services/apphome.service';
import {ToasterModule, ToasterService} from 'angular2-toaster';

import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators,FormControl } from "@angular/forms";
import { HttpEvent, HttpEventType } from '@angular/common/http';
import { ImageCroppedEvent } from 'ngx-image-cropper';

@Component({
  selector: 'app-apphome',
  templateUrl: './add-apphome.component.html',
  styleUrls: ['./add-apphome.component.scss']
})
export class AddApphomeComponent implements OnInit {
  loading:boolean=false;
  categories: Apphome[];
  isNewCategory: boolean;
  newCategory: any = {};
  private toasterService: ToasterService;
  isTitleExist=false;
  preview: string;
  form: FormGroup;
  percentDone: any = 0;
  submitted: boolean=false;
  showModal:boolean=false;

  
  constructor(public fb: FormBuilder, private apphomeService: ApphomeService, private router:Router ,private alertService: ToasterService) { 
    // Reactive Form
    this.form = this.fb.group({
      title: ['',Validators.required],
      description: [''],
      status : [''],
      avatar: [null]
    })
  }

  ngOnInit() {
    
  }

//   fileProgress(fileInput: any) {
//       this.fileData = <File>fileInput.target.files[0];
//       this.preview();
//   }
   
//   preview() {
//       // Show preview 
//       var mimeType = this.fileData.type;
//       if (mimeType.match(/image\/*/) == null) {
//         return;
//       }
   
//       var reader = new FileReader();      
//       reader.readAsDataURL(this.fileData); 
//       reader.onload = (_event) => { 
//         this.previewUrl = reader.result; 
//       }
//   }

//  onSubmit() {
//     const formData = new FormData();
//       formData.append('file', this.fileData);
//       this.http.post('url/to/your/api', formData)
//         .subscribe(res => {
//           console.log(res);
//           this.uploadedFilePath = res.data.filePath;
//           alert('SUCCESS !!');
//         })
// }

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

  get f() { return this.form.controls; }

  onKey(event){
    this.apphomeService.checkApphome({"title": event.target.value})
    .subscribe(
    response => { 
      if(response['status']==1)
      {
        this.alertService.pop('error', 'Category already exits.');
         this.isTitleExist=true;
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

  saveCategory() 
  {
    this.submitted=true;

     if (this.form.invalid) {
        return;
    }
    if(this.isTitleExist)
    {
        this.alertService.pop('error', 'Category already exits.');
        return false
    }
    this.loading=false; 

    this.newCategory.title  = this.form.value.title;
    this.newCategory.icon  = this.form.value.avatar;
    this.newCategory.description  = this.form.value.description;
    this.newCategory.status  = this.form.value.status;

     if(this.newCategory.status)
      {
        this.newCategory.status='1';
      }
      else{
        this.newCategory.status='0';
      }
       this.apphomeService.addApphome(this.newCategory)
       .subscribe(res => {
         this.alertService.pop('success', 'Category added successfully');
              this.percentDone = false;
              this.submitted=false;
              this.loading=false;
              this.router.navigate(['/apphome']);
       })
    }


  cancelNewCategory() {
    this.newCategory = {};
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
