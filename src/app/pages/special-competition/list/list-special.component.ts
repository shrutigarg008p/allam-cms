import { Component, OnInit } from '@angular/core';
import { DcService } from '../../../services/dc.service';

@Component({
  selector: 'app-list',
  templateUrl: './list-special.component.html',
  styleUrls: ['./list-special.component.scss']
})
export class ListSpecialComponent implements OnInit {
  dailyList : any = [];
  jstoday = '';
  isLoading = false;

  constructor(private dcService: DcService) { }

  ngOnInit() {
    this.jstoday = new Date().toISOString();
    this.getAllLeague();
  }

  private getAllLeague() {
    this.isLoading = true;
    this.dcService.getSpecialList().subscribe(daily => { 
      //console.log(daily.data)
    this.dailyList = daily.data; 
    this.isLoading = false;
    });
}

}
