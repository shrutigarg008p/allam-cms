import { Component, Input, EventEmitter, Output, OnInit } from "@angular/core";
import * as Survey from "survey-angular";
import * as widgets from "surveyjs-widgets";

widgets.jquerybarrating(Survey);
widgets.jqueryuidatepicker(Survey);

Survey.JsonObject.metaData.addProperty("questionbase", "popupdescription:text");
Survey.JsonObject.metaData.addProperty("page", "popupdescription:text");

Survey.StylesManager.applyTheme("default");

@Component({
  // tslint:disable-next-line:component-selector
  selector: "preview-survey", 
  template: `<div class="survey-container contentcontainer codecontainer">
    <div id="surveyElement"></div>
  </div>`,
})
export class PreviewSurveyComponent implements OnInit {
  @Input()
  _json: object;
  get json(): object {
      return this._json;
  }
  @Input() 
  set json(value: object)
  {
    this._json=value;
    if(typeof(value)=="object" && Object.keys(value).length > 0){
      this.surveyView();
    }
  };
  result: any;

  ngOnInit() {
    
  }

  surveyView(){
    const surveyModel = new Survey.Model(this.json);
    surveyModel.onAfterRenderQuestion.add((survey, options) => {
      if (!options.question.popupdescription) {
        return;
      }
      // Add a button;
      const btn = document.createElement("button");
      btn.className = "btn btn-info btn-xs";
      btn.innerHTML = "More Info";
      btn.onclick = function () {
        // showDescription(question);
        alert(options.question.popupdescription);
      };
      const header = options.htmlElement.querySelector("h5");
      const span = document.createElement("span");
      span.innerHTML = "  ";
      header.appendChild(span);
      header.appendChild(btn);
    });
    surveyModel.onComplete.add((result, options) => {
      this.result = result.data;
    });
    surveyModel.mode='display';
    Survey.SurveyNG.render("surveyElement", { model: surveyModel });
  }
}
