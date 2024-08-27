import { Component, OnInit } from '@angular/core';

import { Masterdata } from '../../../../models/masterdata';
import { MasterdataService } from '../../../../services/masterdata.service';
import {ToasterModule, ToasterService} from 'angular2-toaster';
import { FormBuilder, FormGroup, FormArray, FormControl, Validators } from '@angular/forms';
import { ValueTransformer } from '@angular/compiler/src/util';
import { ActivatedRoute, Router } from '@angular/router';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { environment } from '../../../../../environments/environment'


@Component({
  selector: 'app-subject',
  templateUrl: './edit-subject.component.html',
  styleUrls: ['./edit-subject.component.scss']
})
export class EditSubjectComponent implements OnInit 
{
  loginUser:any;
  loginId:number;
  masterdata: Masterdata[];
  permissions: any[];
  isNewRole: boolean;
  newRole: any = {};
  nameLabel: string;
  private toasterService: ToasterService;

  userForm: FormGroup;
  loading = false;
  s3_url =environment.s3_url;
  submitted = false;
  returnUrl: string;
  error = '';
  id:number;
  preview: string;
  isFile:boolean=false;
  showModal:boolean=false;

  constructor(
  private masterdataService: MasterdataService,
  private router:Router,
  private activeAouter: ActivatedRoute, 
  private alertService: ToasterService,
  private fb: FormBuilder,
  
  ) 
  {}



    ngOnInit() {
        this.id = this.activeAouter.snapshot.params['masterId'];
        console.log(this.id)
        this.getDetail(this.id);
        this.userForm = this.fb.group({
            name: ['', Validators.required],
            icon: [null],
            isFile:[this.isFile]

        });
       
        
  }

  private getDetail(id) {
        this.masterdataService.subjectById(id).subscribe(response => { 
        const userData =response['data'][0];
        this.userForm.patchValue({
            name: userData.name,
          });
          this.croppedImage = this.s3_url+userData.icon;
         
        });
  }


  
  get f() { return this.userForm.controls; }

  
    onSubmit() {

        this.submitted = true;
        if (this.userForm.invalid) {
            return;
        } 
 
        this.loading = true; 
        this.masterdataService.updateSubject(this.userForm.value,this.id)
            .subscribe(
                data => {
                    if(data['status']=='200')
                    {
                       
                      this.alertService.pop('success', "Data updated successfully.");
                      this.router.navigate(['masterdata/subject']);
                        
                    }
                    else if(data['status']=='409')
                    {
                       
                      this.alertService.pop('error', "Data already exists.");
                      this.loading = false;
                        
                    }
                    else
                    {
                      this.alertService.pop('error', "update failed. try again");
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
        this.isFile=true;
    }
    imageCropped(event: ImageCroppedEvent) {
        this.croppedImage = event.base64;
       
        this.userForm.patchValue({
          icon: this.croppedImage,
          isFile:true
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
