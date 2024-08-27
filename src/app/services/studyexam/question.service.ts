import { Injectable } from '@angular/core';
import { Question } from '../../models/studyexam';

@Injectable({
  providedIn: 'root'
})
export class QuestionService {

  dataArray:  Array <any> = [];
  //booksChanged:  Array <any> = [];

  private uquestion: Question[] = [
    {
      id: 1,
      question_type: 'text',
      image: '',
      question : 'How can you created rounded corners using CSS3?',
      category: 'CSS',
      answer1:'test test',
      answer2 : 'ee',
      answer3 : 'fff',
      status: '1',
      quiz_type: "string",
      quiz_sub_type: "string",
      quiz_title: "string",
      quiz_description: "string",
      quiz_icon: "string",
      quiz_icon_url: "string"
    }
 
  ];

  constructor() { }

  insertData(data){
    this.dataArray = [];
    this.dataArray.unshift(data);
    //this.booksChanged.next(this.dataArray);
  }

  getQuestionsFromData(): Question[] {
    return this.uquestion;
  }

  showEditQuestion(id: number) {
    return this.uquestion.find(c => c.id == id);
  }

  addQuestion(question: Question) {
    question.id = this.uquestion.length + 1;
    this.uquestion.unshift(question);
  }
  updateQuestion(question: Question) {
    const index = this.uquestion.findIndex(u => question.id === u.id);
    this.uquestion[index] = question;
  }
  deleteQuestion(question: Question) {
    this.uquestion.splice(this.uquestion.indexOf(question), 1);
  }

}
