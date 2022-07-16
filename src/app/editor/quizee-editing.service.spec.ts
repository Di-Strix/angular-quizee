import { AnswerOption, AnswerOptionId, Quiz } from '@di-strix/quizee-types';
import { verifyAnswer, verifyQuestion, verifyQuizee } from '@di-strix/quizee-verification-functions';

import * as _ from 'lodash';
import { Observable, first } from 'rxjs';

import { RecursivePartial } from '../shared/helpers/RecursivePartial';

import { QuestionPair, QuizeeEditingService } from './quizee-editing.service';

jest.mock('@di-strix/quizee-verification-functions');

describe('QuizeeEditingService', () => {
  let service: QuizeeEditingService;
  let next: jest.Mock;
  let error: jest.Mock;

  beforeEach(() => {
    jest.resetAllMocks();

    service = new QuizeeEditingService();

    error = jest.fn();
    next = jest.fn();

    jest.useFakeTimers();
  });

  describe('getQuizeeErrors', () => {
    it('should call verifier only once per emit', async () => {
      (verifyQuizee as jest.Mock).mockReturnValue([{}]);

      service.create();
      service.getQuizeeErrors().subscribe({ next, error });

      await jest.runAllTimers();

      expect(verifyQuizee).toHaveBeenCalledTimes(1);
      expect(next).toBeCalledTimes(1);
      expect(error).not.toHaveBeenCalled();
    });

    it('should emit exact value to subscriber', async () => {
      const result = { a: 1, b: 2 };
      (verifyQuizee as jest.Mock).mockReturnValue([result]);

      service.create();
      service.getQuizeeErrors().subscribe({ next, error });

      await jest.runAllTimers();

      expect(next).toBeCalledTimes(1);
      expect(next).toBeCalledWith(result);
      expect(error).not.toHaveBeenCalled();
    });
  });

  describe('getCurrentQuestionErrors', () => {
    it('should call verifiers only once per emit', async () => {
      (verifyQuestion as jest.Mock).mockReturnValue([{}]);
      (verifyAnswer as jest.Mock).mockReturnValue([{}]);

      service.getCurrentQuestionErrors().subscribe({ next, error });
      service.currentQuestion$.next({} as any);

      await jest.runAllTimers();

      expect(verifyQuestion).toHaveBeenCalledTimes(1);
      expect(verifyAnswer).toHaveBeenCalledTimes(1);
      expect(next).toBeCalledTimes(1);
      expect(error).not.toHaveBeenCalled();
    });

    it('should combine values from verifiers', async () => {
      const vq = { a: 1, b: 2 };
      const va = { a: 2, b: 3 };
      const res = { answer: va, question: vq };

      (verifyQuestion as jest.Mock).mockReturnValue([vq]);
      (verifyAnswer as jest.Mock).mockReturnValue([va]);

      service.getCurrentQuestionErrors().subscribe({ next, error });
      service.currentQuestion$.next({} as any);

      await jest.runAllTimers();

      expect(next).toBeCalledTimes(1);
      expect(next).toBeCalledWith(res);
      expect(error).not.toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('should create new quiz and return observable that emits new quizee', async () => {
      service.create().subscribe({ next, error });

      await jest.runAllTimers();

      expect(next).toHaveBeenCalled();
      expect(next.mock.calls[0][0]).toBeTruthy();
      expect(error).not.toHaveBeenCalled();
    });

    it('should create quizee with initial answer and question', async () => {
      service.create().subscribe({ next, error });

      await jest.runAllTimers();

      expect(next).toHaveBeenCalled();
      expect(next.mock.calls[0][0].answers.length).toEqual(1);
      expect(next.mock.calls[0][0].questions.length).toEqual(1);
      expect(next.mock.calls[0][0].info.questionsCount).toEqual(1);
      expect(error).not.toHaveBeenCalled();
    });

    it('should create valid quiz', async () => {
      const { verifyQuizee } = jest.requireActual('@di-strix/quizee-verification-functions');

      service.create().subscribe({ next, error });

      await jest.runAllTimers();

      expect(await verifyQuizee(next.mock.calls[0][0])).toEqual([]);
    });
  });

  describe('load', () => {
    it('should load provided quiz and return observable that emits loaded quizee', async () => {
      const quizee: RecursivePartial<Quiz> = {
        [Symbol()]: 'data',
        questions: [{}],
        answers: [{}],
      };

      service.load(quizee as any as Quiz).subscribe({ next, error });

      await jest.runAllTimers();

      expect(next).toHaveBeenCalledWith(quizee);
      expect(error).not.toHaveBeenCalled();
    });

    it('should make sure that length of questions and answers is equal', async () => {
      let quizee: RecursivePartial<Quiz> = {
        [Symbol()]: 'data',
        questions: [{}, {}],
        answers: [{}],
      };

      service.load(quizee as any as Quiz).subscribe({ next, error });

      await jest.runAllTimers();

      expect(next).not.toHaveBeenCalled();
      expect(error).toHaveBeenCalled();

      next.mockReset();
      error.mockReset();

      quizee.questions?.pop();

      service
        .load(quizee as any as Quiz)
        .pipe(first())
        .subscribe({ next, error });

      await jest.runAllTimers();

      expect(next).toHaveBeenCalledWith(quizee);
      expect(error).not.toHaveBeenCalled();
    });

    it('should check whether quizee contains at least one question', async () => {
      const quizee: RecursivePartial<Quiz> = {
        [Symbol()]: 'data',
        questions: [],
        answers: [],
      };

      service.load(quizee as any as Quiz).subscribe({ next, error });

      await jest.runAllTimers();

      expect(next).not.toHaveBeenCalled();
      expect(error).toHaveBeenCalled();
    });
  });

  describe('modify', () => {
    it("should throw if quizee isn't created", async () => {
      service.modify({}).subscribe({ next, error });

      await jest.runAllTimers();

      expect(next).not.toHaveBeenCalled();
      expect(error).toHaveBeenCalled();
    });

    it('should concat current quizee with the provided changes', async () => {
      const change1 = {
        change1: 'change1',
      };

      const change2 = {
        change2: 'change2',
      };

      service.create().subscribe({ next, error });
      service.modify(change1 as any as Quiz);
      service.modify(change2 as any as Quiz);

      await jest.runAllTimers();

      expect(error).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalledTimes(3);
      expect(next.mock.calls[1][0]).toEqual({ ...next.mock.calls[0][0], ...change1 });
      expect(next.mock.calls[2][0]).toEqual({ ...next.mock.calls[1][0], ...change2 });
    });

    it('should emit updates to subscribers', async () => {
      const quizee = {
        a: 'data',
        questions: [{}],
        answers: [{}],
      };
      const change1 = {
        b: 'change1',
      };
      const change2 = {
        c: 'change2',
      };

      service.load(quizee as any as Quiz).subscribe({ next, error });
      service.modify(change1 as any as Quiz);
      service.modify(change2 as any as Quiz);

      await jest.runAllTimers();

      expect(error).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalledTimes(3);
      expect(next.mock.calls[0][0]).toEqual(quizee);
      expect(next.mock.calls[1][0]).toEqual({ ...next.mock.calls[0][0], ...change1 });
      expect(next.mock.calls[2][0]).toEqual({ ...next.mock.calls[1][0], ...change2 });
    });

    it('should not change selected question', async () => {
      service.create();
      service.createQuestion();
      service.createQuestion().subscribe({ next, error });
      const index = service.getCurrentQuestionIndex();
      service.modify({ info: { caption: 'aaa' } });

      await jest.runAllTimers();

      expect(error).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalledTimes(1);
      expect(service.getCurrentQuestionIndex()).toEqual(index);
    });
  });

  describe('get', () => {
    it('should return observable that emits current quizee', async () => {
      const quizee = {
        [Symbol()]: 'data',
        questions: [{}],
        answers: [{}],
      };

      service.load(quizee as any as Quiz);
      service.get().subscribe({ next, error });

      await jest.runAllTimers();

      expect(error).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalled();
      expect(next.mock.calls[0][0]).toEqual(quizee);
    });
  });

  describe('createQuestion', () => {
    it('should throw if quizee is not loaded', async () => {
      service.createQuestion().subscribe({ next, error });

      await jest.runAllTimers();

      expect(next).not.toHaveBeenCalled();
      expect(error).toHaveBeenCalled();
    });

    it('should push updated quizee', async () => {
      service.create().subscribe({ next, error });
      service.createQuestion();

      await jest.runAllTimers();

      expect(error).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalledTimes(2);
      expect(next.mock.calls[0]).not.toEqual(next.mock.calls[1]);
    });

    it('should select created question', async () => {
      service.create();
      service.createQuestion().subscribe({ next, error });
      service.createQuestion();

      await jest.runAllTimers();

      expect(error).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalledTimes(2);
      expect(next.mock.calls[0]).not.toEqual(next.mock.calls[1]);
    });

    it('should create question with initial answer and answerOption', async () => {
      service.create();
      service.createQuestion().subscribe({ next, error });

      await jest.runAllTimers();

      expect(next.mock.calls[0][0].answer.answer.length).toBe(1);
      expect(next.mock.calls[0][0].question.answerOptions.length).toBe(1);
      expect(next.mock.calls[0][0].answer.answer[0]).toBe(next.mock.calls[0][0].question.answerOptions[0].id);
    });

    it('should increment question count', async () => {
      service.create().subscribe({ next, error });
      service.createQuestion();

      await jest.runAllTimers();

      expect(next.mock.calls[1][0].info.questionsCount).toBe(2);
    });

    it('should create valid question', async () => {
      const { verifyQuestion, verifyAnswer } = jest.requireActual('@di-strix/quizee-verification-functions');

      service.create();
      service.createQuestion().subscribe({ next, error });

      await jest.runAllTimers();

      expect(await verifyQuestion(next.mock.calls[0][0].question)).toEqual([]);
      expect(await verifyAnswer(next.mock.calls[0][0].answer)).toEqual([]);
    });
  });

  describe('selectQuestion', () => {
    it('should throw if quizee is not loaded', async () => {
      service.selectQuestion(0).subscribe({ next, error });

      await jest.runAllTimers();

      expect(next).not.toHaveBeenCalled();
      expect(error).toHaveBeenCalled();
    });

    it('should throw if out of range', async () => {
      service.create();
      service.selectQuestion(1).subscribe({ next, error });

      await jest.runAllTimers();

      expect(next).not.toHaveBeenCalled();
      expect(error).toHaveBeenCalled();
    });

    it('should throw if invalid index', async () => {
      service.create();
      service.selectQuestion(-1).subscribe({ next, error });

      await jest.runAllTimers();

      expect(next).not.toHaveBeenCalled();
      expect(error).toHaveBeenCalled();
    });

    it('should push current question', async () => {
      service.create();
      service.createQuestion();
      service.createQuestion();
      service.selectQuestion(0).subscribe({ next, error });
      service.selectQuestion(1);

      await jest.runAllTimers();

      expect(error).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalledTimes(2);
      expect(next.mock.calls[1][0]).not.toEqual(next.mock.calls[0][0]);
    });
  });

  describe('modifyCurrentQuestion', () => {
    it('should throw if quizee is not loaded', async () => {
      service.modifyCurrentQuestion({}).subscribe({ next, error });

      await jest.runAllTimers();

      expect(next).not.toHaveBeenCalled();
      expect(error).toHaveBeenCalled();
    });

    it('should concat current question with the provided changes', async () => {
      const change1 = {
        question: {
          change1: 'change1',
        },
      };

      const change2 = {
        answer: {
          change2: 'change2',
        },
      };

      service.create();
      service.createQuestion().subscribe({ next, error });
      service.modifyCurrentQuestion(change1 as any as QuestionPair);
      service.modifyCurrentQuestion(change2 as any as QuestionPair);

      await jest.runAllTimers();

      expect(error).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalledTimes(3);
      expect(next.mock.calls[1][0]).toEqual(_.merge({}, next.mock.calls[0][0], change1));
      expect(next.mock.calls[2][0]).toEqual(_.merge({}, next.mock.calls[1][0], change2));
    });

    it('should push new quizee', async () => {
      const change1 = {
        question: {
          change1: 'change1',
        },
      };

      const change2 = {
        answer: {
          change2: 'change2',
        },
      };

      service.create().subscribe({ next, error });
      service.createQuestion();
      service.modifyCurrentQuestion(change1 as any as QuestionPair);
      service.modifyCurrentQuestion(change2 as any as QuestionPair);

      await jest.runAllTimers();

      expect(error).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalledTimes(4);
      expect(next.mock.calls[1][0]).not.toEqual(next.mock.calls[0][0]);
      expect(next.mock.calls[2][0]).not.toEqual(next.mock.calls[1][0]);
    });
  });

  describe('setAnswer', () => {
    it('should throw if quizee is not loaded', async () => {
      service.setAnswer([]).subscribe({ next, error });

      await jest.runAllTimers();

      expect(next).not.toHaveBeenCalled();
      expect(error).toHaveBeenCalled();
    });

    it('should set answer for current question', async () => {
      const answer: AnswerOptionId[] = ['1', '2', '3'];

      service.create();
      service.createQuestion();
      service.setAnswer(answer).subscribe({ next, error });

      await jest.runAllTimers();

      expect(error).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalledTimes(1);
      expect(next.mock.calls[0][0].answer.answer).toEqual(answer);
    });

    it('should push new quizee', async () => {
      service.create().subscribe({ next, error });
      service.createQuestion();
      service.setAnswer(['1']);

      await jest.runAllTimers();

      expect(error).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalledTimes(3);
      expect(next.mock.calls[0][0]).not.toEqual(next.mock.calls[2][0]);
    });
  });

  describe('setAnswerOptions', () => {
    it('should throw if quizee is not loaded', async () => {
      service.setAnswerOptions([]).subscribe({ next, error });

      await jest.runAllTimers();

      expect(next).not.toHaveBeenCalled();
      expect(error).toHaveBeenCalled();
    });

    it('should set answer options for current question', async () => {
      const answerOptions: AnswerOption[] = [{ id: '1', value: '' }];

      service.create();
      service.createQuestion();
      service.setAnswerOptions(answerOptions).subscribe({ next, error });

      await jest.runAllTimers();

      expect(error).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalledTimes(1);
      expect(next.mock.calls[0][0].question.answerOptions).toEqual(answerOptions);
    });

    it('should push new quizee', async () => {
      service.create().subscribe({ next, error });
      service.createQuestion();
      service.setAnswerOptions([{ id: '1', value: '' }]);

      await jest.runAllTimers();

      expect(error).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalledTimes(3);
      expect(next.mock.calls[1][0]).not.toEqual(next.mock.calls[2][0]);
    });
  });

  describe('_pushQuizee', () => {
    it('should not push if quizee is falsy', async () => {
      const testingService = service as any as { quizee: Quiz; get: () => Observable<Quiz>; _pushQuizee: () => void };

      testingService.get().subscribe({ next, error });
      testingService._pushQuizee();

      await jest.runAllTimers();

      expect(testingService.quizee).toBeFalsy();
      expect(next).not.toHaveBeenCalled();
      expect(error).not.toHaveBeenCalled();
    });

    it('should push quizee if it exists', async () => {
      const testingService = service as any as {
        quizee: Quiz;
        get: () => Observable<Quiz>;
        _pushQuizee: () => void;
        create: () => Observable<Quiz>;
      };

      testingService.create().subscribe({ next, error });
      testingService._pushQuizee();

      await jest.runAllTimers();

      expect(testingService.quizee).toBeTruthy();
      expect(next).toBeCalledTimes(2);
      expect(error).not.toHaveBeenCalled();
    });

    it('should make deep copy', async () => {
      const testingService = service as any as {
        quizee: Quiz;
        create: () => Observable<Quiz>;
        get: () => Observable<Quiz>;
        _pushQuizee: () => void;
      };

      testingService.create().subscribe({ next, error });
      testingService._pushQuizee();
      testingService.quizee.info.caption = '123123';

      await jest.runAllTimers();

      expect(next).toHaveBeenCalledTimes(2);
      expect(error).not.toHaveBeenCalled();
      expect(next.mock.calls[1][0].info.caption).not.toEqual('123123');
      expect(next.mock.calls[1][0].info.caption).toEqual(next.mock.calls[0][0].info.caption);
    });
  });

  describe('_pushCurrentQuestion', () => {
    it('should not push if quizee is not created', async () => {
      const testingService = service as any as {
        get: () => Observable<Quiz>;
        _pushCurrentQuestion: () => void;
      };

      testingService.get().subscribe({ next, error });
      testingService._pushCurrentQuestion();

      await jest.runAllTimers();

      expect(next).not.toHaveBeenCalled();
      expect(error).not.toHaveBeenCalled();
    });

    it('should not push if question is not selected', async () => {
      const testingService = service as any as {
        create: () => Observable<Quiz>;
        getCurrentQuestion: () => Observable<QuestionPair>;
        _pushCurrentQuestion: () => void;
      };

      testingService.getCurrentQuestion().subscribe({ next, error });
      testingService._pushCurrentQuestion();

      await jest.runAllTimers();

      expect(next).not.toHaveBeenCalled();
      expect(error).not.toHaveBeenCalled();
    });

    it('should push', async () => {
      const testingService = service as any as {
        quizee: Quiz;
        create: () => Observable<Quiz>;
        createQuestion: () => Observable<QuestionPair>;
        getCurrentQuestion: () => Observable<QuestionPair>;
        _pushCurrentQuestion: () => void;
      };

      testingService.create();
      testingService.createQuestion().subscribe({ next, error });
      testingService._pushCurrentQuestion();

      await jest.runAllTimers();

      expect(next).toHaveBeenCalledTimes(2);
      expect(error).not.toHaveBeenCalled();
    });

    it('should make deep copy', async () => {
      const testingService = service as any as {
        quizee: Quiz;
        create: () => Observable<Quiz>;
        createQuestion: () => Observable<QuestionPair>;
        getCurrentQuestion: () => Observable<QuestionPair>;
        _pushCurrentQuestion: () => void;
      };

      testingService.create();
      testingService.createQuestion().subscribe({ next, error });
      testingService._pushCurrentQuestion();
      testingService.quizee.answers[0].answerTo = '123123';

      await jest.runAllTimers();

      expect(next).toHaveBeenCalledTimes(2);
      expect(error).not.toHaveBeenCalled();
      expect(next.mock.calls[1][0].answer.answerTo).not.toEqual('123123');
      expect(next.mock.calls[1][0].answer.answerTo).toEqual(next.mock.calls[0][0].answer.answerTo);
    });
  });

  describe('addAnswerOption', () => {
    it('should throw if quizee is not created', async () => {
      service.addAnswerOption().subscribe({ next, error });

      await jest.runAllTimers();

      expect(next).not.toHaveBeenCalled();
      expect(error).toHaveBeenCalled();
    });

    it('should create new answer option for selected question', async () => {
      service.create();
      service.createQuestion().subscribe({ next, error });
      service.addAnswerOption();

      await jest.runAllTimers();

      expect(next).toHaveBeenCalledTimes(2);
      expect(next.mock.calls[0][0].question.answerOptions.length).toBe(1);
      expect(next.mock.calls[1][0].question.answerOptions.length).toBe(2);
    });

    it('should create unique id for each answer option', async () => {
      service.create();
      service.createQuestion().subscribe({ next, error });
      service.addAnswerOption();

      await jest.runAllTimers();

      expect(next).toHaveBeenCalledTimes(2);
      expect(next.mock.calls[1][0].question.answerOptions[0].id).not.toBe(
        next.mock.calls[1][0].question.answerOptions[1].id
      );
    });

    it('should create valid answer option', async () => {
      const { verifyAnswerOption } = jest.requireActual('@di-strix/quizee-verification-functions');

      service.create();
      service.createQuestion().subscribe({ next, error });
      service.addAnswerOption();

      await jest.runAllTimers();

      expect(await verifyAnswerOption(next.mock.calls[1][0].question.answerOptions[1])).toEqual([]);
    });
  });

  describe('removeAnswerOption', () => {
    it('should throw if quizee is not created', async () => {
      service.removeAnswerOption('').subscribe({ next, error });

      await jest.runAllTimers();

      expect(next).not.toHaveBeenCalled();
      expect(error).toHaveBeenCalled();
    });

    it('should remove answer option with provided id for selected question', async () => {
      service.create();
      service.createQuestion().subscribe({ next, error });
      service.addAnswerOption();

      await jest.runAllTimers();

      service.removeAnswerOption(next.mock.calls[1][0].question.answerOptions[0].id);

      await jest.runAllTimers();

      expect(next.mock.calls[1][0].question.answerOptions.length).toBe(2);
      expect(next.mock.calls[2][0].question.answerOptions[0].id).not.toBe(
        next.mock.calls[1][0].question.answerOptions[0].id
      );
    });

    it('should remove answer with provided id for selected question', async () => {
      service.create();
      service.createQuestion().subscribe({ next, error });
      service.addAnswerOption();

      await jest.runAllTimers();

      expect(next).toHaveBeenCalledTimes(2);
      service.setAnswer([next.mock.calls[1][0].question.answerOptions[0].id]);
      service.removeAnswerOption(next.mock.calls[1][0].question.answerOptions[0].id);

      await jest.runAllTimers();

      expect(error).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalledTimes(4);
      expect(next.mock.calls[3][0].answer.answer).toEqual([]);
    });
  });

  describe('_getCurrentQuestion', () => {
    it('should throw if quizee is not loaded', async () => {
      await expect((async () => (service as any)._getCurrentQuestion())()).rejects.toThrowError();
    });

    it('should return current question', async () => {
      service.create();

      const qp: QuestionPair = (service as any)._getCurrentQuestion();
      const quizee: Quiz = (service as any).quizee;

      expect(qp.question).toEqual(quizee.questions[service.getCurrentQuestionIndex()]);
      expect(qp.answer).toEqual(quizee.answers[service.getCurrentQuestionIndex()]);
    });
  });

  describe('setAnswerConfig', () => {
    it('should throw if quizee is not loaded', async () => {
      service.setAnswerConfig({}).subscribe({ next, error });

      await jest.runAllTimers();

      expect(next).not.toHaveBeenCalled();
      expect(error).toHaveBeenCalled();
    });

    it('should push quizee', async () => {
      service.create().subscribe({ next, error });
      service.setAnswerConfig({});

      await jest.runAllTimers();

      expect(next).toHaveBeenCalledTimes(2);
      expect(error).not.toHaveBeenCalled();
    });

    it('should push current question', async () => {
      service.create();
      service.getCurrentQuestion().subscribe({ next, error });
      service.setAnswerConfig({});

      await jest.runAllTimers();

      expect(next).toHaveBeenCalledTimes(2);
      expect(error).not.toHaveBeenCalled();
    });

    it('should apply changes', async () => {
      service.create();
      service.getCurrentQuestion().subscribe({ next, error });
      service.setAnswerConfig({ equalCase: true });

      await jest.runAllTimers();

      expect(next).toHaveBeenCalledTimes(2);
      expect(next.mock.calls[1][0].answer.config).toEqual({ ...next.mock.calls[0][0].answer.config, equalCase: true });
      expect(error).not.toHaveBeenCalled();
    });

    it('should make deep copy', async () => {
      const object = { someArray: [{ a: 1 }] } as any;
      service.create();
      service.getCurrentQuestion().subscribe({ next, error });
      service.setAnswerConfig(object);
      object.someArray[0].a = 2;

      await jest.runAllTimers();

      expect(next).toHaveBeenCalledTimes(2);
      expect(next.mock.calls[1][0].answer.config.someArray).toEqual([{ a: 1 }]);
      expect(error).not.toHaveBeenCalled();
    });
  });

  describe('setQuestionType', () => {
    it('should throw if quizee is not loaded', async () => {
      service.setQuestionType('ONE_TRUE').subscribe({ next, error });

      await jest.runAllTimers();

      expect(next).not.toHaveBeenCalled();
      expect(error).toHaveBeenCalled();
    });

    it('should push quizee', async () => {
      service.create().subscribe({ next, error });
      service.setQuestionType('SEVERAL_TRUE');

      await jest.runAllTimers();

      expect(next).toHaveBeenCalledTimes(2);
      expect(error).not.toHaveBeenCalled();
    });

    it('should push current question', async () => {
      service.create();
      service.getCurrentQuestion().subscribe({ next, error });
      service.setQuestionType('SEVERAL_TRUE');

      await jest.runAllTimers();

      expect(next).toHaveBeenCalledTimes(2);
      expect(error).not.toHaveBeenCalled();
    });

    it('should change question type', async () => {
      service.create();
      service.getCurrentQuestion().subscribe({ next, error });
      service.setQuestionType('SEVERAL_TRUE');

      await jest.runAllTimers();

      expect(error).not.toHaveBeenCalled();
      expect(next.mock.calls[1][0].question.type).toBe('SEVERAL_TRUE');
      expect(next.mock.calls[1][0].question.type).not.toBe(next.mock.calls[0][0].question.type);
    });

    it('should clear answer options and set answer on switch to WRITE_ANSWER', async () => {
      service.create();
      service.setAnswerOptions([{ id: 'abc', value: 'abc' }]);
      service.setAnswer(['abc']);

      service.setQuestionType('WRITE_ANSWER').subscribe({ next, error });

      await jest.runAllTimers();

      expect(error).not.toHaveBeenCalled();
      expect(next.mock.calls[0][0].answer.answer.length).toBe(1);
      expect(next.mock.calls[0][0].answer.answer[0]).not.toBe('');
      expect(next.mock.calls[0][0].question.answerOptions.length).toBe(0);
    });

    it('should leave question valid after switching in both ways', async () => {
      const { verifyQuestion, verifyAnswer } = jest.requireActual('@di-strix/quizee-verification-functions');

      service.create();
      service.createQuestion();
      service.setQuestionType('WRITE_ANSWER').subscribe({ next, error });

      expect(await verifyQuestion(next.mock.calls[0][0].question)).toEqual([]);
      expect(await verifyAnswer(next.mock.calls[0][0].answer)).toEqual([]);

      service.setQuestionType('ONE_TRUE').subscribe({ next, error });

      await jest.runAllTimers();

      expect(await verifyQuestion(next.mock.calls[1][0].question)).toEqual([]);
      expect(await verifyAnswer(next.mock.calls[1][0].answer)).toEqual([]);

      service.setQuestionType('SEVERAL_TRUE').subscribe({ next, error });

      await jest.runAllTimers();

      expect(await verifyQuestion(next.mock.calls[2][0].question)).toEqual([]);
      expect(await verifyAnswer(next.mock.calls[2][0].answer)).toEqual([]);
    });

    it('should add answer and answer option when switching from WRITE_ANSWER', async () => {
      service.create();
      service.setQuestionType('WRITE_ANSWER');
      service.setQuestionType('ONE_TRUE').subscribe({ next, error });

      await jest.runAllTimers();

      expect(error).not.toHaveBeenCalled();
      expect(next.mock.calls[0][0].answer.answer.length).toBe(1);
      expect(next.mock.calls[0][0].question.answerOptions.length).toBe(1);
      expect(next.mock.calls[0][0].answer.answer[0]).toBe(next.mock.calls[0][0].question.answerOptions[0].id);
    });
  });

  describe('getCurrentQuestionIndex', () => {
    it('should return -1 if question is not created or loaded', () => {
      expect(service.getCurrentQuestionIndex()).toEqual(-1);
    });

    it('should return proper index', () => {
      service.create();

      expect(service.getCurrentQuestionIndex()).toEqual(0);

      service.createQuestion();

      expect(service.getCurrentQuestionIndex()).toEqual(1);

      service.selectQuestion(0);

      expect(service.getCurrentQuestionIndex()).toEqual(0);
    });
  });
});
