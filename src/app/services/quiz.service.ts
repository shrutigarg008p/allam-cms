import { Injectable } from '@angular/core';
import { Quiz } from '../models/quiz';

@Injectable({
  providedIn: 'root'
})
export class QuizService {

  private uquiz: Quiz[] = [
    {
      id: 1,
      title: 'Durgesh',
      category: 'Sceince',
      description:'test test',
      isPublish: 'yes',
      status: 'active',
      insertDate: '31 Aug 2020'
    },
    {
      id: 2,
      title: 'Sudhir',
      category: 'Technology',
      description:'test test again',
      isPublish: 'yes',
      status: 'active',
      insertDate: '31 Aug 2020'
    },
    {
      id: 3,
      title: 'Ashish',
      category: 'Technology',
      description:'test test again',
      isPublish: 'yes',
      status: 'active',
      insertDate: '31 Aug 2020'
    },
    {
      id: 4,
      title: 'Prabhas',
      category: 'History',
      description:'test test again',
      isPublish: 'yes',
      status: 'active',
      insertDate: '31 Aug 2020'
    },
    {
      id: 5,
      title: 'Santosh',
      category: 'Technology',
      description:'test test again',
      isPublish: 'yes',
      status: 'active',
      insertDate: '31 Aug 2020'
    }
  ];

  constructor() { }

  getQuizsFromData(): Quiz[] {
    return this.uquiz;
  }

  showEditQuiz(id: number) {
    return this.uquiz.find(c => c.id == id);
  }

  addQuiz(quiz: Quiz) {
    quiz.id = this.uquiz.length + 1;
    this.uquiz.unshift(quiz);
  }
  updateQuiz(quiz: Quiz) {
    const index = this.uquiz.findIndex(u => quiz.id === u.id);
    this.uquiz[index] = quiz;
  }
  deleteQuiz(quiz: Quiz) {
    this.uquiz.splice(this.uquiz.indexOf(quiz), 1);
  }

}
