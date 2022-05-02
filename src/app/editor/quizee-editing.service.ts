import { Injectable } from '@angular/core';
import { Quiz } from '@di-strix/quizee-types';

import { Observable, ReplaySubject } from 'rxjs';

@Injectable()
export class QuizeeEditingService {
  quizee$: ReplaySubject<Quiz> = new ReplaySubject(1);
  quizee?: Quiz;

  constructor() {}

  load(quizee: Quiz): Observable<Quiz> {
    this.quizee = quizee;
    this.quizee$.next(quizee);

    return this.get();
  }

  create(): Observable<Quiz> {
    return this.load({
      info: {
        caption: 'New quizee',
        id: '',
        img: '',
        questionsCount: 0,
      },
      answers: [],
      questions: [{ caption: 'abc', answerOptions: [], id: '1', type: 'ONE_TRUE' }],
    });
  }

  modify(changes: Partial<Quiz>): Observable<Quiz> {
    return this.load(Object.assign({}, this.quizee, changes));
  }

  get(): Observable<Quiz> {
    return this.quizee$;
  }
}
