import { Component, OnInit } from '@angular/core';
import {formatDate } from '@angular/common';
import { LeagueService } from '../../../services/league.service';

@Component({
  selector: 'app-list',
  templateUrl: './list-league.component.html',
  styleUrls: ['./list-league.component.scss']
})
export class ListLeagueComponent implements OnInit {
  dailyList : any = [];
  today= new Date();
  jstoday = '';
  live_status :number;
  isLoading = false;

  constructor(private leagueService: LeagueService) { }

  ngOnInit() {
    //this.jstoday = formatDate(this.today, 'dd-MM-yyyy HH:mm:ss', 'en-US', '+0000');
    this.jstoday = new Date().toISOString();
    this.getAllLeague();
  }

  private getAllLeague() { //console.log(this.jstoday);
    this.isLoading = true;
    this.leagueService.getLeagueList().subscribe(daily => { 
      //console.log(daily.data)
    this.dailyList = daily.data; 
    this.isLoading = false;
    });
  }

  checkDate(db_date){
    if(db_date > this.jstoday){
      this.live_status = 1;
    }else{
      this.live_status = 0;
    }
  }

}
