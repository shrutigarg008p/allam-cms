import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';

import { AuthenticationService } from '../../../../services';

/*@Component({
  selector: 'app-basic-login',
  templateUrl: './basic-login.component.html',
  styleUrls: ['./basic-login.component.scss']
})*/
@Component({ templateUrl: './basic-login.component.html' })
export class BasicLoginComponent implements OnInit {
	loginForm: FormGroup;
	loading = false;
	submitted = false;
	returnUrl: string;
	error = '';
    loginUser:any;
    curr_role_id:any;
    loginCUser:any;

     constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private authenticationService: AuthenticationService
    ) { 
        // redirect to home if already logged in
        if (this.authenticationService.currentUserValue) { 
            //debugger;
            this.loginCUser=this.authenticationService.currentUserValue;
            this.loginCUser      = JSON.parse(this.loginCUser);
            this.curr_role_id =this.loginCUser['user']['0']['role_id']
            if(this.curr_role_id==1){
                this.router.navigate(['dashboard']); //super admin
            }
            else if(this.curr_role_id==2){
                this.router.navigate(['category']); //admin
            }
            else if(this.curr_role_id==3){
                this.router.navigate(['referendum']); //Advertiser
            }
            else if(this.curr_role_id==4){
                this.router.navigate(['study-exam']); //User
            }
            else if(this.curr_role_id==6){
                this.router.navigate(['teacher-supervisor']); //teacher-supervisor
            }
            else if(this.curr_role_id==9){
                this.router.navigate(['broadcasting']); //broadcaster
            }
            else{
                this.router.navigate(['/']); //Advertiser
            }
        }
    }


    ngOnInit() {
        this.loginForm = this.formBuilder.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', Validators.required]
        });

        // get return url from route parameters or default to '/'
        this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    }

    // convenience getter for easy access to form fields
    get f() { return this.loginForm.controls; }

    onSubmit() {
    
        this.submitted = true;

        // stop here if form is invalid
        if (this.loginForm.invalid) {
            return;
        }
 
        this.loading = true;
        this.authenticationService.login(this.f.email.value, this.f.password.value)
            .subscribe(
                data => {
                    if(data)
                    {
                        this.loginUser=this.authenticationService.currentUserValue;
                        const user_role_id =this.loginUser.user[0].role_id;
                        if(user_role_id==1){
                            this.router.navigate(['dashboard'])
                              .then(() => {
                                window.location.reload();
                              });
                            //super admin
                        }
                        else if(user_role_id==2){
                            this.router.navigate(['category'])
                              .then(() => {
                                window.location.reload();
                            }); //admin
                        }
                        else if(user_role_id==3){
                            this.router.navigate(['referendum'])
                              .then(() => {
                                window.location.reload();
                            });//Advertiser
                        }
                        else if(user_role_id==4){
                            this.router.navigate(['study-exam'])
                              .then(() => {
                                window.location.reload();
                            });

                            //Teacher
                        }
                        else if(user_role_id==6){
                            this.router.navigate(['teacher-supervisor'])
                              .then(() => {
                                window.location.reload();
                            });

                            //Teacher supervisor
                        }
                        else if(user_role_id==9){
                            this.router.navigate(['broadcasting'])
                              .then(() => {
                                window.location.reload();
                            });

                            //Broadcaster
                        }
                        else{
                            this.router.navigate(['/']); //Advertiser
                        }
                        
                    }
                    else
                    {
                        this.error = 'Email Id  or password is incorrect';
                        this.loading = false;
                    }
                    
                },
                error => {
                    this.error = "Something went wrong. Try again later.";
                    this.loading = false;
                });


    }

}
