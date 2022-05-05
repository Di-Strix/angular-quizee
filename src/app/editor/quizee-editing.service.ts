import { Injectable } from '@angular/core';
import { Answer, Question, Quiz } from '@di-strix/quizee-types';

import * as _ from 'lodash';
import { Observable, ReplaySubject, throwError } from 'rxjs';
import { v4 as uuidV4 } from 'uuid';

import { RecursivePartial } from '../shared/helpers/RecursivePartial';

export type QuestionPair = { question: Question; answer: Answer };

@Injectable()
export class QuizeeEditingService {
  quizee$: ReplaySubject<Quiz> = new ReplaySubject(1);
  currentQuestion$: ReplaySubject<QuestionPair> = new ReplaySubject(1);

  quizee?: Quiz;
  currentIndex: number = -1;

  constructor() {}

  load(quizee: Quiz): Observable<Quiz> {
    if (quizee.answers.length !== quizee.questions.length)
      return throwError(() => new Error("Answers and questions count isn't equal"));

    this.quizee = _.cloneDeep(quizee);
    this.quizee$.next(_.cloneDeep(quizee));
    this.selectQuestion(0);

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
    if (!this.quizee) return throwError(() => new Error('Quizee is not loaded'));

    return this.load(_.merge({}, this.quizee, changes));
  }

  get(): Observable<Quiz> {
    return this.quizee$;
  }

  createQuestion(): Observable<QuestionPair> {
    if (!this.quizee) return throwError(() => new Error('Quizee is not loaded'));

    const id = uuidV4();
    this.quizee.answers.push({ answer: [''], answerTo: id, config: { equalCase: false } });
    this.quizee.questions.push({ id, answerOptions: [], caption: '', type: 'ONE_TRUE' });

    this.quizee$.next(_.cloneDeep(this.quizee));
    return this.selectQuestion(this.quizee.questions.length - 1);
  }

  selectQuestion(index: number): Observable<QuestionPair> {
    if (!this.quizee || index < 0 || !_.inRange(index, this.quizee.questions.length || 0))
      return throwError(() => new Error('Index is out of range'));

    this.currentIndex = index;
    this.currentQuestion$.next(
      _.cloneDeep({ question: this.quizee.questions[index], answer: this.quizee.answers[index] })
    );

    return this.getCurrentQuestion();
  }

  modifyCurrentQuestion(changes: RecursivePartial<QuestionPair>): Observable<QuestionPair> {
    if (!this.quizee) return throwError(() => new Error('Quizee is not loaded'));
    if (this.currentIndex < 0) return throwError(() => new Error('Question is not selected'));

    _.merge(this.quizee.answers[this.currentIndex], changes.answer);
    _.merge(this.quizee.questions[this.currentIndex], changes.question);

    this.quizee$.next(this.quizee);
    this.selectQuestion(this.currentIndex);

    return this.getCurrentQuestion();
  }

  getCurrentQuestion(): Observable<QuestionPair> {
    return this.currentQuestion$;
  }
}
