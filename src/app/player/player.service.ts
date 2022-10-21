import { Injectable } from '@angular/core';
import { CheckAnswers } from '@di-strix/quizee-cloud-functions-interfaces';
import { Question, Quiz, QuizId } from '@di-strix/quizee-types';

import * as _ from 'lodash';
import { Observable, ReplaySubject, first, of, switchMap, tap, throwError } from 'rxjs';

import { AutoDispatchEvent, RegisterDispatcher } from '../shared/decorators/AutoDispatchEvent';
import { QuizeeService } from '../shared/services/quizee.service';

export type PlayerState = 'loadingQuizee' | 'running' | 'checkingResults' | 'gotResults';

export type PlayerAnswer = CheckAnswers.Args[0]['answers'][0];

@Injectable()
export class PlayerService {
  quizee$ = new ReplaySubject<Omit<Quiz, 'answers'>>(1);
  currentQuestion$ = new ReplaySubject<Question>(1);
  state$ = new ReplaySubject<PlayerState>(1);
  result$ = new ReplaySubject<number>(1);
  commitAllowed$ = new ReplaySubject<boolean>(1);

  quizee?: Omit<Quiz, 'answers'>;
  answers: PlayerAnswer[] = [];
  savedAnswer: PlayerAnswer['answer'] = [];

  constructor(public quizeeService: QuizeeService) {}

  getState(): Observable<PlayerState> {
    return this.state$.asObservable();
  }

  getCurrentQuestion(): Observable<Question> {
    return this.currentQuestion$.asObservable();
  }

  getQuizee(): Observable<Omit<Quiz, 'answers'>> {
    return this.quizee$.asObservable();
  }

  getResult(): Observable<number> {
    return this.result$.asObservable();
  }

  commitAllowed(): Observable<boolean> {
    return this.commitAllowed$.asObservable();
  }

  loadQuizee(id: QuizId): Observable<Omit<Quiz, 'answers'>> {
    this.state$.next('loadingQuizee');

    const stream = id === this.quizee?.info.id ? of(this.quizee) : this.quizeeService.getPublicQuizee(id);

    return stream.pipe(
      tap((quizee) => {
        this.quizee = quizee;
        this.answers = [];
        this.savedAnswer = [];

        this._pushCommitAllowed();
        this._pushQuizee();
        this._pushCurrentQuestion();

        this.state$.next('running');
      }),
      switchMap(() => this.getQuizee())
    );
  }

  reloadQuizee(): Observable<Omit<Quiz, 'answers'>> {
    if (!this.quizee) return throwError(() => new Error('Quizee was not loaded'));

    return this.loadQuizee(this.quizee.info.id);
  }

  @AutoDispatchEvent(['commitAllowed'])
  saveAnswer(answer: PlayerAnswer['answer']): Observable<void> {
    this.savedAnswer = answer;

    return of();
  }

  getSavedAnswer(): PlayerAnswer['answer'] {
    return this.savedAnswer;
  }

  @AutoDispatchEvent(['currentQuestion'])
  commitAnswer(): Observable<void> {
    const question = this._getCurrentQuestion();
    if (!question || !this.quizee) throw new Error('Quizee is not loaded or all the question were answered');

    if (!this._getCommitAllowed()) throw new Error('Commit is not allowed since answer is empty');

    const answer = this.getSavedAnswer();
    this.savedAnswer = [];
    this._pushCommitAllowed();

    this.answers.push({ answerTo: question.id, answer });

    if (this.answers.length === this.quizee.info.questionsCount) {
      this.state$.next('checkingResults');
      return this.getQuizee().pipe(
        first(),
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
    if (this.quizee.questions.length === this.answers.length) return;

    return this.quizee.questions[this.answers.length];
  }

  @RegisterDispatcher('commitAllowed')
  private _pushCommitAllowed() {
    this.commitAllowed$.next(this._getCommitAllowed());
  }

  private _getCommitAllowed(): boolean {
    return this.savedAnswer.length > 0 && this.savedAnswer[0].length > 0;
  }
}
