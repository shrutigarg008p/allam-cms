import { Injectable } from '@angular/core';
import { Question } from '../models/question';

@Injectable({
  providedIn: 'root'
})
export class QuestionService {

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
    },
    {
      id: 2,
      question_type: 'text',
      image: '',
      question : 'Why is keyword research important?',
      category: 'Digital Marketing',
      answer1:'test test',
      answer2 : 'fff',
      answer3 : 'ggg',
      status: '0',
    },
    {
      id: 3,
      question_type: 'text',
      image: '',
      question : 'How can you created rounded corners using CSS3?',
      category: 'CSS',
      answer1:'test test',
      answer2 : 'test',
      answer3 : '2 test',
      status: '1',
    },
    {
      id: 4,
      question_type: 'text',
      image: '',
      question : 'Why is keyword research important?',
      category: 'Digital Marketing',
      answer1:'test test',
      answer2 : 'hhh',
      answer3 : 'jjj',
      status: '1',
    },
    {
      id: 5,
      question_type: 'text',
      image: '',
      question : 'Why is keyword research important?',
      category: 'Digital Marketing',
      answer1:'test test',
      answer2 : 'vvvv',
      answer3 : 'bbbb',
      status: '1',
    },
    {
      id: 6,
      question_type: 'text',
      image: '',
      question : 'What is keyword research?',
      category: 'Digital Marketing',
      answer1:'test test',
      answer2 : 'vvvv',
      answer3 : 'bbbb',
      status: '1',
    },
  ];

  constructor() { }

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
