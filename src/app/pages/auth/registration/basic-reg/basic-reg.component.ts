import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';

import { AuthenticationService,UserService } from '../../../../services';

import { ConfirmedValidator } from '../../../../confirmed.validator';

@Component({
  selector: 'app-basic-reg',
  templateUrl: './basic-reg.component.html',
  styleUrls: ['./basic-reg.component.scss']
})
export class BasicRegComponent implements OnInit {
  
    regForm: FormGroup;
	loading = false;
	submitted = false;
    returnUrl: string;
	nameLabel: string;
    preview  : string;
	error = '';
	signupUser:any;
	constructor(private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private userService:UserService,
        private authenticationService: AuthenticationService) 
        {
            // redirect to home if already logged in
	        if (this.authenticationService.currentUserValue) { 
	            this.router.navigate(['dashboard']);
	        } 
        }

	ngOnInit() {
        this.nameLabel='Company Name';
	    this.regForm = this.formBuilder.group({
            register_as: ['', Validators.required],
            email: ['', [Validators.required, Validators.email],this.emailValidator.bind(this)],
            name: ['', Validators.required],
            mobile: ['', Validators.required],
            country: ['', Validators.required],
            password: ['', Validators.required],
            website:[''],
            user_avatar:[null],
            conf_password: ['', Validators.required],
        }, { 
      validator: ConfirmedValidator('password', 'conf_password')
    });
        this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
	}

	get f() { return this.regForm.controls; }

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

    onChange(regAs) {
        if(regAs==2){
            this.nameLabel='Name';
        }
        else{
            this.nameLabel='Company Name';
        }
    }

    uploadFile(event) {
        const file = (event.target as HTMLInputElement).files[0];
        this.regForm.patchValue({
          user_avatar: file
        });
        this.regForm.get('user_avatar').updateValueAndValidity()

        // File Preview
        const reader = new FileReader();
        reader.onload = () => {
          //this.preview = reader.result as string;
        }
        reader.readAsDataURL(file)
    }

    onSubmit() {
        this.submitted = true;
        if (this.regForm.invalid) {
            return;
        }
 
        this.loading = true; 
        this.userService.signup(this.regForm.value)
            .subscribe(
                data => {
                    if(data['status']=='200')
                    {
                       
                        this.router.navigate(['authentication/thanks']);
                        
                    }
                    else
                    {
                        this.error = 'Registration failed. try again';
                        this.loading = false;
                    }
                    
                },
                error => {
                    this.error = "Something went wrong. Try again later.";
                    this.loading = false;
                });


    }


    

}
