import { Component, OnInit } from '@angular/core';

import { Users } from '../../../models/users';
import { Permission } from '../../../models/permission';
import { UserService } from '../../../services/user.service';
import {ToasterModule, ToasterService} from 'angular2-toaster';
import { FormBuilder, FormGroup, FormArray, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ValueTransformer } from '@angular/compiler/src/util';
import { ConfirmedValidator } from '../../../confirmed.validator';
import { AuthenticationService } from '../../../services';


@Component({
  selector: 'app-broadcaster',
  templateUrl: './add-broadcaster.component.html',
  styleUrls: ['./add-broadcaster.component.scss']
})
export class AddBroadcasterComponent implements OnInit 
{
  loginUser:any;
  loginId:number;
  users: Users[];
  countryArr: any[];
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
  
  constructor(
  private userService: UserService,
  private router:Router,
  private alertService: ToasterService,
  private fb: FormBuilder,
  private authenticationService: AuthenticationService,
  ) 
  {}



    ngOnInit() {
        this.nameLabel='Company Name';
        this.userForm = this.fb.group({
            register_as: ['9', Validators.required],
            email: ['', [Validators.required, Validators.email],this.emailValidator.bind(this)],
            first_name: ['', Validators.required],
            last_name: ['', Validators.required],
            mobile: [''],
            country: ['', Validators.required],
            website:[''],
            user_avatar:[null],

        });
        this.getloginUserId();
        this.getCountry();
        
  }

   private getCountry() {
        this.userService.getCountry().subscribe(res => { 
        this.countryArr = res['data']; 
       
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
        this.userService.addBroadcaster(this.userForm.value)
            .subscribe(
                data => {
                    if(data['status']=='200')
                    {
                       
                      this.alertService.pop('success', "User added successfully.");
                      this.router.navigate(['broadcaster']);
                        
                    }
                    else
                    {
                      this.alertService.pop('error', "Registration failed. try again");
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
