import { Component, OnInit, ViewChild } from '@angular/core';
import {ToasterModule, ToasterService} from 'angular2-toaster';
import { Router , ActivatedRoute} from '@angular/router';
import { PocquestionService } from '../../../services/studyexam/pocquestion.service';
import { CurriculumSingleService } from '../../../services/studyexam/curriculum-single.service';
import { CompetitiveSingleService } from '../../../services/studyexam/competitive-single.service';
import { AuthenticationService } from '../../../services';
import { environment } from '../../../../environments/environment';
import * as htmlToImage from 'html-to-image';
import { TsupervisorService } from '../../../services/tsupervisor.service';


declare var jsPDF: any;

import $ from 'jquery';
import { RowCssClassCalculator } from 'ag-grid-community/dist/lib/rendering/row/rowCssClassCalculator';

const apiUrl =environment.apiUrl;

@Component({
  selector: 'app-referendum',
  templateUrl: './studyexam-downlad.component.html',
  styleUrls: ['./studyexam-downlad.component.scss']
})
export class StudyExamDownloadComponent implements OnInit {
  @ViewChild('container',{static:false}) container: any; 
  title = 'Download';
  public selectedItems = [];
	gridview = false;
	error = '';
	private questionArr:any=[];
  masterArr:any=[];
  row_id=1;
	private toasterService: ToasterService;
  logUser:any;
  created_by:number;
  mode='';
  parentmodule='';
  quiz_temp_id:any;
  s3_url =environment.s3_url;
  local_api_url=environment.apiUrl;
  
	public question_value: string = ``;
    
  constructor(private router: Router,
              private activeAouter: ActivatedRoute,
              private alertService: ToasterService,
              private curriculumSingleService:CurriculumSingleService,
              private authenticationService: AuthenticationService,
              private pocquestionService: PocquestionService,
              private competitiveSingleService:CompetitiveSingleService,
              private tsupervisorService:TsupervisorService,

              ) {}

	  ngOnInit() {    
        this.logUser    = this.authenticationService.currentUserValue;
        this.logUser    = JSON.parse(this.logUser);
        this.created_by = this.logUser['user'][0]['id']; 
        this.mode = this.activeAouter.snapshot.params['mode'];
        this.parentmodule=this.activeAouter.snapshot.params["parent"];
        this.quiz_temp_id = (this.activeAouter.snapshot.params['quiz_temp_id']);
        this.getDraftQuestion(this.mode);
        $(document).ready(function(){
          //setTimeout(() => window.print(), 1000);
        });
	  }

    public getDraftQuestion(mode) {
      if(this.parentmodule=="teacher"){
        if(mode=='1'){
          this.curriculumSingleService.getDraftQuestionByUser(this.created_by).subscribe(response => { 
            this.questionArr = response;       
          });
        }
        else if(mode=='2'){
          this.pocquestionService.getDraftQuestionByUser(this.created_by).subscribe(response => {
            this.questionArr = response;
          });
        }
        else if(mode=='3'){
          this.competitiveSingleService.getDraftQuestionByUser(this.created_by,this.quiz_temp_id).subscribe(response => { 
            this.questionArr = response; 
          });
        }
        else if(mode=='4'){
          this.pocquestionService.getDraftQuestionCompetitiveByUser(this.created_by,this.quiz_temp_id).subscribe(response => {  
            this.questionArr=response;
          });
        }
      }
      else{

         this.tsupervisorService.getPublishQuestion(this.quiz_temp_id).subscribe(response => {  
            this.questionArr=response;
          });
      }
    }

    generatePDF() {
      var self=this;
      const doc = new jsPDF({
        orientation: "landscape",
        unit: "in",
        format: "a4"
      });
      var res = doc.autoTableHtmlToJson(document.getElementById("contentToConvert"), false);
      doc.autoTable(res.columns,res.rows,{
        bodyStyles: {valign: 'top', minCellHeight: 100},
        styles: {overflow: 'linebreak', columnWidth: 'wrap'},
        createdCell: function(cell, data) {
          if (data.column.index === 6) {
            debugger;
            cell.styles.cellPadding = {vertical: 1};
            var div = document.createElement("div"); 
            div.innerHTML = data.cell.raw.innerHTML; 
            cell.text = cell.raw.textContent.replace(/./g, ' ');
            setTimeout(() => htmlToImage.toPng(data.cell.raw)
            .then(function (dataUrl) {
                var img = new Image();
                img.src = dataUrl;
                var textPos = data.cell.textPos;
                var dim = data.cell.raw.offsetHeight - data.cell.padding('vertical');
                doc.addImage(img.src, textPos.x, textPos.y);
            })
            .catch(function (error) {
              debugger;
                console.error('oops, something went wrong!', error);
            }), 1000);
          }
        }
      });
      //doc.save("table.pdf")
      setTimeout(() => doc.save("table.pdf"), 10000);
    }
}