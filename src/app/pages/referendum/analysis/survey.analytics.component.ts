import { Component, Input, EventEmitter, Output, OnInit } from "@angular/core";
import * as Survey from "survey-angular";
import * as SurveyAnalytics from "survey-analytics";

@Component({
  // tslint:disable-next-line:component-selector
  selector: "survey-analytics",
  template: ` <div class="survey-container contentcontainer codecontainer">
  <div id="surveyResult"></div>
</div>`,
})
export class SurveyAnalyticsComponent implements OnInit {
  _json: any={};
  get json(): any {
      return this._json;
  }
  @Input() 
  set json(value: any)
  {
    this._json=value;
    if(typeof(value)=="object" && Object.keys(value).length > 0){
      this.surveyAnalytics();
    }
  };
  _result: any=[];
  get result(): any {
      return this._result;
  }
  @Input() 
  set result(value: any)
  {
    this._result=value;
    if(typeof(this.json)=="object" && Object.keys(this.json).length > 0){
      this.surveyAnalytics();
    }
  };
  ngOnInit() {

  }

  surveyAnalytics(){
    var survey = new Survey.Model(this.json);
    var surveyResultNode = document.getElementById("surveyResult");
    surveyResultNode.innerHTML = "";
        var visPanel = new SurveyAnalytics.VisualizationPanel(
            survey.getAllQuestions(),
            this.result,
            { labelTruncateLength: 27, haveCommercialLicense:true }
        );
        visPanel.showHeader = true;
    
        visPanel.render(surveyResultNode);
  }
}
