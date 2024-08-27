import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { from } from 'rxjs';
import { DcService } from '../../../services/dc.service'
import Swal from 'sweetalert2/dist/sweetalert2.js';
import {ToasterModule, ToasterService} from 'angular2-toaster';
import { environment } from '../../../../environments/environment'

@Component({
  selector: 'app-view-daily-competition',
  templateUrl: './view-daily-competition.component.html',
  styleUrls: ['./view-daily-competition.component.scss']
})

export class ViewDailyCompetitionComponent implements OnInit {
  s3_url =environment.s3_url;
  getCompetition : any = [];
  getQuestion : any = [];
  getNarration : any = [];
  setAudience : any = [];
  dailyList :any = [];
  config: any;
  isDesc: boolean = false;
  column: string = 'id';
  direction: number;
  show: boolean = false;
  getStatus:number;
  setOffset:string;
  preview :string;
  audienceLogo : string;
  appLogo : string;
  companyLogo: string;
  jstoday = '';
  term: string;
  term1: string;
  term2: string;
  page = 1;
  count = 0;
  pageSize = 5;
  pageSizes = [5, 10, 25, 50, 100];
  
  constructor(private router: Router, private activatedRoute: ActivatedRoute, private dcService: DcService, private alertService: ToasterService) { 
    this.config = {
      itemsPerPage: 5,
      currentPage: 1,
      totalItems: 0
    }; 
  }

  ngOnInit() {
    const id = this.activatedRoute.snapshot.paramMap.get('id');
    this.jstoday = new Date().toISOString();
    this.getAllDaily();
    this.getTimeZone();
  }
  private getAllDaily() {
    this.show = true;
    this.dcService.getSpecialList().subscribe(daily => { 
      //console.log(daily.data)
      this.dailyList = daily.data; 
      this.config.totalItems = this.dailyList.length;
    });
  }

  get route() { return this.router.url; }

  getTimeZone() {
    var offset = new Date().getTimezoneOffset(), o = Math.abs(offset);
    this.setOffset = (offset < 0 ? "+" : "-") + ("00" + Math.floor(o / 60)).slice(-2) + ":" + ("00" + (o % 60)).slice(-2);
    console.log(this.setOffset);
  }

  //custom search & pagination
 getRequestParams(searchText, page, pageSize): any { 
  let params = {};

  if (searchText) {
    params[`searchText`] = searchText;
  }
  else{
    params[`searchText`] =0;
  }

  if (page) {
    params[`page`] = page - 1;
  }

  if (pageSize) {
    params[`size`] = pageSize;
  }

  return params;
}


handlePageChange(event): void {
  this.page = event;
  this.getAllDaily();
}

handlePageSizeChange(event): void {
  this.pageSize = event.target.value;
  this.page = 1;
  this.getAllDaily();
}

  pageChanged(event){
    this.config.currentPage = event;
  }

  sort(property){
    console.log(property);
      this.isDesc = !this.isDesc; //change the direction    
      this.column = property;
      this.direction = this.isDesc ? 1 : -1;
  }
  goBack(){
    this.show = true;
  }
  
  changeStatus(status, competition_id) 
  {
    var self = this;
    var showMessage;
    if(status == 0){
      showMessage = 'Unapproved';
    }else{
      showMessage = 'Approved';
    }
    Swal.fire({
        title: 'Are you sure want to '+showMessage+'?',
        //text: 'You will not be able to recover this item!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, '+showMessage+' it!',
        cancelButtonText: 'No, keep it'
      }).then((result) => {
        if (result.value) {
          //console.log(item_id);
          this.dcService.updateStatus(status,competition_id)
          .subscribe(
              data => {
              //console.log(data);
                this.alertService.pop('success', 'Competition updated successfully');
                //this.router.navigate(['/League']);
                var getArr = data['data'][0];
                this.getStatus = status;
                this.dailyList = this.dailyList.map(u => u.id !== getArr.id ? u : getArr);
              },
              error => {
                this.alertService.pop('error', error);
          });
          console.log('Competition updated');

           Swal.fire(
            showMessage+'!',
            'Your data has been '+showMessage+'.',
            'success'
          )
         
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          //Swal.fire('Cancelled','Your data is safe :)','error')
        }
      })
  }
  removeByAttr = function(arr, attr, value){
    var i = arr.length;
    while(i--){
       if( arr[i] 
           && arr[i].hasOwnProperty(attr) 
           && (arguments.length > 2 && arr[i][attr] === value ) ){ 

           arr.splice(i,1);

       }
    }
    return arr;
  }
  deleteOneItem(item_id){
    var self = this;
    Swal.fire({
        title: 'Are you sure want to delete?',
        text: 'You will not be able to recover this item!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'No, keep it'
      }).then((result) => {
        if (result.value) {
          //console.log(item_id);
          //console.log(self.dailyList);
          //self.dailyList.splice(self.dailyList.indexOf(item_id),1);
          self.dcService.deleteCompetition(item_id).subscribe(() => {  
            console.log('deleted competition row'); 
            //self.getDraftQuestion();
            //self.dailyList.splice(self.dailyList.indexOf(item_id),1);
            this.removeByAttr(self.dailyList, 'id', item_id);
          });

          if(self.dailyList.length==0){
            //this.isProcessed=false;
          }

           Swal.fire(
            'Deleted!',
            'Your data has been deleted.',
            'success'
          )
         
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          //Swal.fire('Cancelled','Your data is safe :)','error')
        }
      })
  }

  getDailyCompetition(id){
    this.show = false;
    console.log(id);
    this.dcService.editCompetition(id).subscribe(competition => { 
      console.log(competition.data)
    this.getCompetition = competition.data[0].competition[0];
    this.getQuestion = competition.data[1].question;
    this.getNarration = competition.data[2].narration[0];
    this.setAudience = competition.data[3].setAudience[0];

    this.preview = this.s3_url+this.getCompetition.logo;
    this.appLogo = this.s3_url+this.getCompetition.app_logo;
    this.audienceLogo = this.s3_url+this.setAudience.image_upload;
    this.companyLogo = this.s3_url+this.getNarration.company_logo;
    });
  }
}
