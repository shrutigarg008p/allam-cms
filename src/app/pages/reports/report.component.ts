import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DcService } from '../../services/dc.service';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import { DatePipe } from '@angular/common';
import { ChartType, ChartOptions } from 'chart.js';
import { SingleDataSet, Label, monkeyPatchChartJsLegend, monkeyPatchChartJsTooltip } from 'ng2-charts';


@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.scss']
})
export class ReportComponent implements OnInit {
  quizReportName : any = [];
  quizReportData: any = [];
  //filters : any = {};
  competition_type : string = '';
  empty: boolean = false;
  loading:boolean;
  totalRecords: number;
  click_count : number = 0;
  total_download : number = 0;
  totalAndroid : number = 0;
  totalIos : number = 0;
  totalDownloadAndroid : number = 0;
  totalDownloadIos : number = 0;

  public invalidMoment =  new Date().toISOString();
  //public min = new Date(2021, 1, 3, 10, 30);
  public min = new Date().toISOString();
  public max = new Date();
  public  now = new Date();
  public created_at =  new Date();
  myDate = new Date();
  myDates : any;
  filters : any = { gender: "both", competitionType: "daily_competition", created_at: new Date()};
  audienceFilter :any= { gender: "both", competitionType: "daily_competition", created_at: new Date()};

  // Pie
  public pieChartOptions: ChartOptions = {
    responsive: true,
  };
  public pieChartLabels: Label[] = [ ['Total Click'], ['Download']];
  public pieChartData: SingleDataSet = [0, 0];
  public pieChartData1: SingleDataSet = [0, 0];
  public pieChartType: ChartType = 'pie';
  public pieChartLegend = true;
  public pieChartPlugins = [];

  constructor( private router : Router, private dataService: DcService, private datePipe: DatePipe) { 
    this.myDates = this.datePipe.transform(this.myDate, 'yyyy-MM-dd');
    monkeyPatchChartJsTooltip();
    monkeyPatchChartJsLegend();
  }

  ngOnInit() {
    

    if(this.router.url == '/reports/daily'){
      this.competition_type = 'daily';
    }else if(this.router.url == '/reports/special'){
      this.competition_type = 'special';
    }else{
      this.competition_type = 'daily';
    }
    console.log(this.competition_type);
    console.log(this.router.url);
    this.getQuizReports();
  }

  filterCatch(property: string, value: any) {
    //this.filters[property] = i => i === value;
    //this.filters['action_value'] = '';
    this.filters[property] = value;
    if(property == 'competition_type'){
      this.audienceFilter = value;
    }
    if(this.router.url == '/reports/daily'){
      this.competition_type = 'daily';
      this.filters['competitionType'] = 'daily';
    }else if(this.router.url == '/reports/special'){
      this.competition_type = 'special';
      this.filters['competitionType'] = 'special';
    }else{
      this.competition_type = 'daily';
      this.filters['competitionType'] = 'daily';
    }
    console.log(this.filters);
    this.getQuizReports();
  }

  filterMatch(property: string, value: any) {
    //this.filters[property] = i => i === value;
    this.audienceFilter['action_value'] = '';
    this.audienceFilter['created_at'] = this.filters.created_at;
    this.audienceFilter[property] = value;
    console.log('audienceFilter', this.audienceFilter);
    this.dailyReports();
  }

  /* filterCatch(property: string, value: any) {
    //this.filters[property] = i => i === value;
    //this.filters['action_value'] = '';
    this.filters[property] = value;
    if(this.router.url == '/reports/daily'){
      this.competition_type = 'daily';
      this.filters['competitionType'] = 'daily';
    }else if(this.router.url == '/reports/special'){
      this.competition_type = 'special';
      this.filters['competitionType'] = 'special';
    }else{
      this.competition_type = 'daily';
      this.filters['competitionType'] = 'daily';
    }
    if(property !== 'created_at'){
      this.filters['created_at'] = this.datePipe.transform(this.created_at, 'yyyy-MM-dd'); //this.myDates;
    }else{
      this.filters['created_at'] = this.datePipe.transform(value, 'yyyy-MM-dd');
    }
    console.log("--->>>"+this.created_at);
    console.log(this.filters);
    this.dailyReports();
  } */
  removeFilter(property: string) {
    delete this.filters[property];
    this[property] = null;
    //this.getQuizReports();
  }

  private getQuizReports(){
    this.dataService.getQuizReportsName(this.filters).subscribe(quizName => { 
      this.quizReportName = quizName.data;  
      //console.log('quizName '+JSON.stringify(quizName));
    });
  }

  private dailyReports()
  {
    this.total_download = 0;
    this.totalAndroid = 0;
    this.totalIos = 0;
    this.totalDownloadAndroid = 0;
    this.totalDownloadIos=0;

    this.dataService.getQuizReports(this.audienceFilter).subscribe(quizReport => { 
      this.quizReportData = quizReport.data;  
      //console.log('quizReport '+JSON.stringify(quizReport));
      //console.log(quizReport.data.length);
      
      if (quizReport.data.length === 0) {
        this.empty = true;
        Swal.fire('', quizReport.message, 'error');
      } else {
        //this.total_download = quizReport.data.length;
         this.empty = false;
      }

      this.loading = false;
      this.totalRecords = quizReport.data.length;
      
      this.click_count = 0;
      quizReport.data.forEach(item => {
        // console.log(JSON.stringify(item))
        if(item.app_download == true){
          this.total_download +=1;
        }
        this.click_count += item.click_count;
        if(item.device_type  == 'Android'){
          this.totalDownloadAndroid += 1;
          this.totalAndroid += item.click_count;
        }else{
          this.totalDownloadIos += 1;
          this.totalIos += item.click_count;;
        }

        // totalAndroid += item.totalAndroidCount;
        // totalIos += item.totalIosCount;
      });
        
      //console.log(this.totalAndroid);
      //console.log(this.totalIos);

      //console.log("total android--"+this.totalAndroid);
      //console.log("total donload--"+this.totalDownloadAndroid);

      this.pieChartData = [this.totalAndroid, this.totalDownloadAndroid];
      this.pieChartData1 = [this.totalIos, this.totalDownloadIos];
      //this.limit = data.limit;
      //this.totalPages = Math.ceil(this.totalRecords / this.limit);

      /* if(quizReport.status == 201){
        Swal.fire('', quizReport.message, 'error');
        //this.removeFilter();
        this.getQuizReports();
      } */
    },
    (errors) => {
      this.loading = true;
      //this.errmsg = errors.error.message;
    });
  }
  private specialReports(){

  }
  private leagueReports(){

  }

}
