import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../services/user.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-verify',
  templateUrl: './verify.component.html',
  styleUrls: ['./verify.component.scss']
})
export class VerifyComponent implements OnInit {
  
  message_title:string;
  message_body:string;
  id:string;
  constructor(private userService: UserService, private activeAouter: ActivatedRoute, private router: Router) { }

  ngOnInit() 
  {
  	this.id = this.activeAouter.snapshot.params['userId'];
  	this.id=atob(this.id); //decode base64
  	this.verify(this.id);
  	this.message_title='';
  	this.message_body='';
  }

    private verify(id) {
         this.userService.verifyEmail(this.id)
            .subscribe(
                data => {
                	if(data['status']){
	                	this.message_title='Congratulations';
	  					this.message_body ='You have successfully verified the email address.';
                	}
                	else{
	                	this.message_title='Oops';
	  					this.message_body ='Your email id is already verified or expired.';
                	}
                    
                },
                error => {
                   	this.message_title='Oops';
  					this.message_body='Something went wrong. please try again later';
                });
   }

}
