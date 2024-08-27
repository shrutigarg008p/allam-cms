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
  selector: 'app-broadcaster',
  templateUrl: './edit-broadcaster.component.html',
  styleUrls: ['./edit-broadcaster.component.scss']
})
export class EditBroadcasterComponent implements OnInit 
{
  loginUser:any;
  loginId:number;
  users: Users[];
  permissions: any[];
  countryArr:any[];
  roleArr: any = {};
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

        this.roleArr={ '2': 'Admin','3':'Advertiser','4':'Teacher','5':'User','6':'Teacher Supervisor', '9': 'Broadcaster'};
       
  } 
  private getDetail(id) {
        this.userService.userById(id).subscribe(user => { 
        const userData =user['data'][0];
        
        this.userForm.patchValue({
            register_as: this.roleArr[userData.role_id],
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
                      this.router.navigate(['broadcaster']);
                        
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
