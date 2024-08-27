import { Component, OnInit } from '@angular/core';

import { Masterdata } from '../../../../models/masterdata';
import { MasterdataService } from '../../../../services/masterdata.service';
import {ToasterModule, ToasterService} from 'angular2-toaster';
import { FormBuilder, FormGroup, FormArray, FormControl, Validators } from '@angular/forms';
import { ValueTransformer } from '@angular/compiler/src/util';
import { ActivatedRoute, Router } from '@angular/router';


@Component({
  selector: 'app-subquiz',
  templateUrl: './edit-subquiz.component.html',
  styleUrls: ['./edit-subquiz.component.scss']
})
export class EditSubquizComponent implements OnInit 
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
  submitted = false;
  returnUrl: string;
  error = '';
  id:number;
  
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

        });
       
        
  }

  private getDetail(id) {
        this.masterdataService.subQuizById(id).subscribe(response => { 
        const userData =response['data'][0];
        this.userForm.patchValue({
            name: userData.name,
          });
         
        });
  }


  
  get f() { return this.userForm.controls; }

  



    onSubmit() {
        this.submitted = true;
        if (this.userForm.invalid) {
            return;
        } 
 
        this.loading = true; 
        this.masterdataService.updateSubQuiz(this.userForm.value,this.id)
            .subscribe(
                data => {
                    if(data['status']=='200')
                    {
                       
                      this.alertService.pop('success', "Data updated successfully.");
                      this.router.navigate(['masterdata/sub-quiz']);
                        
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

}
