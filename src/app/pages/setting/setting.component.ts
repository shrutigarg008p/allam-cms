import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';
import {ToasterModule, ToasterService} from 'angular2-toaster';
import { AuthenticationService,UserService } from '../../services';
import { ConfirmedValidator } from '../../confirmed.validator';

@Component({
  selector: 'app-setting',
  templateUrl: './setting.component.html',
  styleUrls: ['./setting.component.scss']
})
export class SettingComponent implements OnInit {
    
  resetForm: FormGroup;
  loading   = false;
  submitted = false;
  returnUrl: string;
  error = '';
  success='';
  resetUser: any = {};
  formFlag=true;
  message_title:string;
  message_body:string;
  id:string;
  private toasterService: ToasterService;
  logUser:any;

  constructor(private userService: UserService, 
              private route: ActivatedRoute, 
              private router: Router,
              private fb: FormBuilder, 
              private alertService: ToasterService,
              private authenticationService: AuthenticationService
              ) { }

  ngOnInit() 
  {  	
  	this.message_title='';
  	this.message_body='';
    this.resetForm = this.fb.group({
            password: ['', Validators.required],
            conf_password: ['', Validators.required],
        }, { 
      validator: ConfirmedValidator('password', 'conf_password')
    });

    this.logUser    = this.authenticationService.currentUserValue;
    this.logUser    = JSON.parse(this.logUser);
    this.id         = this.logUser['user'][0]['id']; 
  }

    get f() { return this.resetForm.controls; }

    onSubmit() {
        this.submitted = true;
        if (this.resetForm.invalid) {
            return;
        }
 
        this.loading = true;
        this.resetUser.password  = this.resetForm.value.password;
        this.resetUser.id=this.id;
        this.userService.changePassword(this.resetUser)
            .subscribe(
                data => {
                    if(data['status'])
                    {
                      this.alertService.pop('success', 'Password changed successfully');
                      this.loading = false; 
                    }
                    else
                    {  
                        this.alertService.pop('error', data['msg']);
                        this.loading = false; 
                    }
                    
                },
                error => {
                    this.alertService.pop('error', 'Something went wrong. Try again later.');
                    this.loading = false;
                });


    }

}
