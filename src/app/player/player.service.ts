import { Injectable } from '@angular/core';
import { CheckAnswers } from '@di-strix/quizee-cloud-functions-interfaces';
import { Question, Quiz, QuizId } from '@di-strix/quizee-types';

import * as _ from 'lodash';
import { Observable, ReplaySubject, first, of, switchMap, throwError } from 'rxjs';

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

    const subject = new ReplaySubject<Omit<Quiz, 'answers'>>(1);

    stream.pipe(first()).subscribe((quizee) => {
      this.quizee = quizee;
      this.answers = [];
      this.savedAnswer = [];

      this._pushCommitAllowed();
      this._pushQuizee();
      this._pushCurrentQuestion();

      this.state$.next('running');

      subject.next(_.cloneDeep(quizee));
      subject.complete();
    });

    return subject.asObservable();
  }

  reloadQuizee(): Observable<Omit<Quiz, 'answers'>> {
    if (!this.quizee) return throwError(() => new Error('Quizee was not loaded'));

    return this.loadQuizee(this.quizee.info.id);
  }

  saveAnswer(answer: PlayerAnswer['answer']): void {
    this.savedAnswer = answer;

    this._pushCommitAllowed();
  }

  getSavedAnswer(): PlayerAnswer['answer'] {
    return this.savedAnswer;
  }

  commitAnswer(): void {
    const question = this._getCurrentQuestion();

    if (!question || !this.quizee) return;
    if (!this._getCommitAllowed()) return;

    const answer = this.getSavedAnswer();
    this.savedAnswer = [];
    this._pushCommitAllowed();

    this.answers.push({ answerTo: question.id, answer });

    if (this.answers.length === this.quizee.info.questionsCount) {
      this.state$.next('checkingResults');

      this.getQuizee()
        .pipe(
          first(),
          switchMap((quizee) => this.quizeeService.checkAnswers({ answers: this.answers, quizId: quizee.info.id }))
        )
        .subscribe((result) => {
          this.state$.next('gotResults');
          this.result$.next(result);
        });
    }

    this._pushCurrentQuestion();
  }

  private _pushQuizee() {
    this.quizee$.next(_.cloneDeep(this.quizee as NonNullable<typeof this.quizee>));
  }

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

  private _pushCommitAllowed() {
    this.commitAllowed$.next(this._getCommitAllowed());
  }

  private _getCommitAllowed(): boolean {
    return this.savedAnswer.length > 0 && this.savedAnswer[0].length > 0;
  }
}
