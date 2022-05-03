import { Injectable } from '@angular/core';
import { Quiz } from '@di-strix/quizee-types';

import * as _ from 'lodash';
import { Observable, ReplaySubject } from 'rxjs';

type RecursivePartial<T> = {
  [K in keyof T]?: RecursivePartial<T[K]>;
};

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
      questions: [],
    });
  }

  modify(changes: RecursivePartial<Quiz>): Observable<Quiz> {
    return this.load(_.merge({}, this.quizee, changes));
  }

  get(): Observable<Quiz> {
    return this.quizee$;
  }
}
