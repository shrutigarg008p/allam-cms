import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { from } from 'rxjs';
import { LeaderboardService } from '../../services/leaderboard.service';
import { DcService } from '../../services/dc.service';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import {ToasterModule, ToasterService} from 'angular2-toaster';
import { environment } from '../../../environments/environment';
import * as _ from 'lodash';

interface FilterFormValue {
  sex: string;
  category: string;
  status: string;
}

@Component({
  selector: 'app-leaderboard',
  templateUrl: './leaderboard.component.html',
  styleUrls: ['./leaderboard.component.scss']
})
export class LeaderboardComponent implements OnInit {

  dailyList: any = [];
  filteredStudents: any = [];
  countryData : any = [];

  filterForm: FormGroup;
  // filter by value
  filters : any = { gender: "both", competitionType: "daily_competition", created_at: new Date()};
  audienceFilter :any= { gender: "both", competitionType: "daily_competition", created_at: new Date()};;
  term: string;
  term1: string;
  term2: string;
  setOffset:string;
  competitionSelect : any = [];
  page = 1;
  count = 0;
  pageSize = 5;
  pageSizes = [5, 10, 25, 50, 100];

  public invalidMoment =  new Date().toISOString();
  //public min = new Date(2021, 1, 3, 10, 30);
  public min = new Date().toISOString();
  public max = new Date();
  public  now = new Date();
  public created_at =  new Date();

  private competitionOption: any[] = [{"id":"daily_competition","title":"Daily Competition"}, {"id":"special_competition","title":"Special Competition"}, {"id":"league_competition","title":"League Competition"}];

  private actionOption: any[] = [{"id":"0","title":"Gender"}, {"id":"1","title":"Age"}, {"id":"2","title":"Country"}, {"id":"3", "title":"Rank"}];
  private actionValueOption: any[] = [{"id":"Both","title":"Both"}, {"id":"Male","title":"Male"}, {"id":"Female","title":"Female"}];

  constructor(private router: Router, private activatedRoute: ActivatedRoute, private dataService: DcService, private leaderboardService: LeaderboardService, private alertService: ToasterService, private datePipe: DatePipe, private formBuilder: FormBuilder) {  }

  ngOnInit() {
    this.term1='';
    this.term2='0';
    this.term='';

    this.getTimeZone();
    this.getCountry();
    this.getCompetitionOption('daily_competition');
  }

  getTimeZone() {
    var offset = new Date().getTimezoneOffset(), o = Math.abs(offset);
    this.setOffset = (offset < 0 ? "+" : "-") + ("00" + Math.floor(o / 60)).slice(-2) + ":" + ("00" + (o % 60)).slice(-2);
    console.log(this.setOffset);
  }
  private getCountry(){
    this.dataService.getCountry().subscribe(broadcaster => { 
      this.countryData = broadcaster.data;  
      //console.log('broadcaster '+JSON.stringify(broadcaster));
    })
  }

  private setFilters() {
    this.filteredStudents = _.filter(this.competitionSelect, _.conforms(this.filters) );
  }

  filterCatch(property: string, value: any) {
    //this.filters[property] = i => i === value;
    //this.filters['action_value'] = '';
    this.filters[property] = value;
    if(property == 'competition_type'){
      this.audienceFilter = value;
    }
    console.log(this.filters);
    this.getCompetitionOption();
  }

  filterMatch(property: string, value: any) {
    //this.filters[property] = i => i === value;
    this.audienceFilter['action_value'] = '';
    this.audienceFilter[property] = value;
    console.log('audienceFilter', this.audienceFilter);
    this.leaderboard();
  }

  private getCompetitionOption(competition_type='daily_competition'){ 
    //console.log(competition_type);
    this.leaderboardService.getCompetitionName(this.filters).subscribe(data => { 
      this.competitionSelect = data.data;  
      //console.log('broadcaster '+JSON.stringify(data));

      // //this.getSexOptions();
      // when we get all our data initialize the filter form
      // //this.initFilterForm();

    })
  }
  leaderboard(){ 
    //console.log(this.filters);
    this.leaderboardService.getLeaderboard( this.audienceFilter).subscribe(data => { 
      this.dailyList = data.data;  
      //console.log('broadcaster '+JSON.stringify(data));
      if(data.success == false){
        Swal.fire('', data.message, 'error');
        this.getCompetitionOption();
      }
      // //this.getSexOptions();
      // when we get all our data initialize the filter form
      // //this.initFilterForm();

    },
    err =>{ console.log('err', err) })
  }
  /// removes filter
  removeFilter(property: string) {
    delete this.filters[property];
    this[property] = null;
    this.getCompetitionOption();
  }

/*    private getSexOptions() {
    // get all unique values from array of students
    this.sexOptions = Array.from(new Set(this.competitionSelect.map((student) => student.gender)));
  }

  private initFilterForm() {
    // initialize the form with empty strings, in html the 'All' option will be selected
    this.filterForm = this.formBuilder.group({
      sex: [''],
      category: [''],
      status: ['']
    });
    // init watch for any form changes
    this.watchFormChanges();
  }
 private watchFormChanges() {
    // this will fire on any filter changes and call the filtering method with the value of the form
    this.filterForm.valueChanges.subscribe((value: FilterFormValue) => this.filterStudents(value));
  }

  private filterStudents(value: FilterFormValue) {
    // again, this operation would be executed on the backend, but here you go
    // initialize a new array of all the students
    let filteredStudents: any = this.competitionSelect;
    if (value.sex) {
      // if filter for sex is set, simply filter for any student that has the same value for sex
      filteredStudents = filteredStudents.filter((student) => student.sex === value.sex);
    }
    if (value.category && !value.status) {
      // when category is set but status is not, filter for any student that has the category in any of its programs 
      filteredStudents = filteredStudents.filter((student: Student) => {
        return student.programs
          .map((program: Program) => program.programCategory)
          .includes(value.category);
      });
    }
    if (!value.category && value.status) {
      // when status is set but category is not, filter for any student that has the status in any of its programs
      filteredStudents = filteredStudents.filter((student: Student) => {
        return student.programs
          .map((program: Program) => program.programStatus)
          .includes(value.status);
      });
    }
    if (value.category && value.status) {
      // when category and status is both set, filter for any student that has the status AND category in any of its programs
      filteredStudents = filteredStudents.filter((student: Student) => {
        return student.programs
          .filter((program: Program) => program.programCategory === value.category)
          .map((program: Program) => program.programStatus)
          .includes(value.status);
      });
    }
    // set the filtered students to display
    this.filteredStudents = filteredStudents;
  } */

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
    //this.getLeaderboard();
  }

  handlePageSizeChange(event): void {
    this.pageSize = event.target.value;
    this.page = 1;
    //this.getLeaderboard();
  }

}
