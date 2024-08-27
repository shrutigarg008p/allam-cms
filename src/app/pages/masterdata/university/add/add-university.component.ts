import { Component, OnInit } from '@angular/core';

import { Masterdata } from '../../../../models/masterdata';
import { MasterdataService } from '../../../../services/masterdata.service';
import {ToasterModule, ToasterService} from 'angular2-toaster';
import { FormBuilder, FormGroup, FormArray, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ValueTransformer } from '@angular/compiler/src/util';


@Component({
  selector: 'app-university',
  templateUrl: './add-university.component.html',
  styleUrls: ['./add-university.component.scss']
})
export class AddUniversityComponent implements OnInit 
{
  loginUser:any;
  loginId:number;
  masterdata: Masterdata[];
  permissions: any[];
  isNewRole: boolean;
  newRole: any = {};
  nameLabel: string;
  private toasterService: ToasterService;

  masterForm: FormGroup;
  loading = false;
  submitted = false;
  returnUrl: string;
  error = '';
  
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

        }); 
  }


  
  get f() { return this.masterForm.controls; }

    onSubmit() {
        this.submitted = true;
        if (this.masterForm.invalid) {
            return;
        } 

        this.loading = true; 
        this.masterdataService.addUniversity(this.masterForm.value)
            .subscribe(
                data => {
                    if(data['status']=='200')
                    {
                       
                      this.alertService.pop('success', "Data added successfully.");
                      this.router.navigate(['masterdata/university']);
                        
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

}
