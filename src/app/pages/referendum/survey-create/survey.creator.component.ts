import { Component, Input, Output, EventEmitter } from "@angular/core";
import * as SurveyKo from "survey-knockout";
import * as SurveyCreator from "survey-creator";
import * as widgets from "surveyjs-widgets";

widgets.jquerybarrating(SurveyKo);
widgets.jqueryuidatepicker(SurveyKo);

SurveyCreator.StylesManager.applyTheme("default");

@Component({
  selector: "survey-creator",
  template: `
    <div id="surveyCreatorContainer"></div>
  `
})
export class SurveyCreatorComponent {
  surveyCreator: SurveyCreator.SurveyCreator;
  _json: any;
  get json(): any {
      return this._json;
  }
  @Input() 
  set json(value: any)
  {
    if(typeof(this.surveyCreator)!="undefined"){
      this.surveyCreator.text=this._json=JSON.stringify(value);
    }
  };
  @Output() surveySaved: EventEmitter<Object> = new EventEmitter();
  ngOnInit() {
    SurveyKo.JsonObject.metaData.addProperty(
      "questionbase",
      "popupdescription:text"
    );
    SurveyKo.JsonObject.metaData.addProperty("page", "popupdescription:text");

    let options = {
      questionTypes: ["text", "comment", "checkbox", "radiogroup", "dropdown", "matrix", "rating", "image", "html"],
      showJSONEditorTab: false,
      showPagesToolbox: false,
      showPagesInTestSurveyTab: false,
      isRTL: true,
      showPropertyGrid: true,
      showToolbox: "left",
      showSurveyTitle: "never",
      allowControlSurveyTitleVisibility: false
    };
    this.surveyCreator = new SurveyCreator.SurveyCreator(
      "surveyCreatorContainer",
      options
    );
    this.surveyCreator.haveCommercialLicense = true;
    this.surveyCreator.text = this.json;
    this.surveyCreator.saveSurveyFunc = this.saveMySurvey;
    this.surveyCreator.isAutoSave = false;
    this.surveyCreator.showState = false;
    this.surveyCreator.showOptions = true;
  }

  saveMySurvey = () => {
    console.log(JSON.stringify(this.surveyCreator.text));
    this.surveySaved.emit(JSON.parse(this.surveyCreator.text));
  };
}
