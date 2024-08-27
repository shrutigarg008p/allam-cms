import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';

import { AuthenticationService,UserService } from '../../../services';
import { ConfirmedValidator } from '../../../confirmed.validator';

@Component({
  selector: 'app-generatepswd',
  templateUrl: './generatepswd.component.html',
  styleUrls: ['./generatepswd.component.scss']
})
export class GeneratepswdComponent implements OnInit {
    
  resetForm: FormGroup;
  loading   = false;
  submitted = false;
  returnUrl: string;
  error = '';
  success='';
  resetUser: any = {};
  formFlag=false;
  message_title:string;
  message_body:string;
  id:string;
  constructor(private userService: UserService, private route: ActivatedRoute, private router: Router,private fb: FormBuilder) { }

  ngOnInit() 
  {
  	this.id = this.route.snapshot.params['userId'];
  	this.id=atob(this.id); //decode base64
  	this.verify(this.id);
  	this.message_title='';
  	this.message_body='';

    this.resetForm = this.fb.group({
            password: ['', Validators.required],
            conf_password: ['', Validators.required],
        }, { 
      validator: ConfirmedValidator('password', 'conf_password')
    });
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';

  }

    private verify(id) {
         this.userService.verifyCheckEmail(this.id)
            .subscribe(
                data => {
                	if(data['status']){
	                	this.message_title='Congratulations';
	  					      this.message_body ='Email verified..Please generate your password.';
                    this.formFlag=true;
                	}
                	else{
	                	this.message_title='Oops';
	  					      this.message_body ='Your email id is already verified or expired.';
                    this.formFlag=false;
                	}
                    
                },
                error => {
                  this.message_title='Oops';
  					      this.message_body='Something went wrong. please try again later';
                  this.formFlag=false;

                });
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
       
        this.userService.generatePassword(this.resetUser)
            .subscribe(
                data => {
                    if(data['status'])
                    {
                        this.success = "Password generated successfully"
                        this.message_body ='Password generated successfully';
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
