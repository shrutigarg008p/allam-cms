import { Component, OnInit } from '@angular/core';
//import { League } from '../../../models/League';
import { HttpEvent, HttpEventType } from '@angular/common/http';
import { LeagueService } from '../../../services/league.service';
import {ToasterModule, ToasterService} from 'angular2-toaster';
import { AuthenticationService } from '../../../services';
import { Router, ActivatedRoute, Event, NavigationEnd } from '@angular/router';
import { environment } from '../../../../environments/environment';
//import {OrderBy} from "../../../pipes/orderBy"
import Swal from 'sweetalert2/dist/sweetalert2.js';

@Component({
  selector: 'app-league',
  templateUrl: './list-league.component.html',
  styleUrls: ['./list-league.component.scss']
})
export class ListLeagueComponent implements OnInit {

  leagues: any[]; 
  private toasterService: ToasterService;
  term: string;
  term2: string;
  config: any;
  filters: any;
  viewLeague: any[];
  isDesc: boolean = false;
  column: string = 'id';
  direction: number;
  show: boolean = false;
  logUser:any;
  created_by:number;
  percentDone: any = 0;
  preview : string;
  previewCompanyLogo: string;
  currentRoute: string;
  public s3_url =environment.s3_url;

  constructor( private leagueService: LeagueService, private router: Router,private alertService: ToasterService, private authenticationService:AuthenticationService) {
    this.term = ""; 
    this.alertService = alertService; 
    this.config = {
      itemsPerPage: 5,
      currentPage: 1,
      totalItems: 0
    };

    this.show = false;
    // Get current route -- Its working but not required this, we have used in view route
    /* this.router.events.subscribe((event:Event) => {
      if(event instanceof NavigationEnd ){
        this.currentRoute = event.url;          
          console.log(event);
          //console.log(event.url);
      }
    }); */
    
  }

  ngOnInit() {
    // Get user id by 
    this.logUser    = this.authenticationService.currentUserValue;
    this.logUser    = JSON.parse(this.logUser);
    this.created_by = this.logUser['user'][0]['id'];  

    //
    /* if (this.router.url.endsWith('league-list/group')) {
      this.whichView = 'group';
      console.log('group')
      //this.groupLeague();
    }else{ 
      console.log('show')
      this.whichView = 'show';
    } */

    // show all league list
    this.getAllLeague();
  }

  get route() { return this.router.url; }

  pageChanged(event){
    this.config.currentPage = event;
  }

  sort(property){
    console.log(property);
      this.isDesc = !this.isDesc; //change the direction    
      this.column = property;
      this.direction = this.isDesc ? 1 : -1;
  }

  private getAllLeague() {
        this.leagueService.getAll().subscribe(leagues => { 
        this.leagues = leagues; 
        this.config.totalItems=leagues.length;
        });
  }
  backLeague(){
    this.show = false;
  }
  backLeagueList(){
    this.show = false;
    this.router.navigate(['/league/league-list']);
  }

  showLeague(League){
    //console.log(League);
    this.viewLeague = League;
    this.show = true;
    this.preview = this.s3_url+League.logo;
    this.previewCompanyLogo = this.s3_url+League.company_logo;
    //this.router.navigate(['/league/show-league/']);
  }

  groupLeague(League){
    League.interest_by = this.created_by;
    this.leagueService.groupLeaguePost(League)
    .subscribe(
        data => {
          console.log(data);
          if(data.status == '200'){
            this.alertService.pop('success', data.message);
            this.router.navigate(['/league/league-list/group']);
          }else if(data.status == '201'){
            //this.alertService.pop('error', data.message);
            Swal.fire('',data.message,'error');
            this.router.navigate(['/league/league-list/group']);
          }else if(data.status == '403'){
            Swal.fire('',data.message,'error');
          }else{
            this.alertService.pop('error', "Something wrong");
          }
          
        },
        error => {
          this.toasterService.pop('error', error);
     });
  }

  interestLeague(league){
    //console.log(league);
    league.interest_by = this.created_by;
    this.leagueService.interestLeaguePost(league)
    /* .subscribe((event: HttpEvent<any>) => { console.log('event.type '+event.type);
		        switch (event.type) {
		            case HttpEventType.Sent:
		                console.log('Request has been made!');
		                break;
		            case HttpEventType.ResponseHeader:
		                console.log('Response header has been received!');
		                break;
		            case HttpEventType.UploadProgress:
		                this.percentDone = Math.round(event.loaded / event.total * 100);
		                console.log(`Uploaded! ${this.percentDone}%`);
		                break;
		            case HttpEventType.Response:
		            	 console.log('event.body.message '+ event.body.message);
			            //console.log('User successfully created!', event.body);
			            if (event.body.message == 'Record inserted') {
			            	this.alertService.pop('success', 'League added successfully!');
			            	//this.router.navigate(['/league-list']);
			            }else{
			            	this.alertService.pop('error', event.body.message);
			           }
			           this.percentDone = false;
			            
		      	}
		    }); */
    .subscribe(
        data => {
          console.log(data);
          if(data.status == '200'){
            this.alertService.pop('success', data.message);
            this.router.navigate(['/league/league-list']);
          }else if(data.status == '201'){
            this.alertService.pop('error', data.message);
          }else{
            this.alertService.pop('error', "Something wrong");
          }
          
        },
        error => {
          this.toasterService.pop('error', error);
     });
    //console.log('League updated');
  }

  changeStatus(League) 
  {
    console.log(League);
    if(League.status=="0"){
      League.status="1";
    }
    else{
      League.status="0";
    }
   
    this.leagueService.update(League,League.id)
    .subscribe(
        data => {
        console.log(data);
           this.alertService.pop('success', 'League updated successfully');
           this.router.navigate(['/League']);
        },
        error => {
          this.toasterService.pop('error', error);
     });
    console.log('League updated');
  }

  deleteLeague(id) {
  	if(confirm("Are you sure to delete "+name)) {
    this.leagueService.delete(id).subscribe(() => {  this.alertService.pop('success', 'League deleted successfully');
    this.getAllLeague() 
    });
    }
  }
}
