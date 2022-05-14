import { Injectable } from '@angular/core';
import { Answer, AnswerOption, AnswerOptionId, Question, QuestionType, Quiz } from '@di-strix/quizee-types';

import * as _ from 'lodash';
import { Observable, ReplaySubject } from 'rxjs';
import { v4 as uuidV4 } from 'uuid';

import { AutoDispatchEvent, RegisterDispatcher } from '../shared/decorators/AutoDispatchEvent';
import { RecursivePartial } from '../shared/helpers/RecursivePartial';
import { doSwitch, switchCase } from '../shared/helpers/switchCase';

export type QuestionPair = { question: Question; answer: Answer };

@Injectable()
export class QuizeeEditingService {
  quizee$: ReplaySubject<Quiz> = new ReplaySubject(1);
  currentQuestion$: ReplaySubject<QuestionPair> = new ReplaySubject(1);

  quizee?: Quiz;
  currentIndex: number = -1;

  @AutoDispatchEvent(['quizee', 'currentQuestion'])
  load(quizee: Quiz): Observable<Quiz> {
    if (quizee.answers.length !== quizee.questions.length) throw new Error("Answers and questions count isn't equal");
    if (quizee.answers.length < 1) throw new Error('Quizee should contain at least one question');

    this.quizee = _.cloneDeep(quizee);
    this.selectQuestion(0);

    return this.get();
  }

  @AutoDispatchEvent(['quizee', 'currentQuestion'])
  create(): Observable<Quiz> {
    const question = this._createQuestionObject();

    return this.load({
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

  @AutoDispatchEvent(['quizee'])
  modify(changes: RecursivePartial<Quiz>): Observable<Quiz> {
    if (!this.quizee) throw new Error('Quizee is not loaded');

    this.quizee = _.merge({}, this.quizee, changes);

    return this.get();
  }

  get(): Observable<Quiz> {
    return this.quizee$;
  }

  @AutoDispatchEvent(['quizee', 'currentQuestion'])
  createQuestion(): Observable<QuestionPair> {
    if (!this.quizee) throw new Error('Quizee is not loaded');

    const qp = this._createQuestionObject();

    this.quizee.answers.push(qp.answer);
    this.quizee.questions.push(qp.question);
    this.modify({ info: { questionsCount: this.quizee.questions.length } });

    this.selectQuestion(this.quizee.questions.length - 1);

    return this.getCurrentQuestion();
  }

  @AutoDispatchEvent(['currentQuestion'])
  selectQuestion(index: number): Observable<QuestionPair> {
    if (!this.quizee || index < 0 || !_.inRange(index, this.quizee.questions.length))
      throw new Error('Index is out of range');

    this.currentIndex = index;

    return this.getCurrentQuestion();
  }

  @AutoDispatchEvent(['quizee', 'currentQuestion'])
  modifyCurrentQuestion(changes: RecursivePartial<QuestionPair>): Observable<QuestionPair> {
    if (!this.quizee) throw new Error('Quizee is not loaded');

    _.merge(this.quizee.answers[this.currentIndex], changes.answer);
    _.merge(this.quizee.questions[this.currentIndex], changes.question);

    return this.getCurrentQuestion();
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

  @AutoDispatchEvent(['quizee', 'currentQuestion'])
  setAnswerConfig(changes: RecursivePartial<Answer['config']>): Observable<QuestionPair> {
    if (!this.quizee) throw new Error('Quizee is not loaded');

    _.merge(this._getCurrentQuestion().answer.config, changes);

    return this.getCurrentQuestion();
  }

  @AutoDispatchEvent(['quizee', 'currentQuestion'])
  setQuestionType(qt: QuestionType): Observable<QuestionPair> {
    if (!this.quizee) throw new Error('Quizee is not loaded');

    const qp = this._getCurrentQuestion();

    doSwitch(qp.question.type, qt, [
      switchCase('*', 'WRITE_ANSWER', () => {
        this.setAnswer(['']);
        this.setAnswerOptions([]);
      }),
      switchCase('WRITE_ANSWER', '*', () => {
        const answerOption = this._createAnswerOption();
        this.setAnswer([answerOption.id]);
        this.setAnswerOptions([answerOption]);
      }),
    ]);

    this.modifyCurrentQuestion({ question: { type: qt } });

    return this.getCurrentQuestion();
  }

  @AutoDispatchEvent(['quizee', 'currentQuestion'])
  setAnswer(answer: Answer['answer']): Observable<QuestionPair> {
    if (!this.quizee) throw new Error('Quizee is not loaded');

    this.quizee.answers[this.currentIndex].answer = answer;

    return this.getCurrentQuestion();
  }

  @AutoDispatchEvent(['quizee', 'currentQuestion'])
  setAnswerOptions(answerOptions: AnswerOption[]): Observable<QuestionPair> {
    if (!this.quizee) throw new Error('Quizee is not loaded');

    this.quizee.questions[this.currentIndex].answerOptions = _.cloneDeep(answerOptions);

    return this.getCurrentQuestion();
  }

  @AutoDispatchEvent(['quizee', 'currentQuestion'])
  addAnswerOption(): Observable<QuestionPair> {
    if (!this.quizee) throw new Error('Quizee is not loaded');

    const pair = this._getCurrentQuestion();

    this.setAnswerOptions([...pair.question.answerOptions, this._createAnswerOption()]);

    return this.getCurrentQuestion();
  }

  @AutoDispatchEvent(['quizee', 'currentQuestion'])
  removeAnswerOption(id: AnswerOptionId): Observable<QuestionPair> {
    if (!this.quizee) throw new Error('Quizee is not loaded');

    const pair = this._getCurrentQuestion();

    this.setAnswerOptions(pair.question.answerOptions.filter((v) => v.id !== id));
    this.setAnswer(pair.answer.answer.filter((answerId) => answerId !== id));

    return this.getCurrentQuestion();
  }

  @RegisterDispatcher('quizee')
  private _pushQuizee(): void {
    if (!this.quizee) return;

    this.quizee$.next(_.cloneDeep(this.quizee));
  }

  @RegisterDispatcher('currentQuestion')
  private _pushCurrentQuestion(): void {
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
