import { Injectable } from '@angular/core';
import { Answer, AnswerOption, AnswerOptionId, Question, QuestionType, Quiz } from '@di-strix/quizee-types';

import * as _ from 'lodash';
import { Observable, ReplaySubject, first, throwError } from 'rxjs';
import { v4 as uuidV4 } from 'uuid';

import { RecursivePartial } from '../shared/helpers/RecursivePartial';
import { doSwitch, switchCase } from '../shared/helpers/switchCase';

export type QuestionPair = { question: Question; answer: Answer };

@Injectable()
export class QuizeeEditingService {
  quizee$: ReplaySubject<Quiz> = new ReplaySubject(1);
  currentQuestion$: ReplaySubject<QuestionPair> = new ReplaySubject(1);

  quizee?: Quiz;
  currentIndex: number = -1;

  constructor() {}

  load(quizee: Quiz): Observable<Quiz> {
    return this._exec(() => {
      this._load(quizee);

      this._pushQuizee();
      this._pushCurrentQuestion();

      return this.get();
    });
  }

  private _load(quizee: Quiz): void {
    if (quizee.answers.length !== quizee.questions.length) throw new Error("Answers and questions count isn't equal");
    if (quizee.answers.length < 1) throw new Error('Quizee should contain at least one question');

    this.quizee = _.cloneDeep(quizee);
    this._selectQuestion(0);
  }

  create(): Observable<Quiz> {
    return this._exec(() => {
      this._create();

      this._pushQuizee();
      this._pushCurrentQuestion();

      return this.get();
    });
  }

  private _create(): void {
    const question = this._createQuestionObject();

    return this._load({
      info: {
        caption: 'New quizee',
        id: '',
        img: '',
        questionsCount: 0,
      },
      answers: [question.answer],
      questions: [question.question],
    });
  }

  modify(changes: RecursivePartial<Quiz>): Observable<Quiz> {
    return this._exec(() => {
      this._modify(changes);

      this._pushQuizee();

      return this.get();
    });
  }

  private _modify(changes: RecursivePartial<Quiz>): void {
    if (!this.quizee) throw new Error('Quizee is not loaded');

    this.quizee = _.merge({}, this.quizee, changes);
  }

  get(): Observable<Quiz> {
    return this.quizee$;
  }

  createQuestion(): Observable<QuestionPair> {
    return this._exec(() => {
      this._createQuestion();

      this._pushQuizee();
      this._pushCurrentQuestion();

      return this.getCurrentQuestion();
    });
  }

  private _createQuestion(): void {
    if (!this.quizee) throw new Error('Quizee is not loaded');

    const qp = this._createQuestionObject();

    this.quizee.answers.push(qp.answer);
    this.quizee.questions.push(qp.question);

    this._selectQuestion(this.quizee.questions.length - 1);
  }

  selectQuestion(index: number): Observable<QuestionPair> {
    return this._exec(() => {
      this._selectQuestion(index);

      this._pushCurrentQuestion();

      return this.getCurrentQuestion();
    });
  }

  private _selectQuestion(index: number): void {
    if (!this.quizee || index < 0 || !_.inRange(index, this.quizee.questions.length))
      throw new Error('Index is out of range');

    this.currentIndex = index;
  }

  modifyCurrentQuestion(changes: RecursivePartial<QuestionPair>): Observable<QuestionPair> {
    return this._exec(() => {
      this._modifyCurrentQuestion(changes);

      this._pushQuizee();
      this._pushCurrentQuestion();

      return this.getCurrentQuestion();
    });
  }

  private _modifyCurrentQuestion(changes: RecursivePartial<QuestionPair>): void {
    if (!this.quizee) throw new Error('Quizee is not loaded');

    _.merge(this.quizee.answers[this.currentIndex], changes.answer);
    _.merge(this.quizee.questions[this.currentIndex], changes.question);
  }

  getCurrentQuestion(): Observable<QuestionPair> {
    return this.currentQuestion$;
  }

  private _getCurrentQuestion(): QuestionPair {
    if (!this.quizee) throw new Error('Quizee is not loaded');

    return {
      question: this.quizee.questions[this.currentIndex],
      answer: this.quizee.answers[this.currentIndex],
    };
  }

