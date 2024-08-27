import { Component, OnInit } from '@angular/core';

//import { CategoryService } from '../../../services/referendum.service';
import { Users } from '../../../models/users';
import { UserService } from '../../../services/user.service';
import {ToasterModule, ToasterService} from 'angular2-toaster';
import { Router, ActivatedRoute } from '@angular/router';
//import {OrderBy} from "../../../pipes/orderBy"
import { environment } from '../../../../environments/environment';

import { flatten } from '../../../utils/flatten.util';
import { unflatten } from '../../../utils/unflatten.util';
import { max } from 'rxjs/operators';

const apiUrl =environment.apiUrl;

@Component({
  selector: 'app-referendum',
  templateUrl: './download-referendum.component.html',
  styleUrls: ['./download-referendum.component.scss']
})
export class DownloadReferendumComponent implements OnInit {

  private toasterService: ToasterService;
  results : any=[];
  rows : any=[];
  columns : any=[];
  accessKey : string;
  surveyId: number = 0;

  constructor(private router: Router, private activeroute: ActivatedRoute, private alertService: ToasterService) {
    
  }

  ngOnInit() {
    this.surveyId = this.activeroute.snapshot.params['referendumId'];
    this.loadResults();
  }

  goBack=function(){
    this.router.navigate(['/referendum']);
  }

  loadResults = function() {
    var self=this;
    var xhr = new XMLHttpRequest();
    xhr.open("GET", apiUrl + "survay/results?postId=" + this.surveyId);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.onload = function() {
      var result = xhr.response ? JSON.parse(xhr.response) : [];
      self.results=
        result.map(function(r) {
          return JSON.parse(r || "{}");
        });
      if(self.results.length>0){
        var arrData = typeof self.results != 'object' ? JSON.parse(self.results) : self.results;
        
        var maxIndex=0;
        var maxCount=0;
        for(var count=0;count<arrData.length;count++){
          if (Object.keys(flatten(arrData[count])).length>maxCount){
            maxCount=Object.keys(flatten(arrData[count])).length;
            maxIndex=count;
          }
        }
        //This loop will extract the label from 1st index of on array
        for (var index in flatten(arrData[maxIndex])) {
          //Now convert each value to string and comma-seprated
          self.columns.push({field : index});
        }

        //1st loop is to extract each row
        for (var i = 0; i < arrData.length; i++) {
          var row = "";
          var rowData= flatten(arrData[i]);
          var myRowData={};
          for(var j=0; j<self.columns.length;j++){
            if(!rowData.hasOwnProperty(self.columns[j].field)){
              myRowData[self.columns[j].field]="";
            }
            else{
              myRowData[self.columns[j].field]=rowData[self.columns[j].field];
            }
          }
          self.rows.push(Object.values(myRowData));
        }
      }
    };
    
    xhr.send();
  };

  downloadSurvey=function(){
      this.CSVCreate("SurveyResultReport", true, -1);
  }

  downloadSurveyRow=function(index){
    this.CSVCreate("UserResultReport", true, index);
  }

  CSVCreate(ReportTitle, ShowLabel, index) {
    var CSV = '';    
    //Set Report title in first row or line
    
    CSV += ReportTitle + '\r\n\n';

    //This condition will generate the Label/Header
    if (ShowLabel) {
        var row = "";
        
        //This loop will extract the label from 1st index of on array
        for (var i=0; i<this.columns.length;i++) {
            
            //Now convert each value to string and comma-seprated
            row += (this.columns[i].field+'').replace(/,/g,'') + ',';
        }

        row = row.slice(0, -1);
        //append Label row with line break
        CSV += row + '\r\n';
    }
    //1st loop is to extract each row
    if(parseInt(index) > -1){
      
      var row = "";
      for (var i=0;i<this.rows[index].length;i++) {
          row += '"' + this.rows[index][i] + '",';
      }

      row.slice(0, row.length - 1);
      
      //add a line break after each row
      CSV += row + '\r\n';
    }
    else{
      
      for(var count=0;count<this.rows.length;count++){
        var row = "";
        for (var j=0;j<this.rows[count].length;j++) {
            row += '"' + this.rows[count][j] + '",';
        }

        row.slice(0, row.length - 1);
        
        //add a line break after each row
        CSV += row + '\r\n';
      }
    }
    if (CSV == '') {        
        alert("Invalid data");
        return;
    }   
    
    //Generate a file name
    var fileName = "MyReport_";
    //this will remove the blank-spaces from the title and replace it with an underscore
    fileName += ReportTitle.replace(/ /g,"_");   
    
    //Initialize file format you want csv or xls
    var uri = 'data:text/csv;charset=utf-8,' + escape(CSV);
    
    // Now the little tricky part.
    // you can use either>> window.open(uri);
    // but this will not work in some browsers
    // or you will not get the correct file extension    
    
    //this trick will generate a temp <a /> tag
    var link = document.createElement("a");    
    link.href = uri;
    
    //set the visibility hidden so it will not effect on your web-layout
    link.classList.add("hidden");
    link.download = fileName + ".csv";
    
    //this part will append the anchor tag and remove it after automatic click
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
  
}
