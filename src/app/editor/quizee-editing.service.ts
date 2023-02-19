import { Injectable } from '@angular/core';
import { Answer, AnswerOption, AnswerOptionId, Question, QuestionType, Quiz } from '@di-strix/quizee-types';
import { VerificationErrors } from '@di-strix/quizee-verification-functions';
import { verifyAnswer, verifyQuestion, verifyQuizee } from '@di-strix/quizee-verification-functions';

import * as _ from 'lodash';
import { Observable, ReplaySubject, distinctUntilChanged, from, map, switchMap, tap, zip } from 'rxjs';
import { v4 as uuidV4 } from 'uuid';

import { ErrorAsStream } from '../shared/decorators/ErrorAsStream';
import { RecursivePartial } from '../shared/helpers/RecursivePartial';
import { doSwitch, switchCase } from '../shared/helpers/switchCase';

export type QuestionPair = { question: Question; answer: Answer; index: number };
export type QuestionErrors = {
  [K in keyof Pick<QuestionPair, 'question' | 'answer'>]: VerificationErrors;
};
export type QuestionChanges = RecursivePartial<Pick<QuestionPair, 'answer' | 'question'>>;
export type AnswerConfigChanges = RecursivePartial<Answer['config']>;

@Injectable()
export class QuizeeEditingService {
  quizee$: ReplaySubject<Quiz> = new ReplaySubject(1);
  currentQuestionIndex$ = new ReplaySubject<number>(-1);

  private _quizee?: Quiz;
  set quizee(quizee) {
    if (!quizee) return;

    this._quizee = quizee;
    this.quizee$.next(_.cloneDeep(quizee));
  }
  get quizee() {
    return this._quizee;
  }

  private _currentIndex: number = -1;
  set currentQuestionIndex(index: number) {
    if (this._currentIndex === index || index < 0) return;

    this._currentIndex = index;
    this.currentQuestionIndex$.next(index);
  }
  get currentQuestionIndex() {
    return this._currentIndex;
  }

  constructor() {}

  getQuizeeErrors(): Observable<VerificationErrors> {
    return this.quizee$.pipe(switchMap((q) => from(verifyQuizee(q))));
  }

  getCurrentQuestionErrors(): Observable<QuestionErrors> {
    return this.currentQuestionIndex$.pipe(switchMap((index) => this.getQuestionErrors(index)));
  }

  getQuestionErrors(index: number): Observable<QuestionErrors> {
    return this.getQuestion(index).pipe(
      switchMap((q) => zip(from(verifyQuestion(q.question)), from(verifyAnswer(q.answer)))),
      map(([question, answer]) => ({ question, answer }))
    );
  }

  @ErrorAsStream()
  loadQuizee(quizee: Quiz): Observable<Quiz> {
    if (quizee.answers.length !== quizee.questions.length) throw new Error("Answers and questions count isn't equal");
    if (quizee.answers.length < 1) throw new Error('Quizee should contain at least one question');

    this.quizee = _.cloneDeep(quizee);
    this.selectQuestion(0);

    return this.getQuizee();
  }

  createQuizee(): Observable<Quiz> {
    const question = this._createQuestionObject();

    return this.loadQuizee({
      info: {
        caption: 'New quizee',
        id: '',
        img: '',
        questionsCount: 1,
      },
      answers: [question.answer],
      questions: [question.question],
    });
  }

  @ErrorAsStream()
  modifyQuizee(changes: RecursivePartial<Quiz>): Observable<Quiz> {
    this._checkQuizeeExistence();

    this.quizee = _.merge({}, this.quizee, changes);

    return this.getQuizee();
  }

  getQuizee(): Observable<Quiz> {
    return this.quizee$.pipe(distinctUntilChanged(_.isEqual));
  }

  @ErrorAsStream()
  createQuestion(): Observable<QuestionPair> {
    this._checkQuizeeExistence();

    const qp = this._createQuestionObject();

    this.quizee!.answers.push(qp.answer);
    this.quizee!.questions.push(qp.question);
    this.modifyQuizee({ info: { questionsCount: this.quizee!.questions.length } });

    this.selectQuestion(this.quizee!.questions.length - 1);

    return this.getQuestion(this.currentQuestionIndex);
  }

  modifyCurrentQuestion(changes: QuestionChanges): Observable<QuestionPair> {
    return this.modifyQuestion(this.currentQuestionIndex, changes);
  }

  @ErrorAsStream()
  modifyQuestion(index: number, changes: QuestionChanges): Observable<QuestionPair> {
    this._checkQuizeeExistence();
    this._checkRange(index);

    _.merge(this.quizee!.answers[index], changes.answer);
    _.merge(this.quizee!.questions[index], changes.question);

    this.quizee = this.quizee;

    return this.getQuestion(index);
  }

  @ErrorAsStream()
  selectQuestion(index: number): Observable<QuestionPair> {
    this._checkQuizeeExistence();
    this._checkRange(index);

    this.currentQuestionIndex = index;

    return this.getCurrentQuestion();
  }

  getCurrentQuestion(): Observable<QuestionPair> {
    return this.currentQuestionIndex$.pipe(switchMap((index) => this.getQuestion(index)));
  }

