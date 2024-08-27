import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';

import { AuthenticationService,UserService } from '../../../../services';

import { ConfirmedValidator } from '../../../../confirmed.validator';

@Component({
  selector: 'app-reset',
  templateUrl: './reset.component.html',
  styleUrls: ['./reset.component.scss']
})
export class ResetComponent implements OnInit {
  
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
  constructor(private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private activeAouter: ActivatedRoute,
        private userService:UserService) { }

  ngOnInit() 
  {
  	this.id = this.activeAouter.snapshot.params['userId'];
  	this.id = atob(this.id); //decode base64
  	//this.reset(this.id);
  	

      this.resetForm = this.formBuilder.group({
            password: ['', Validators.required],
            conf_password: ['', Validators.required],
        }, { 
      validator: ConfirmedValidator('password', 'conf_password')
    });
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';

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
       
        this.userService.resetPassword(this.resetUser)
            .subscribe(
                data => {
                    if(data['status'])
                    {
                        this.success = data['msg'];
                        this.error='';
                        this.loading = false; 
                        this.formFlag=false;
                    }
                    else
                    {
                        this.error = data['msg'];
                        this.loading = false;
                        this.formFlag=false;
                    }
                    
                },
                error => {
                    this.error = "Something went wrong. Try again later.";
                    this.loading = false;
                });


    }

}
