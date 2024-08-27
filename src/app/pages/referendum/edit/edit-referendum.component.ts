import { Component, OnInit } from '@angular/core';

import { Users } from '../../../models/users';
import { Permission } from '../../../models/permission';
import { UserService } from '../../../services/user.service';
import {ToasterModule, ToasterService} from 'angular2-toaster';
import { FormBuilder, FormGroup, FormArray, FormControl, Validators } from '@angular/forms';
import { ValueTransformer } from '@angular/compiler/src/util';
import { ConfirmedValidator } from '../../../confirmed.validator';
import { AuthenticationService } from '../../../services';
import { ActivatedRoute, Router } from '@angular/router';


@Component({
  selector: 'app-referendum',
  templateUrl: './edit-referendum.component.html',
  styleUrls: ['./edit-referendum.component.scss']
})
export class EditReferendumComponent implements OnInit 
{
  loginUser:any;
  loginId:number;
  users: Users[];
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
  private userService: UserService,
  private router:Router,
  private activeAouter: ActivatedRoute, 
  private alertService: ToasterService,
  private fb: FormBuilder,
  private authenticationService: AuthenticationService,
  ) 
  {}



    ngOnInit() {
        this.id = this.activeAouter.snapshot.params['userId'];
        this.getDetail(this.id);
        this.nameLabel='Company Name';
        this.userForm = this.fb.group({
            register_as: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            first_name: ['', Validators.required],
            last_name: ['', Validators.required],
            mobile: ['', Validators.required],
            country: ['', Validators.required],
            website:[''],
            user_avatar:[null],

        });
        this.getloginUserId();
        
  }

  private getDetail(id) {
        this.userService.userById(id).subscribe(user => { 
        const userData =user['data'][0];
        this.userForm.patchValue({
            register_as: userData.role_id,
            email: userData.email,
            first_name: userData.first_name,
            last_name: userData.last_name,
            country: userData.country,
            mobile: userData.phone_number,
           
          });
         
        });
  }

  getloginUserId(){
        this.loginUser      = this.authenticationService.currentUserValue;
        this.loginUser      = JSON.parse(this.loginUser);
        this.loginId        = this.loginUser.user[0].id;
  }

  
  get f() { return this.userForm.controls; }

  
  emailValidator()
    {
        console.log(this.f.email.value);
        const q = new Promise((resolve, reject) => {
            setTimeout(() => {
            this.userService.isEmaiIDExist(this.f.email.value)
            .subscribe(res => {console.log(res['status'])
              if(res['status']==true)
              {
                resolve({ 'isEmailExist': true }) 
              }else
              {
                resolve(null)
              }
            });
          }, 1000);

        });
        return q;
    }


    onSubmit() {
        this.submitted = true;
        if (this.userForm.invalid) {
            return;
        } 

        this.userForm.value.created_by=this.loginId;
 
        this.loading = true; 
        this.userService.updateUser(this.userForm.value,this.id)
            .subscribe(
                data => {
                    if(data['status']=='200')
                    {
                       
                      this.alertService.pop('success', "User updated successfully.");
                      this.router.navigate(['users']);
                        
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

  cancelNewRole() {
    this.newRole = {};
  }
}
