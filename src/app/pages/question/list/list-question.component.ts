import { Component, OnInit, Pipe } from '@angular/core';
import { Question } from '../../../models/question';
import { QuestionService } from '../../../services/question.service';
import { PocquestionService } from '../../../services/pocquestion.service';
import {ToasterModule, ToasterService} from 'angular2-toaster'

import { Router } from '@angular/router';

//import {OrderBy} from "../../../pipes/orderBy"
//import {Format} from "../../../pipes/format"
//import {OrderrByPipe} from '../../../pipes/orderby.pipe';

@Component({
  selector: 'app-question',
  templateUrl: './list-question.component.html',
  styleUrls: ['./list-question.component.scss'],
  //pipes: [OrderBy] 
})


export class ListQuestionComponent implements OnInit {

  questions:  any;

  private toasterService: ToasterService;

  term: string;
  config: any;
  filters: any;

  isDesc: boolean = false;
  column: string = 'id';
  direction: number;


  
  constructor(private pocquestionService: PocquestionService,private questionService: QuestionService, private router: Router,private alertService: ToasterService) { 

   this.term = ""; 
    this.alertService = alertService; 
    this.config = {
      itemsPerPage: 5,
      currentPage: 1,
      totalItems: 0
    };
    }

  ngOnInit() {
    this.questions = this.getAllQuestion();
  }


  private getAllQuestion() {
        this.pocquestionService.getAll().subscribe(questions => { 
        this.questions = questions; 
        this.config.totalItems=questions.length;
        });
  }


  pageChanged(event){
    this.config.currentPage = event;
  }

  /*sort(colName) {
    this.questions.sort((a, b) => a[colName] > b[colName] ? 1 : a[colName] < b[colName] ? -1 : 0)
	}*/

	sort(property){
		console.log(property);
	    this.isDesc = !this.isDesc; //change the direction    
	    this.column = property;
	    this.direction = this.isDesc ? 1 : -1;
	}

  changeStatus(question: Question) {
    if(question.status=="0"){
      question.status="1";
    }
    else{
      question.status="0";
    }
    this.questionService.updateQuestion(question);
    console.log('category updated');
    
  }

/*  transform(question: Question, searchText: string): any {
    if (searchText) {
        return question.question(item => {
            const filter = Object.keys(item);
            // Array.some() returns true if at least one entry meets the given condition
            return filter.some(
                key => item[key].toLowerCase().indexOf(searchText.toLowerCase()) !== -1
            )
        });
    }

    return question;
}*/

  getQuestions(): Question[] {
    return this.questionService.getQuestionsFromData();
  }

  removeQuestion(question: Question) {
  	if(confirm("Are you sure to delete- "+question.question)) {
    	this.questionService.deleteQuestion(question);
  	}
    
  }

}