  setAnswerConfig(changes: RecursivePartial<Answer['config']>): Observable<QuestionPair> {
    return this._exec(() => {
      this._setAnswerConfig(changes);

      this._pushQuizee();
      this._pushCurrentQuestion();

      return this.getCurrentQuestion();
    });
  }

  private _setAnswerConfig(changes: RecursivePartial<Answer['config']>): void {
    if (!this.quizee) throw new Error('Quizee is not loaded');

    _.merge(this._getCurrentQuestion().answer.config, changes);
  }

  setQuestionType(qt: QuestionType): Observable<QuestionPair> {
    return this._exec(() => {
      this._setQuestionType(qt);

      this._pushQuizee();
      this._pushCurrentQuestion();

      return this.getCurrentQuestion();
    });
  }

  private _setQuestionType(qt: QuestionType): void {
    if (!this.quizee) throw new Error('Quizee is not loaded');

    const qp = this._getCurrentQuestion();

    doSwitch(qp.question.type, qt, [
      switchCase('*', 'WRITE_ANSWER', () => {
        this._setAnswer(['']);
        this._setAnswerOptions([]);
      }),
      switchCase('WRITE_ANSWER', '*', () => {
        const answerOption = this._createAnswerOption();
        this._setAnswer([answerOption.id]);
        this._setAnswerOptions([answerOption]);
      }),
    ]);

    this._modifyCurrentQuestion({ question: { type: qt } });
  }

  setAnswer(answer: Answer['answer']): Observable<QuestionPair> {
    return this._exec(() => {
      this._setAnswer(answer);

      this._pushCurrentQuestion();
      this._pushQuizee();

      return this.getCurrentQuestion();
    });
  }

  private _setAnswer(answer: Answer['answer']): void {
    if (!this.quizee) throw new Error('Quizee is not loaded');

    this.quizee.answers[this.currentIndex].answer = answer;
  }

  setAnswerOptions(answerOptions: AnswerOption[]): Observable<QuestionPair> {
    return this._exec(() => {
      this._setAnswerOptions(answerOptions);

      this._pushQuizee();
      this._pushCurrentQuestion();

      return this.getCurrentQuestion();
    });
  }

  private _setAnswerOptions(answerOptions: AnswerOption[]): void {
    if (!this.quizee) throw new Error('Quizee is not loaded');

    this.quizee.questions[this.currentIndex].answerOptions = _.cloneDeep(answerOptions);
  }

  addAnswerOption(): Observable<QuestionPair> {
    return this._exec(() => {
      this._addAnswerOption();

      this._pushQuizee();
      this._pushCurrentQuestion();

      return this.getCurrentQuestion();
    });
  }

  private _addAnswerOption(): void {
    if (!this.quizee) throw new Error('Quizee is not loaded');

    const pair = this._getCurrentQuestion();

    this._setAnswerOptions([...pair.question.answerOptions, this._createAnswerOption()]);
  }

  removeAnswerOption(id: AnswerOptionId): Observable<QuestionPair> {
    return this._exec(() => {
      this._removeAnswerOption(id);

      this._pushQuizee();
      this._pushCurrentQuestion();

      return this.getCurrentQuestion();
    });
  }

  private _removeAnswerOption(id: AnswerOptionId): void {
    if (!this.quizee) throw new Error('Quizee is not loaded');

    const pair = this._getCurrentQuestion();

    this._setAnswerOptions(pair.question.answerOptions.filter((v) => v.id !== id));
    this._setAnswer(pair.answer.answer.filter((answerId) => answerId !== id));
  }

  private _exec<T>(fn: () => Observable<T>): Observable<T> {
    try {
      return fn();
    } catch (err) {
      return throwError(() => err);
    }
  }

  private _pushQuizee() {
    if (!this.quizee) return;

    this.quizee$.next(_.cloneDeep(this.quizee));
  }

  private _pushCurrentQuestion() {
    if (!this.quizee) return;

    this.currentQuestion$.next(_.cloneDeep(this._getCurrentQuestion()));
  }

  private _createQuestionObject(): QuestionPair {
    const id = uuidV4();
    const answerOption = this._createAnswerOption();

    return {
      answer: { answer: [answerOption.id], answerTo: id, config: { equalCase: false } },
      question: { id, answerOptions: [answerOption], caption: '', type: 'ONE_TRUE' },
    };
  }

  private _createAnswerOption() {
    return { id: uuidV4(), value: '' };
  }
}
