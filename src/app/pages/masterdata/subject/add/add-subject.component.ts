import { Component, OnInit } from '@angular/core';

import { Masterdata } from '../../../../models/masterdata';
import { MasterdataService } from '../../../../services/masterdata.service';
import {ToasterModule, ToasterService} from 'angular2-toaster';
import { FormBuilder, FormGroup, FormArray, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ValueTransformer } from '@angular/compiler/src/util';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import Swal from 'sweetalert2/dist/sweetalert2.js';

@Component({
  selector: 'app-subject',
  templateUrl: './add-subject.component.html',
  styleUrls: ['./add-subject.component.scss']
})
export class AddSubjectComponent implements OnInit 
{
  loginUser:any;
  loginId:number;
  masterdata: Masterdata[];
  permissions: any[];
  isNewRole: boolean;
  newRole: any = {};
  newSubject: any = {};
  nameLabel: string;
  private toasterService: ToasterService;

  masterForm: FormGroup;
  loading = false;
  submitted = false;
  returnUrl: string;
  error = '';

  preview: string;
  percentDone: any = 0;
  showModal:boolean=false;

  constructor(
  private masterdataService: MasterdataService,
  private router:Router,
  private alertService: ToasterService,
  private fb: FormBuilder,
  ) 
  {}

  ngOnInit() {
        this.masterForm = this.fb.group({
            name: ['', Validators.required],
            icon: [null]

        }); 
  }


  
  get f() { return this.masterForm.controls; }


    onSubmit() {
    //console.log(this.masterForm.value); return;
        this.submitted = true;
        if (this.masterForm.invalid) {
            return;
        } 
        if(this.croppedImage=='')
        {
           // Swal.fire('','Please upload subject icon.','error');
            //return false
        }
        this.loading = true; 
        this.masterdataService.addSubject(this.masterForm.value)
            .subscribe(
                data => {
                    if(data['status']=='200')
                    {
                       
                      this.alertService.pop('success', "Data added successfully.");
                      this.router.navigate(['masterdata/subject']);
                        
                    }
                    else if(data['status']=='409')
                    {
                       
                      this.alertService.pop('error', "Data already exists.");
                      this.loading = false;
                        
                    }
                    else
                    {
                      this.alertService.pop('error', "failed. try again");
                      this.loading = false;
                    }
                    
                },
                error => {
                    this.error = "Something went wrong. Try again later.";
                    this.loading = false;
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
       
        this.masterForm.patchValue({
          icon: this.croppedImage
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