  getQuestion(index: number): Observable<QuestionPair> {
    return this.quizee$.pipe(
      tap(() => {
        this._checkRange(index);
      }),
      map((value) => _.cloneDeep(value)),
      map((value) => ({ question: value.questions[index], answer: value.answers[index], index })),
      distinctUntilChanged(_.isEqual)
    );
  }

  setCurrentQuestionAnswerConfig(changes: AnswerConfigChanges): Observable<QuestionPair> {
    return this.setAnswerConfig(this.currentQuestionIndex, changes);
  }

  @ErrorAsStream()
  setAnswerConfig(index: number, changes: AnswerConfigChanges): Observable<QuestionPair> {
    this._checkQuizeeExistence();
    this._checkRange(index);

    _.merge(this._getQuestion(index).answer.config, changes);

    this.quizee = this.quizee;

    return this.getQuestion(index);
  }

  setCurrentQuestionType(qt: QuestionType): Observable<QuestionPair> {
    return this.setQuestionType(this.currentQuestionIndex, qt);
  }

  @ErrorAsStream()
  setQuestionType(index: number, qt: QuestionType): Observable<QuestionPair> {
    this._checkQuizeeExistence();
    this._checkRange(index);

    const qp = this._getCurrentQuestion();

    doSwitch(qp.question.type, qt, [
      switchCase('*', 'WRITE_ANSWER', () => {
        this.setAnswer(index, ['Correct answer']);
        this.setAnswerOptions(index, []);
      }),
      switchCase('WRITE_ANSWER', '*', () => {
        const answerOption = this._createAnswerOption();
        this.setAnswer(index, [answerOption.id]);
        this.setAnswerOptions(index, [answerOption]);
      }),
    ]);

    this.modifyQuestion(index, { question: { type: qt } });

    return this.getQuestion(index);
  }

  setCurrentQuestionAnswer(answer: Answer['answer']): Observable<QuestionPair> {
    return this.setAnswer(this.currentQuestionIndex, answer);
  }

  @ErrorAsStream()
  setAnswer(index: number, answer: Answer['answer']): Observable<QuestionPair> {
    this._checkQuizeeExistence();
    this._checkRange(index);

    this.quizee!.answers[index].answer = answer;

    this.quizee = this.quizee;

    return this.getQuestion(index);
  }

  setCurrentQuestionAnswerOptions(answerOptions: AnswerOption[]): Observable<QuestionPair> {
    return this.setAnswerOptions(this.currentQuestionIndex, answerOptions);
  }

  @ErrorAsStream()
  setAnswerOptions(index: number, answerOptions: AnswerOption[]): Observable<QuestionPair> {
    this._checkQuizeeExistence();
    this._checkRange(index);

    this.quizee!.questions[index].answerOptions = _.cloneDeep(answerOptions);

    this.quizee = this.quizee;

    return this.getQuestion(index);
  }

  addAnswerOptionForCurrentQuestion(): Observable<QuestionPair> {
    return this.addAnswerOption(this.currentQuestionIndex);
  }

  @ErrorAsStream()
  addAnswerOption(index: number): Observable<QuestionPair> {
    this._checkQuizeeExistence();
    this._checkRange(index);

    const pair = this._getQuestion(index);

    this.setAnswerOptions(index, [...pair.question.answerOptions, this._createAnswerOption()]);

    return this.getQuestion(index);
  }

  removeAnswerOptionForCurrentQuestion(id: AnswerOptionId): Observable<QuestionPair> {
    return this.removeAnswerOption(this.currentQuestionIndex, id);
  }

  @ErrorAsStream()
  removeAnswerOption(index: number, id: AnswerOptionId): Observable<QuestionPair> {
    this._checkQuizeeExistence();
    this._checkRange(index);

    const pair = this._getQuestion(index);

    this.setAnswerOptions(
      index,
      pair.question.answerOptions.filter((v) => v.id !== id)
    );
    this.setAnswer(
      index,
      pair.answer.answer.filter((answerId) => answerId !== id)
    );

    return this.getQuestion(index);
  }

  private _getCurrentQuestion(): QuestionPair {
    return this._getQuestion(this.currentQuestionIndex);
  }

  private _getQuestion(index: number): QuestionPair {
    this._checkQuizeeExistence();
    this._checkRange(index);

    return {
      question: this.quizee!.questions[index],
      answer: this.quizee!.answers[index],
      index,
    };
  }

  private _createQuestionObject(): Omit<QuestionPair, 'index'> {
    const id = uuidV4();
    const answerOption = this._createAnswerOption();

    return {
      answer: { answer: [answerOption.id], answerTo: id, config: { equalCase: false } },
      question: { id, answerOptions: [answerOption], caption: 'New question', type: 'ONE_TRUE' },
    };
  }

  private _createAnswerOption() {
    return { id: uuidV4(), value: 'Answer option' };
  }

  private _checkRange(index: number): void {
    this._checkQuizeeExistence();
    if (index < 0 || !_.inRange(index, this.quizee!.questions.length)) throw new Error('Index is out of range');
  }

  private _checkQuizeeExistence() {
    if (!this.quizee) throw new Error('Quizee is not loaded');
  }
}
