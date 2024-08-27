import {Component, OnInit} from '@angular/core';
import {NavigationEnd, Router} from '@angular/router';

import { AuthenticationService } from './services';
import { User } from './models';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit 
{
  currentUser: User;
  title = 'Welcome ! Allam App';

  constructor(
        private router: Router,
        private authenticationService: AuthenticationService
    ) {
        this.authenticationService.currentUser.subscribe(x => this.currentUser = x);
    }

    public logout() {
        this.authenticationService.logout();
        this.router.navigate(['authentication/login']);
    }
    

  ngOnInit() {
    this.router.events.subscribe((evt) => {
      if (!(evt instanceof NavigationEnd)) {
        return;
      }
      window.scrollTo(0, 0);
    });
  }
}
