import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';
import { UserService } from '../../../../services/user.service';

@Component({
  selector: 'app-basic-forgot',
  templateUrl: './basic-forgot.component.html',
  styleUrls: ['./basic-forgot.component.scss']
})
export class BasicForgotComponent implements OnInit {
  

  forgotForm: FormGroup;
  loading = false;
  submitted = false;
  returnUrl: string;
  error = '';
  success='';
  forgotUser:any;


  constructor( private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private userService: UserService) { }

  ngOnInit() {
    this.forgotForm = this.formBuilder.group({
             email: ['', [Validators.required, Validators.email]],
        });

    // get return url from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';

  }

  // convenience getter for easy access to form fields
   get f() { return this.forgotForm.controls; }

    onSubmit() {
    
        this.submitted = true;

        // stop here if form is invalid
        if (this.forgotForm.invalid) {
            return;
        }
 		
        this.loading = true;
        this.userService.forgot(this.f.email.value)
            .subscribe(
                data => {
                    if(data['status'])
                    {      
                     	this.success = data['msg']
                     	this.error ='';
                        this.loading = false; 
                        this.forgotForm.reset();
                        this.submitted=false;
                       
                    }
                    else
                    {
                        this.error = data['msg']
                        this.loading = false;
                    }
                    
                },
                error => {
                    this.error = "Something went wrong. Try again later.";
                    this.loading = false;
                });


    }

   
}
