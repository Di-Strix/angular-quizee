import { Injectable } from '@angular/core';
import { CheckAnswers } from '@di-strix/quizee-cloud-functions-interfaces';
import { Answer, Question, Quiz, QuizId } from '@di-strix/quizee-types';

import * as _ from 'lodash';
import { map } from 'lodash';
import { Observable, ReplaySubject, of, switchMap, tap } from 'rxjs';

import { AutoDispatchEvent, RegisterDispatcher } from '../shared/decorators/AutoDispatchEvent';
import { QuizeeService } from '../shared/services/quizee.service';

export type PlayerState = 'loadingQuizee' | 'running' | 'checkingResults' | 'gotResults';

export type PlayerAnswer = CheckAnswers.Args[0]['answers'][0];

@Injectable()
export class PlayerService {
  quizee$ = new ReplaySubject<Quiz>(1);
  currentQuestion$ = new ReplaySubject<Question>(1);
  state$ = new ReplaySubject<PlayerState>(1);
  result$ = new ReplaySubject<number>(1);

  quizee?: Quiz;
  answers: PlayerAnswer[] = [];
  savedAnswer: PlayerAnswer['answer'] = [];

  constructor(public quizeeService: QuizeeService) {}

  getState(): Observable<PlayerState> {
    return this.state$.asObservable();
  }

  getCurrentQuestion(): Observable<Question> {
    return this.currentQuestion$.asObservable();
  }

  getQuizee(): Observable<Quiz> {
    return this.quizee$.asObservable();
  }

  loadQuizee(id: QuizId): Observable<Quiz> {
    this.state$.next('loadingQuizee');

    return this.quizeeService.getQuizee(id).pipe(
      tap((quizee) => {
        this.quizee = quizee;
        this._pushQuizee();
        this._pushCurrentQuestion();
        this.state$.next('running');
      }),
      switchMap(() => this.quizee$.asObservable())
    );
  }

  saveAnswer(answer: PlayerAnswer['answer']) {
    this.savedAnswer = answer;
  }

  getSavedAnswer(): PlayerAnswer['answer'] {
    return this.savedAnswer;
  }

  @AutoDispatchEvent(['currentQuestion'])
  commitAnswer(answer?: PlayerAnswer['answer']): Observable<void> {
    const question = this._getCurrentQuestion();
    if (!question || !this.quizee) throw new Error('Quizee is not loaded');

    if (!answer) answer = this.getSavedAnswer();
    this.savedAnswer = [];

    this.answers.push({ answerTo: question.id, answer });

    if (this.answers.length === this.quizee.info.questionsCount) {
      this.state$.next('checkingResults');
      return this.getQuizee().pipe(
        switchMap((quizee) =>
          this.quizeeService.checkAnswers({ answers: this.answers, quizId: quizee.info.id }).pipe(
            tap((result) => {
              this.state$.next('gotResults');
              this.result$.next(result);
            }),
            switchMap(() => of())
          )
        )
      );
    }

    return of();
  }

  @RegisterDispatcher('quizee')
  private _pushQuizee() {
    if (!this.quizee) return;

    this.quizee$.next(_.cloneDeep(this.quizee));
  }

  @RegisterDispatcher('currentQuestion')
  private _pushCurrentQuestion() {
    const question = this._getCurrentQuestion();
    if (!question) return;

    this.currentQuestion$.next(_.cloneDeep(question));
  }

  private _getCurrentQuestion(): Question | void {
    if (!this.quizee) return;

    return this.quizee.questions[this.answers.length];
  }
}
