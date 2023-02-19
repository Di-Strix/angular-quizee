import { AnswerOption, AnswerOptionId, Quiz } from '@di-strix/quizee-types';
import { verifyAnswer, verifyQuestion, verifyQuizee } from '@di-strix/quizee-verification-functions';

import * as _ from 'lodash';
import { Subject, first, skip } from 'rxjs';

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

  describe('set quizee', () => {
    it('should set quizee and emit it', async () => {
      const next = jest.spyOn(service.quizee$, 'next');

      service.quizee = '123' as any;

      await jest.runAllTimers();

      expect(next).toBeCalledTimes(1);
      expect(next).toBeCalledWith('123');
      expect(service.quizee).toBe('123');
    });

    it('should not set quizee and emit it if it is falsy', async () => {
      const next = jest.spyOn(service.quizee$, 'next');

      service.quizee = '' as any;

      await jest.runAllTimers();

      expect(next).not.toBeCalled();
      expect(service.quizee).not.toBe('');
    });
  });

  describe('set currentQuestionIndex', () => {
    it('should set and emit index', async () => {
      const next = jest.spyOn(service.currentQuestionIndex$, 'next');

      service.currentQuestionIndex = 5 as any;

      await jest.runAllTimers();

      expect(next).toBeCalledTimes(1);
      expect(next).toBeCalledWith(5);
      expect(service.currentQuestionIndex).toBe(5);
    });

    it('should not emit index if it is the same', async () => {
      const next = jest.spyOn(service.currentQuestionIndex$, 'next');

      service.currentQuestionIndex = 2 as any;
      service.currentQuestionIndex = 2 as any;

      await jest.runAllTimers();

      expect(next).toBeCalledTimes(1);
    });

    it('should not set and emit index if it is negative', async () => {
      const next = jest.spyOn(service.currentQuestionIndex$, 'next');

      service.currentQuestionIndex = 2 as any;
      service.currentQuestionIndex = -1 as any;

      await jest.runAllTimers();

      expect(next).toBeCalledTimes(1);
      expect(next).toBeCalledWith(2);
      expect(service.currentQuestionIndex).toBe(2);
    });
  });

  describe('currentQuestionIndex', () => {
    it('should return -1 if question is not created or loaded', () => {
      expect(service.currentQuestionIndex).toEqual(-1);
    });

    it('should return proper index', () => {
      service.createQuizee();

      expect(service.currentQuestionIndex).toEqual(0);

      service.createQuestion();
      service.createQuestion();

      service.selectQuestion(1);

      expect(service.currentQuestionIndex).toEqual(1);

      service.selectQuestion(0);

      expect(service.currentQuestionIndex).toEqual(0);
    });
  });

  describe('getQuizeeErrors', () => {
    it('should not emit if quizee is not loaded', async () => {
      const complete = jest.fn();

      (verifyQuizee as jest.Mock).mockReturnValue([{}]);

      service.getQuizeeErrors().subscribe({ next, error, complete });

      await jest.runAllTimers();

      expect(next).not.toBeCalled();
      expect(error).not.toBeCalled();
      expect(complete).not.toBeCalled();
    });

    it('should call verifier only once per emit', async () => {
      (verifyQuizee as jest.Mock).mockReturnValue([{}]);

      service.createQuizee();
      service.getQuizeeErrors().subscribe({ next, error });

      await jest.runAllTimers();

      expect(verifyQuizee).toBeCalledTimes(1);
      expect(next).toBeCalledTimes(1);
      expect(error).not.toBeCalled();
    });

    it('should emit exact value to subscriber', async () => {
      const result = { a: 1, b: 2 };
      (verifyQuizee as jest.Mock).mockReturnValue([result]);

      service.createQuizee();
      service.getQuizeeErrors().subscribe({ next, error });

      await jest.runAllTimers();

      expect(next).toBeCalledTimes(1);
      expect(next).toBeCalledWith(result);
      expect(error).not.toBeCalled();
    });
  });

  describe('getCurrentQuestionErrors', () => {
    it('should not emit if quizee is not loaded', async () => {
      const complete = jest.fn();

      (verifyQuizee as jest.Mock).mockReturnValue([{}]);

      service.getCurrentQuestionErrors().subscribe({ next, error, complete });
      service.currentQuestionIndex$.next(0);

      await jest.runAllTimers();

      expect(next).not.toBeCalled();
      expect(error).not.toBeCalled();
      expect(complete).not.toBeCalled();
    });

    it('should call verifiers only once per emit', async () => {
      (verifyQuestion as jest.Mock).mockReturnValue([{}]);
      (verifyAnswer as jest.Mock).mockReturnValue([{}]);

      service.createQuizee();
      service.currentQuestionIndex$ = new Subject() as any;

      service.getCurrentQuestionErrors().subscribe({ next, error });
      service.currentQuestionIndex$.next(0);

      await jest.runAllTimers();

      expect(verifyQuestion).toBeCalledTimes(1);
      expect(verifyAnswer).toBeCalledTimes(1);
      expect(next).toBeCalledTimes(1);
      expect(error).not.toBeCalled();
    });

    it('should combine values from verifiers', async () => {
      const vq = { a: 1, b: 2 };
      const va = { a: 2, b: 3 };
      const res = { answer: va, question: vq };

      (verifyQuestion as jest.Mock).mockReturnValue([vq]);
      (verifyAnswer as jest.Mock).mockReturnValue([va]);

      service.createQuizee();
      service.getCurrentQuestionErrors().subscribe({ next, error });

      await jest.runAllTimers();

      expect(next).toBeCalledTimes(1);
      expect(next).toBeCalledWith(res);
      expect(error).not.toBeCalled();
    });
  });

  describe('getQuestionErrors', () => {
    it('should not emit if quizee is not loaded', async () => {
      const complete = jest.fn();

      (verifyQuizee as jest.Mock).mockReturnValue([{}]);

      service.getQuestionErrors(0).subscribe({ next, error, complete });

      await jest.runAllTimers();

      expect(next).not.toBeCalled();
      expect(error).not.toBeCalled();
      expect(complete).not.toBeCalled();
    });

    it('should throw if index is out of range', async () => {
      (verifyQuizee as jest.Mock).mockReturnValue([{}]);

      service.createQuizee();
      service.getQuestionErrors(1).pipe(skip(1)).subscribe({ next, error });

      await jest.runAllTimers();

      expect(next).not.toBeCalled();
      expect(error).toBeCalledTimes(1);
    });

    it('should call verifiers only once per emit', async () => {
      (verifyQuestion as jest.Mock).mockReturnValue([{}]);
      (verifyAnswer as jest.Mock).mockReturnValue([{}]);

      service.createQuizee();
      service.quizee$ = new Subject() as any;

      service.getQuestionErrors(0).subscribe({ next, error });
      service.quizee$.next(service.quizee as any);

      await jest.runAllTimers();

      expect(verifyQuestion).toBeCalledTimes(1);
      expect(verifyAnswer).toBeCalledTimes(1);
      expect(next).toBeCalledTimes(1);
      expect(error).not.toBeCalled();
    });

    it('should combine values from verifiers', async () => {
      const vq = { a: 1, b: 2 };
      const va = { a: 2, b: 3 };
      const res = { answer: va, question: vq };

      (verifyQuestion as jest.Mock).mockReturnValue([vq]);
      (verifyAnswer as jest.Mock).mockReturnValue([va]);

      service.createQuizee();
      service.getQuestionErrors(0).pipe(skip(1)).subscribe({ next, error });
      service.setCurrentQuestionAnswer(['1']);

      await jest.runAllTimers();

      expect(next).toBeCalledTimes(1);
      expect(next).toBeCalledWith(res);
      expect(error).not.toBeCalled();
    });
  });

  describe('loadQuizee', () => {
    it('should load provided quiz and return observable that emits loaded quizee', async () => {
      const quizee: RecursivePartial<Quiz> = {
        [Symbol()]: 'data',
        questions: [{}],
        answers: [{}],
      };

      service.loadQuizee(quizee as any as Quiz).subscribe({ next, error });

      await jest.runAllTimers();

      expect(next).toHaveBeenCalledWith(quizee);
      expect(error).not.toBeCalled();
    });

    it('should make sure that length of questions and answers is equal', async () => {
      let quizee: RecursivePartial<Quiz> = {
        [Symbol()]: 'data',
        questions: [{}, {}],
        answers: [{}],
      };

      service.loadQuizee(quizee as any as Quiz).subscribe({ next, error });

      await jest.runAllTimers();

      expect(next).not.toBeCalled();
      expect(error).toBeCalled();

      next.mockReset();
      error.mockReset();

      quizee.questions?.pop();

      service
        .loadQuizee(quizee as any as Quiz)
        .pipe(first())
        .subscribe({ next, error });

      await jest.runAllTimers();

      expect(next).toHaveBeenCalledWith(quizee);
      expect(error).not.toBeCalled();
    });

    it('should check whether quizee contains at least one question', async () => {
      const quizee: RecursivePartial<Quiz> = {
        [Symbol()]: 'data',
        questions: [],
        answers: [],
      };

      service.loadQuizee(quizee as any as Quiz).subscribe({ next, error });

      await jest.runAllTimers();

      expect(next).not.toBeCalled();
      expect(error).toBeCalled();
    });
  });

  describe('createQuizee', () => {
    it('should create new quiz and return observable that emits new quizee', async () => {
      service.createQuizee().subscribe({ next, error });

      await jest.runAllTimers();

      expect(next).toBeCalled();
      expect(next.mock.calls[0][0]).toBeTruthy();
      expect(error).not.toBeCalled();
    });

    it('should create quizee with initial answer and question', async () => {
      service.createQuizee().subscribe({ next, error });

      await jest.runAllTimers();

      expect(next).toBeCalled();
      expect(next.mock.calls[0][0].answers.length).toEqual(1);
      expect(next.mock.calls[0][0].questions.length).toEqual(1);
      expect(next.mock.calls[0][0].info.questionsCount).toEqual(1);
      expect(error).not.toBeCalled();
    });

    it('should create valid quiz', async () => {
      const { verifyQuizee } = jest.requireActual('@di-strix/quizee-verification-functions');

      service.createQuizee().subscribe({ next, error });

      await jest.runAllTimers();

      expect(await verifyQuizee(next.mock.calls[0][0])).toEqual([]);
    });
  });

  describe('modifyQuizee', () => {
    it("should throw if quizee isn't created", async () => {
      service.modifyQuizee({}).subscribe({ next, error });

      await jest.runAllTimers();

      expect(next).not.toBeCalled();
      expect(error).toBeCalled();
    });

    it('should concat current quizee with the provided changes', async () => {
      const change1 = {
        change1: 'change1',
      };

      const change2 = {
        change2: 'change2',
      };

      service.createQuizee().subscribe({ next, error });
      service.modifyQuizee(change1 as any as Quiz);
      service.modifyQuizee(change2 as any as Quiz);

      await jest.runAllTimers();

      expect(error).not.toBeCalled();
      expect(next).toBeCalledTimes(3);
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

      service.loadQuizee(quizee as any as Quiz).subscribe({ next, error });
      service.modifyQuizee(change1 as any as Quiz);
      service.modifyQuizee(change2 as any as Quiz);

      await jest.runAllTimers();

      expect(error).not.toBeCalled();
      expect(next).toBeCalledTimes(3);
      expect(next.mock.calls[0][0]).toEqual(quizee);
      expect(next.mock.calls[1][0]).toEqual({ ...next.mock.calls[0][0], ...change1 });
      expect(next.mock.calls[2][0]).toEqual({ ...next.mock.calls[1][0], ...change2 });
    });

    it('should not change selected question', async () => {
      service.createQuizee();
      service.createQuestion();
      service.createQuestion().subscribe({ next, error });
      const index = service.currentQuestionIndex;
      service.modifyQuizee({ info: { caption: 'aaa' } });

      await jest.runAllTimers();

      expect(error).not.toBeCalled();
      expect(next).toBeCalledTimes(1);
      expect(service.currentQuestionIndex).toEqual(index);
    });
  });

  describe('getQuizee', () => {
    it('should return observable that emits current quizee', async () => {
      const quizee = {
        [Symbol()]: 'data',
        questions: [{}],
        answers: [{}],
      };

      service.loadQuizee(quizee as any as Quiz);
      service.getQuizee().subscribe({ next, error });

      await jest.runAllTimers();

      expect(error).not.toBeCalled();
      expect(next).toBeCalled();
      expect(next.mock.calls[0][0]).toEqual(quizee);
    });

    it('should not emit if data is the same', async () => {
      const quizee = {
        [Symbol()]: 'data',
        questions: [{}],
        answers: [{}],
      };

      service.quizee$.next(quizee as any as Quiz);
      service.getQuizee().subscribe({ next, error });
      service.quizee$.next(quizee as any as Quiz);

      await jest.runAllTimers();

      expect(error).not.toBeCalled();
      expect(next).toBeCalled();
      expect(next.mock.calls[0][0]).toEqual(quizee);
    });
  });

  describe('createQuestion', () => {
    it('should throw if quizee is not loaded', async () => {
      service.createQuestion().subscribe({ next, error });

      await jest.runAllTimers();

      expect(next).not.toBeCalled();
      expect(error).toBeCalled();
    });

    it('should push updated quizee', async () => {
      service.createQuizee().subscribe({ next, error });
      service.createQuestion();

      await jest.runAllTimers();

      expect(error).not.toBeCalled();
      expect(next).toBeCalledTimes(2);
      expect(next.mock.calls[0]).not.toEqual(next.mock.calls[1]);
    });

    it('should observe created question', async () => {
      service.createQuizee();
      service.createQuestion().subscribe({ next, error });
      service.modifyQuestion(1, { question: { type: 'SEVERAL_TRUE' } });
      service.createQuestion();

      await jest.runAllTimers();

      expect(error).not.toBeCalled();
      expect(next).toBeCalledTimes(2);
      expect(next.mock.calls[0]).not.toEqual(next.mock.calls[1]);
    });

    it('should create question with initial answer and answerOption', async () => {
      service.createQuizee();
      service.createQuestion().subscribe({ next, error });

      await jest.runAllTimers();

      expect(next.mock.calls[0][0].answer.answer.length).toBe(1);
      expect(next.mock.calls[0][0].question.answerOptions.length).toBe(1);
      expect(next.mock.calls[0][0].answer.answer[0]).toBe(next.mock.calls[0][0].question.answerOptions[0].id);
    });

    it('should increment question count', async () => {
      service.createQuizee().subscribe({ next, error });
      service.createQuestion();

      await jest.runAllTimers();

      expect(next.mock.calls[1][0].info.questionsCount).toBe(2);
    });

    it('should create valid question', async () => {
      const { verifyQuestion, verifyAnswer } = jest.requireActual('@di-strix/quizee-verification-functions');

      service.createQuizee();
      service.createQuestion().subscribe({ next, error });

      await jest.runAllTimers();

      expect(await verifyQuestion(next.mock.calls[0][0].question)).toEqual([]);
      expect(await verifyAnswer(next.mock.calls[0][0].answer)).toEqual([]);
    });
  });

  describe('modifyCurrentQuestion', () => {
    it('should throw if quizee is not loaded', async () => {
      service.modifyCurrentQuestion({}).subscribe({ next, error });

      await jest.runAllTimers();

      expect(next).not.toBeCalled();
      expect(error).toBeCalled();
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

      service.createQuizee();
      service.createQuestion().subscribe({ next, error });
      service.modifyCurrentQuestion(change1 as any as QuestionPair);
      service.modifyCurrentQuestion(change2 as any as QuestionPair);

      await jest.runAllTimers();

      expect(error).not.toBeCalled();
      expect(next).toBeCalledTimes(3);
      expect(next.mock.calls[1][0]).toEqual(_.merge({}, next.mock.calls[0][0], change1));
      expect(next.mock.calls[2][0]).toEqual(_.merge({}, next.mock.calls[1][0], change2));
    });

    it('should push quizee', async () => {
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

      service.createQuizee().subscribe({ next, error });
      service.createQuestion();
      service.modifyCurrentQuestion(change1 as any as QuestionPair);
      service.modifyCurrentQuestion(change2 as any as QuestionPair);

      await jest.runAllTimers();

      expect(error).not.toBeCalled();
      expect(next).toBeCalledTimes(4);
      expect(next.mock.calls[1][0]).not.toEqual(next.mock.calls[0][0]);
      expect(next.mock.calls[2][0]).not.toEqual(next.mock.calls[1][0]);
    });

    it('should not push quizee if it is the same', async () => {
      const change1 = {
        question: {
          change1: 'change1',
        },
      };

      service.createQuizee().subscribe({ next, error });
      service.createQuestion();
      service.modifyCurrentQuestion(change1 as any as QuestionPair);
      service.modifyCurrentQuestion(change1 as any as QuestionPair);

      await jest.runAllTimers();

      expect(error).not.toBeCalled();
      expect(next).toBeCalledTimes(3);
    });

    it('should push modified question', async () => {
      let next1 = jest.fn();
      let error1 = jest.fn();
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

      service.createQuizee();
      service.createQuestion().subscribe({ next, error });
      service.createQuestion().subscribe({ next: next1, error: error1 });
      service.selectQuestion(1);
      service.modifyCurrentQuestion(change1 as any as QuestionPair);
      service.modifyCurrentQuestion(change2 as any as QuestionPair);

      await jest.runAllTimers();

      expect(error).not.toBeCalled();
      expect(next).toBeCalledTimes(3);
      expect(next.mock.calls[1][0]).not.toEqual(next.mock.calls[0][0]);
      expect(next.mock.calls[2][0]).not.toEqual(next.mock.calls[1][0]);

      expect(next1).toBeCalledTimes(1);
      expect(error1).not.toBeCalled();
    });

    it('should not push modified question if it is the same', async () => {
      const change1 = {
        question: {
          change1: 'change1',
        },
      };

      service.createQuizee();
      service.createQuestion().subscribe({ next, error });
      service.modifyCurrentQuestion(change1 as any as QuestionPair);
      service.modifyCurrentQuestion(change1 as any as QuestionPair);

      await jest.runAllTimers();

      expect(error).not.toBeCalled();
      expect(next).toBeCalledTimes(2);
    });
  });

  describe('modifyQuestion', () => {
    it('should throw if quizee is not loaded', async () => {
      service.modifyQuestion(0, {}).subscribe({ next, error });

      await jest.runAllTimers();

      expect(next).not.toBeCalled();
      expect(error).toBeCalled();
    });

    it('should throw if index is invalid', async () => {
      service.createQuizee();
      service.modifyQuestion(-1, {}).subscribe({ next, error });
      service.modifyQuestion(1, {}).subscribe({ next, error });

      await jest.runAllTimers();

      expect(next).not.toBeCalled();
      expect(error).toBeCalled();
    });

    it('should concat specified question with the provided changes', async () => {
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

      service.createQuizee();
      const sub = service.createQuestion().subscribe({ next, error });
      service.modifyQuestion(1, change1 as any as QuestionPair);
      service.modifyQuestion(1, change2 as any as QuestionPair);

      await jest.runAllTimers();

      expect(error).not.toBeCalled();
      expect(next).toBeCalledTimes(3);
      expect(next.mock.calls[1][0]).toEqual(_.merge({}, next.mock.calls[0][0], change1));
      expect(next.mock.calls[2][0]).toEqual(_.merge({}, next.mock.calls[1][0], change2));

      sub.unsubscribe();
      next.mockReset();
      error.mockReset();

      service.getQuestion(0).subscribe({ next, error });
      service.modifyQuestion(0, change1 as any as QuestionPair);
      service.modifyQuestion(0, change2 as any as QuestionPair);

      await jest.runAllTimers();

      expect(error).not.toBeCalled();
      expect(next).toBeCalledTimes(3);
      expect(next.mock.calls[1][0]).toEqual(_.merge({}, next.mock.calls[0][0], change1));
      expect(next.mock.calls[2][0]).toEqual(_.merge({}, next.mock.calls[1][0], change2));
    });

    it('should push quizee', async () => {
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

      service.createQuizee().subscribe({ next, error });
      service.createQuestion();
      service.modifyQuestion(0, change1 as any as QuestionPair);
      service.modifyQuestion(0, change2 as any as QuestionPair);

      await jest.runAllTimers();

      expect(error).not.toBeCalled();
      expect(next).toBeCalledTimes(4);
      expect(next.mock.calls[2][0]).not.toEqual(next.mock.calls[1][0]);
      expect(next.mock.calls[3][0]).not.toEqual(next.mock.calls[2][0]);
    });

    it('should not push quizee if it is the same', async () => {
      const change1 = {
        question: {
          change1: 'change1',
        },
      };

      service.createQuizee().subscribe({ next, error });
      service.createQuestion();
      service.modifyQuestion(0, change1 as any as QuestionPair);
      service.modifyQuestion(0, change1 as any as QuestionPair);

      await jest.runAllTimers();

      expect(error).not.toBeCalled();
      expect(next).toBeCalledTimes(3);
    });

    it('should push modified question', async () => {
      let next1 = jest.fn();
      let error1 = jest.fn();
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

      service.createQuizee();
      service.createQuestion().subscribe({ next, error });
      service.createQuestion().subscribe({ next: next1, error: error1 });
      service.modifyQuestion(1, change1 as any as QuestionPair);
      service.modifyQuestion(1, change2 as any as QuestionPair);

      await jest.runAllTimers();

      expect(error).not.toBeCalled();
      expect(next).toBeCalledTimes(3);
      expect(next.mock.calls[1][0]).not.toEqual(next.mock.calls[0][0]);
      expect(next.mock.calls[2][0]).not.toEqual(next.mock.calls[1][0]);

      expect(next1).toBeCalledTimes(1);
      expect(error1).not.toBeCalled();
    });

    it('should not push modified question if it is the same', async () => {
      const change1 = {
        question: {
          change1: 'change1',
        },
      };

      service.createQuizee();
      service.createQuestion().subscribe({ next, error });
      service.modifyQuestion(1, change1 as any as QuestionPair);
      service.modifyQuestion(1, change1 as any as QuestionPair);

      await jest.runAllTimers();

      expect(error).not.toBeCalled();
      expect(next).toBeCalledTimes(2);
    });
  });

  describe('selectQuestion', () => {
    it('should throw if quizee is not loaded', async () => {
      service.selectQuestion(0).subscribe({ next, error });

      await jest.runAllTimers();

      expect(next).not.toBeCalled();
      expect(error).toBeCalled();
    });

    it('should throw if index is out of range', async () => {
      service.createQuizee();
      service.selectQuestion(1).subscribe({ next, error });

      await jest.runAllTimers();

      expect(next).not.toBeCalled();
      expect(error).toBeCalled();
    });

    it('should throw if index is invalid', async () => {
      service.createQuizee();
      service.selectQuestion(-1).subscribe({ next, error });

      await jest.runAllTimers();

      expect(next).not.toBeCalled();
      expect(error).toBeCalled();
    });

    it('should push current question', async () => {
      service.createQuizee();
      service.createQuestion();
      service.createQuestion();
      service.selectQuestion(0).subscribe({ next, error });
      service.selectQuestion(1);

      await jest.runAllTimers();

      expect(error).not.toBeCalled();
      expect(next).toBeCalledTimes(2);
      expect(next.mock.calls[1][0]).not.toEqual(next.mock.calls[0][0]);
    });
  });

  describe('getCurrentQuestion', () => {
    it('should not emit if quizee is not loaded', async () => {
      let complete = jest.fn();
      service.getCurrentQuestion().subscribe({ next, error, complete });

      await jest.runAllTimers();

      expect(next).not.toBeCalled();
      expect(error).not.toBeCalled();
      expect(complete).not.toBeCalled();
    });

    it('should emit on quizee create', async () => {
      let complete = jest.fn();
      service.createQuizee();
      service.getCurrentQuestion().subscribe({ next, error, complete });

      await jest.runAllTimers();

      expect(next).toBeCalledTimes(1);
      expect(error).not.toBeCalled();
      expect(complete).not.toBeCalled();
    });

    it('should emit on question create', async () => {
      let complete = jest.fn();
      service.createQuizee();
      service.getCurrentQuestion().subscribe({ next, error, complete });
      service.createQuestion();

      await jest.runAllTimers();

      expect(next).toBeCalledTimes(2);
      expect(error).not.toBeCalled();
      expect(complete).not.toBeCalled();
    });

    it('should emit on question index change', async () => {
      let complete = jest.fn();
      service.createQuizee();
      service.getCurrentQuestion().subscribe({ next, error, complete });
      service.createQuestion();
      service.selectQuestion(0);

      await jest.runAllTimers();

      expect(next).toBeCalledTimes(3);
      expect(next.mock.calls[0][0].question.id).toEqual(next.mock.calls[2][0].question.id);
      expect(error).not.toBeCalled();
      expect(complete).not.toBeCalled();
    });

    it('should not emit if data is the same', async () => {
      let complete = jest.fn();
      service.createQuizee();
      service.getCurrentQuestion().subscribe({ next, error, complete });
      service.setCurrentQuestionType('ONE_TRUE');

      await jest.runAllTimers();

      expect(next).toBeCalledTimes(1);
      expect(error).not.toBeCalled();
      expect(complete).not.toBeCalled();
    });
  });

  describe('getQuestion', () => {
    it('should not emit if quizee is not loaded', async () => {
      let complete = jest.fn();
      service.getQuestion(0).subscribe({ next, error, complete });

      await jest.runAllTimers();

      expect(next).not.toBeCalled();
      expect(error).not.toBeCalled();
      expect(complete).not.toBeCalled();
    });

    it('should throw if index is invalid', async () => {
      let complete = jest.fn();

      service.createQuizee();
      service.getQuestion(-1).subscribe({ next, error, complete });
      service.getQuestion(1).subscribe({ next, error, complete });
      service.createQuestion();
      service.getQuestion(1).subscribe({ next, error, complete });

      await jest.runAllTimers();

      expect(next).toBeCalledTimes(1);
      expect(error).toBeCalledTimes(2);
      expect(complete).not.toBeCalled();
    });

    it('should not emit on question create', async () => {
      let complete = jest.fn();
      service.createQuizee();
      service.getQuestion(0).subscribe({ next, error, complete });
      service.createQuestion();

      await jest.runAllTimers();

      expect(next).toBeCalledTimes(1);
      expect(error).not.toBeCalled();
      expect(complete).not.toBeCalled();
    });

    it('should not emit on question index change', async () => {
      let complete = jest.fn();
      service.createQuizee();
      service.getQuestion(0).subscribe({ next, error, complete });
      service.createQuestion();
      service.selectQuestion(0);

      await jest.runAllTimers();

      expect(next).toBeCalledTimes(1);
      expect(error).not.toBeCalled();
      expect(complete).not.toBeCalled();
    });

    it('should not emit if data is the same', async () => {
      let complete = jest.fn();
      service.createQuizee();
      service.getQuestion(0).subscribe({ next, error, complete });
      service.setQuestionType(0, 'ONE_TRUE');

      await jest.runAllTimers();

      expect(next).toBeCalledTimes(1);
      expect(error).not.toBeCalled();
      expect(complete).not.toBeCalled();
    });
  });

  describe('setCurrentQuestionAnswerConfig', () => {
    it('should throw if quizee is not loaded', async () => {
      service.setCurrentQuestionAnswerConfig({}).subscribe({ next, error });

      await jest.runAllTimers();

      expect(next).not.toBeCalled();
      expect(error).toBeCalled();
    });

    it('should push quizee', async () => {
      service.createQuizee().subscribe({ next, error });
      service.setCurrentQuestionAnswerConfig({ equalCase: true });

      await jest.runAllTimers();

      expect(next).toBeCalledTimes(2);
      expect(error).not.toBeCalled();
    });

    it('should not push quizee if it is the same', async () => {
      service.createQuizee().subscribe({ next, error });
      service.setCurrentQuestionAnswerConfig({});

      await jest.runAllTimers();

      expect(next).toBeCalledTimes(1);
      expect(error).not.toBeCalled();
    });

    it('should push current question', async () => {
      service.createQuizee();
      service.getCurrentQuestion().subscribe({ next, error });
      service.setCurrentQuestionAnswerConfig({ equalCase: true });

      await jest.runAllTimers();

      expect(next).toBeCalledTimes(2);
      expect(error).not.toBeCalled();
    });

    it('should not push current question if it is the same', async () => {
      service.createQuizee();
      service.getCurrentQuestion().subscribe({ next, error });
      service.setCurrentQuestionAnswerConfig({});

      await jest.runAllTimers();

      expect(next).toBeCalledTimes(1);
      expect(error).not.toBeCalled();
    });

    it('should apply changes', async () => {
      service.createQuizee();
      service.getCurrentQuestion().subscribe({ next, error });
      service.setCurrentQuestionAnswerConfig({ equalCase: true });

      await jest.runAllTimers();

      expect(next).toBeCalledTimes(2);
      expect(next.mock.calls[1][0].answer.config).toEqual({ ...next.mock.calls[0][0].answer.config, equalCase: true });
      expect(error).not.toBeCalled();
    });

    it('should make deep copy', async () => {
      const object = { someArray: [{ a: 1 }] } as any;
      service.createQuizee();
      service.getCurrentQuestion().subscribe({ next, error });
      service.setCurrentQuestionAnswerConfig(object);
      object.someArray[0].a = 2;

      await jest.runAllTimers();

      expect(next).toBeCalledTimes(2);
      expect(next.mock.calls[1][0].answer.config.someArray).toEqual([{ a: 1 }]);
      expect(error).not.toBeCalled();
    });
  });

  describe('setAnswerConfig', () => {
    it('should throw if quizee is not loaded', async () => {
      service.setAnswerConfig(0, {}).subscribe({ next, error });

      await jest.runAllTimers();

      expect(next).not.toBeCalled();
      expect(error).toBeCalled();
    });

    it('should push quizee', async () => {
      service.createQuizee().subscribe({ next, error });
      service.setAnswerConfig(0, { equalCase: true });

      await jest.runAllTimers();

      expect(next).toBeCalledTimes(2);
      expect(error).not.toBeCalled();
    });

    it('should not push quizee if it is the same', async () => {
      service.createQuizee().subscribe({ next, error });
      service.setAnswerConfig(0, {});

      await jest.runAllTimers();

      expect(next).toBeCalledTimes(1);
      expect(error).not.toBeCalled();
    });

    it('should push changed question', async () => {
      service.createQuizee();
      service.createQuestion();
      service.getQuestion(0).subscribe({ next, error });
      service.setAnswerConfig(0, { equalCase: true });
      service.getQuestion(1).subscribe({ next, error });
      service.setAnswerConfig(1, { equalCase: true });

      await jest.runAllTimers();

      expect(next).toBeCalledTimes(4);
      expect(error).not.toBeCalled();
    });

    it('should not push question if it is the same', async () => {
      service.createQuizee();
      service.getQuestion(0).subscribe({ next, error });
      service.setAnswerConfig(0, {});

      await jest.runAllTimers();

      expect(next).toBeCalledTimes(1);
      expect(error).not.toBeCalled();
    });

    it('should apply changes', async () => {
      service.createQuizee();
      service.createQuestion();
      service.createQuestion();
      service.getQuestion(1).subscribe({ next, error });
      service.setAnswerConfig(1, { equalCase: true });

      await jest.runAllTimers();

      expect(next).toBeCalledTimes(2);
      expect(next.mock.calls[1][0].answer.config).toEqual({ ...next.mock.calls[0][0].answer.config, equalCase: true });
      expect(error).not.toBeCalled();
    });

    it('should make deep copy', async () => {
      const object = { someArray: [{ a: 1 }] } as any;
      service.createQuizee();
      service.getQuestion(0).subscribe({ next, error });
      service.setAnswerConfig(0, object);
      object.someArray[0].a = 2;

      await jest.runAllTimers();

      expect(next).toBeCalledTimes(2);
      expect(next.mock.calls[1][0].answer.config.someArray).toEqual([{ a: 1 }]);
      expect(error).not.toBeCalled();
    });
  });

  describe('setCurrentQuestionType', () => {
    it('should throw if quizee is not loaded', async () => {
      service.setCurrentQuestionType('ONE_TRUE').subscribe({ next, error });

      await jest.runAllTimers();

      expect(next).not.toBeCalled();
      expect(error).toBeCalled();
    });

    it('should push quizee', async () => {
      service.createQuizee().subscribe({ next, error });
      service.setCurrentQuestionType('SEVERAL_TRUE');

      await jest.runAllTimers();

      expect(next).toBeCalledTimes(2);
      expect(error).not.toBeCalled();
    });

    it('should not push quizee if it is the same', async () => {
      service.createQuizee().subscribe({ next, error });
      service.setCurrentQuestionType('ONE_TRUE');

      await jest.runAllTimers();

      expect(next).toBeCalledTimes(1);
      expect(error).not.toBeCalled();
    });

    it('should push current question', async () => {
      service.createQuizee();
      service.getCurrentQuestion().subscribe({ next, error });
      service.setCurrentQuestionType('SEVERAL_TRUE');

      await jest.runAllTimers();

      expect(next).toBeCalledTimes(2);
      expect(error).not.toBeCalled();
    });

    it('should not push current question if it is the same', async () => {
      service.createQuizee();
      service.getCurrentQuestion().subscribe({ next, error });
      service.setCurrentQuestionType('ONE_TRUE');

      await jest.runAllTimers();

      expect(next).toBeCalledTimes(1);
      expect(error).not.toBeCalled();
    });

    it('should change question type', async () => {
      service.createQuizee();
      service.getCurrentQuestion().subscribe({ next, error });
      service.setCurrentQuestionType('SEVERAL_TRUE');

      await jest.runAllTimers();

      expect(error).not.toBeCalled();
      expect(next.mock.calls[1][0].question.type).toBe('SEVERAL_TRUE');
      expect(next.mock.calls[1][0].question.type).not.toBe(next.mock.calls[0][0].question.type);
    });

    it('should clear answer options and set answer on switch to WRITE_ANSWER', async () => {
      service.createQuizee();
      service.setCurrentQuestionAnswerOptions([{ id: 'abc', value: 'abc' }]);
      service.setCurrentQuestionAnswer(['abc']);

      service.setCurrentQuestionType('WRITE_ANSWER').subscribe({ next, error });

      await jest.runAllTimers();

      expect(error).not.toBeCalled();
      expect(next.mock.calls[0][0].answer.answer.length).toBe(1);
      expect(next.mock.calls[0][0].answer.answer[0]).not.toBe('');
      expect(next.mock.calls[0][0].question.answerOptions.length).toBe(0);
    });

    it('should leave question valid after switching in both ways', async () => {
      const { verifyQuestion, verifyAnswer } = jest.requireActual('@di-strix/quizee-verification-functions');

      service.createQuizee();
      service.createQuestion();
      service.setCurrentQuestionType('WRITE_ANSWER').subscribe({ next, error });

      expect(await verifyQuestion(next.mock.calls[0][0].question)).toEqual([]);
      expect(await verifyAnswer(next.mock.calls[0][0].answer)).toEqual([]);

      service.setCurrentQuestionType('ONE_TRUE').subscribe({ next, error });

      await jest.runAllTimers();

      expect(await verifyQuestion(next.mock.calls[1][0].question)).toEqual([]);
      expect(await verifyAnswer(next.mock.calls[1][0].answer)).toEqual([]);

      service.setCurrentQuestionType('SEVERAL_TRUE').subscribe({ next, error });

      await jest.runAllTimers();

      expect(await verifyQuestion(next.mock.calls[2][0].question)).toEqual([]);
      expect(await verifyAnswer(next.mock.calls[2][0].answer)).toEqual([]);
    });

    it('should add answer and answer option when switching from WRITE_ANSWER', async () => {
      service.createQuizee();
      service.setCurrentQuestionType('WRITE_ANSWER');
      service.setCurrentQuestionType('ONE_TRUE').subscribe({ next, error });

      await jest.runAllTimers();

      expect(error).not.toBeCalled();
      expect(next.mock.calls[0][0].answer.answer.length).toBe(1);
      expect(next.mock.calls[0][0].question.answerOptions.length).toBe(1);
      expect(next.mock.calls[0][0].answer.answer[0]).toBe(next.mock.calls[0][0].question.answerOptions[0].id);
    });
  });

  describe('setQuestionType', () => {
    it('should throw if quizee is not loaded', async () => {
      service.setQuestionType(0, 'ONE_TRUE').subscribe({ next, error });

      await jest.runAllTimers();

      expect(next).not.toBeCalled();
      expect(error).toBeCalled();
    });

    it('should throw if index is invalid', async () => {
      service.createQuizee();
      service.setQuestionType(-1, 'SEVERAL_TRUE').subscribe({ next, error });
      service.setQuestionType(1, 'SEVERAL_TRUE').subscribe({ next, error });

      await jest.runAllTimers();

      expect(next).not.toBeCalled();
      expect(error).toBeCalled();
    });

    it('should push quizee', async () => {
      service.createQuizee().subscribe({ next, error });
      service.setQuestionType(0, 'SEVERAL_TRUE');

      await jest.runAllTimers();

      expect(next).toBeCalledTimes(2);
      expect(error).not.toBeCalled();
    });

    it('should not push quizee if it is the same', async () => {
      service.createQuizee().subscribe({ next, error });
      service.setQuestionType(0, 'ONE_TRUE');

      await jest.runAllTimers();

      expect(next).toBeCalledTimes(1);
      expect(error).not.toBeCalled();
    });

    it('should push modified question', async () => {
      let next1 = jest.fn();
      let error1 = jest.fn();

      service.createQuizee();
      service.createQuestion().subscribe({ next, error });
      service.createQuestion().subscribe({ next: next1, error: error1 });
      service.createQuestion();
      service.setQuestionType(1, 'SEVERAL_TRUE');

      expect(next).toBeCalledTimes(2);
      expect(error).not.toBeCalled();

      expect(next1).toBeCalledTimes(1);
      expect(error1).not.toBeCalled();
    });

    it('should not push question if it is the same', async () => {
      service.createQuizee();
      service.getQuestion(0).subscribe({ next, error });
      service.setQuestionType(0, 'ONE_TRUE');

      await jest.runAllTimers();

      expect(next).toBeCalledTimes(1);
      expect(error).not.toBeCalled();
    });

    it('should change question type', async () => {
      service.createQuizee();
      service.getQuestion(0).subscribe({ next, error });
      service.setQuestionType(0, 'SEVERAL_TRUE');

      await jest.runAllTimers();

      expect(error).not.toBeCalled();
      expect(next.mock.calls[1][0].question.type).toBe('SEVERAL_TRUE');
      expect(next.mock.calls[1][0].question.type).not.toBe(next.mock.calls[0][0].question.type);
    });

    it('should clear answer options and set answer on switch to WRITE_ANSWER', async () => {
      service.createQuizee();
      service.setAnswerOptions(0, [{ id: 'abc', value: 'abc' }]);
      service.setAnswer(0, ['abc']);

      service.setQuestionType(0, 'WRITE_ANSWER').subscribe({ next, error });

      await jest.runAllTimers();

      expect(error).not.toBeCalled();
      expect(next.mock.calls[0][0].answer.answer.length).toBe(1);
      expect(next.mock.calls[0][0].answer.answer[0]).not.toBe('');
      expect(next.mock.calls[0][0].question.answerOptions.length).toBe(0);
    });

    it('should leave question valid after switching in both ways', async () => {
      const { verifyQuestion, verifyAnswer } = jest.requireActual('@di-strix/quizee-verification-functions');

      service.createQuizee();
      service.createQuestion();
      service.setQuestionType(1, 'WRITE_ANSWER').subscribe({ next, error });

      expect(await verifyQuestion(next.mock.calls[0][0].question)).toEqual([]);
      expect(await verifyAnswer(next.mock.calls[0][0].answer)).toEqual([]);

      service.setQuestionType(1, 'ONE_TRUE').subscribe({ next, error });

      await jest.runAllTimers();

      expect(await verifyQuestion(next.mock.calls[1][0].question)).toEqual([]);
      expect(await verifyAnswer(next.mock.calls[1][0].answer)).toEqual([]);

      service.setQuestionType(1, 'SEVERAL_TRUE').subscribe({ next, error });

      await jest.runAllTimers();

      expect(await verifyQuestion(next.mock.calls[2][0].question)).toEqual([]);
      expect(await verifyAnswer(next.mock.calls[2][0].answer)).toEqual([]);
    });

    it('should add answer and answer option when switching from WRITE_ANSWER', async () => {
      service.createQuizee();
      service.setQuestionType(0, 'WRITE_ANSWER');
      service.setQuestionType(0, 'ONE_TRUE').subscribe({ next, error });

      await jest.runAllTimers();

      expect(error).not.toBeCalled();
      expect(next.mock.calls[0][0].answer.answer.length).toBe(1);
      expect(next.mock.calls[0][0].question.answerOptions.length).toBe(1);
      expect(next.mock.calls[0][0].answer.answer[0]).toBe(next.mock.calls[0][0].question.answerOptions[0].id);
    });
  });

  describe('setCurrentQuestionAnswer', () => {
    it('should throw if quizee is not loaded', async () => {
      service.setCurrentQuestionAnswer([]).subscribe({ next, error });

      await jest.runAllTimers();

      expect(next).not.toBeCalled();
      expect(error).toBeCalled();
    });

    it('should set answer for current question', async () => {
      const answer: AnswerOptionId[] = ['1', '2', '3'];

      service.createQuizee();
      service.createQuestion();
      service.setCurrentQuestionAnswer(answer).subscribe({ next, error });

      await jest.runAllTimers();

      expect(error).not.toBeCalled();
      expect(next).toBeCalledTimes(1);
      expect(next.mock.calls[0][0].answer.answer).toEqual(answer);
    });

    it('should push new quizee', async () => {
      service.createQuizee().subscribe({ next, error });
      service.setCurrentQuestionAnswer(['1']);

      await jest.runAllTimers();

      expect(error).not.toBeCalled();
      expect(next).toBeCalledTimes(2);
      expect(next.mock.calls[0][0]).not.toEqual(next.mock.calls[1][0]);
    });

    it('should not push new quizee if it is the same', async () => {
      service.createQuizee().subscribe({ next, error });
      service.setCurrentQuestionAnswer(['1']);
      service.setCurrentQuestionAnswer(['1']);

      await jest.runAllTimers();

      expect(error).not.toBeCalled();
      expect(next).toBeCalledTimes(2);
    });

    it('should push current question', async () => {
      service.createQuizee();
      service.getCurrentQuestion().subscribe({ next, error });
      service.setCurrentQuestionAnswer(['1']);

      await jest.runAllTimers();

      expect(error).not.toBeCalled();
      expect(next).toBeCalledTimes(2);
    });

    it('should not push current question if it is the same', async () => {
      service.createQuizee();
      service.getCurrentQuestion().subscribe({ next, error });
      service.setCurrentQuestionAnswer(['1']);
      service.setCurrentQuestionAnswer(['1']);

      await jest.runAllTimers();

      expect(error).not.toBeCalled();
      expect(next).toBeCalledTimes(2);
    });
  });

  describe('setAnswer', () => {
    it('should throw if quizee is not loaded', async () => {
      service.setAnswer(0, []).subscribe({ next, error });

      await jest.runAllTimers();

      expect(next).not.toBeCalled();
      expect(error).toBeCalled();
    });

    it('should throw if index is invalid', async () => {
      service.createQuizee();
      service.setAnswer(-1, []).subscribe({ next, error });
      service.setAnswer(1, []).subscribe({ next, error });

      await jest.runAllTimers();

      expect(next).not.toBeCalled();
      expect(error).toBeCalledTimes(2);
    });

    it('should set answer for specified question', async () => {
      const answer: AnswerOptionId[] = ['1', '2', '3'];

      service.createQuizee();
      service.createQuestion();
      service.getQuizee().subscribe({ next, error });
      service.setAnswer(0, answer);

      await jest.runAllTimers();

      expect(error).not.toBeCalled();
      expect(next).toBeCalledTimes(2);
      expect(next.mock.calls[1][0].answers[0].answer).toEqual(answer);
      expect(next.mock.calls[0][0].answers[0].answer).toEqual(next.mock.calls[0][0].answers[0].answer);
    });

    it('should push new quizee', async () => {
      service.createQuizee().subscribe({ next, error });
      service.setAnswer(0, ['1']);

      await jest.runAllTimers();

      expect(error).not.toBeCalled();
      expect(next).toBeCalledTimes(2);
      expect(next.mock.calls[0][0]).not.toEqual(next.mock.calls[1][0]);
    });

    it('should not push new quizee if it is the same', async () => {
      service.createQuizee().subscribe({ next, error });
      service.setAnswer(0, ['1']);
      service.setAnswer(0, ['1']);

      await jest.runAllTimers();

      expect(error).not.toBeCalled();
      expect(next).toBeCalledTimes(2);
    });

    it('should push specified question', async () => {
      let next1 = jest.fn();
      let error1 = jest.fn();

      service.createQuizee();
      service.createQuestion();
      service.getQuestion(0).subscribe({ next: next1, error: error1 });
      service.getQuestion(1).subscribe({ next, error });
      service.setAnswer(1, ['1']);

      await jest.runAllTimers();

      expect(error).not.toBeCalled();
      expect(next).toBeCalledTimes(2);

      expect(next1).toBeCalledTimes(1);
      expect(error1).not.toBeCalled();
    });

    it('should not push question if it is the same', async () => {
      service.createQuizee();
      service.getQuestion(0).subscribe({ next, error });
      service.setAnswer(0, ['1']);
      service.setAnswer(0, ['1']);

      await jest.runAllTimers();

      expect(error).not.toBeCalled();
      expect(next).toBeCalledTimes(2);
    });
  });

  describe('setCurrentQuestionAnswerOptions', () => {
    it('should throw if quizee is not loaded', async () => {
      service.setCurrentQuestionAnswerOptions([]).subscribe({ next, error });

      await jest.runAllTimers();

      expect(next).not.toBeCalled();
      expect(error).toBeCalled();
    });

    it('should set answer options for current question', async () => {
      const answerOptions: AnswerOption[] = [{ id: '1', value: '' }];

      service.createQuizee().subscribe({ next, error });
      service.createQuestion();
      service.setCurrentQuestionAnswerOptions(answerOptions);

      await jest.runAllTimers();

      expect(error).not.toBeCalled();
      expect(next).toBeCalledTimes(3);
      expect(next.mock.calls[2][0].questions[1].answerOptions).toEqual(answerOptions);
      expect(next.mock.calls[2][0].questions[0].answerOptions).toEqual(
        next.mock.calls[0][0].questions[0].answerOptions
      );
    });

    it('should push new quizee', async () => {
      service.createQuizee().subscribe({ next, error });
      service.setCurrentQuestionAnswerOptions([{ id: '1', value: '' }]);

      await jest.runAllTimers();

      expect(error).not.toBeCalled();
      expect(next).toBeCalledTimes(2);
      expect(next.mock.calls[0][0]).not.toEqual(next.mock.calls[1][0]);
    });

    it('should not push new quizee if it is the same', async () => {
      service.createQuizee().subscribe({ next, error });
      service.setCurrentQuestionAnswerOptions([{ id: '1', value: '' }]);
      service.setCurrentQuestionAnswerOptions([{ id: '1', value: '' }]);

      await jest.runAllTimers();

      expect(error).not.toBeCalled();
      expect(next).toBeCalledTimes(2);
    });

    it('should push current question', async () => {
      service.createQuizee();
      service.getCurrentQuestion().subscribe({ next, error });
      service.setCurrentQuestionAnswerOptions([{ id: '1', value: '' }]);

      await jest.runAllTimers();

      expect(error).not.toBeCalled();
      expect(next).toBeCalledTimes(2);
    });

    it('should not push current question if it the same', async () => {
      service.createQuizee();
      service.getCurrentQuestion().subscribe({ next, error });
      service.setCurrentQuestionAnswerOptions([{ id: '1', value: '' }]);
      service.setCurrentQuestionAnswerOptions([{ id: '1', value: '' }]);

      await jest.runAllTimers();

      expect(error).not.toBeCalled();
      expect(next).toBeCalledTimes(2);
    });
  });

  describe('setAnswerOptions', () => {
    it('should throw if quizee is not loaded', async () => {
      service.setAnswerOptions(0, []).subscribe({ next, error });

      await jest.runAllTimers();

      expect(next).not.toBeCalled();
      expect(error).toBeCalled();
    });

    it('should throw if index is invalid', async () => {
      service.createQuizee();
      service.setAnswerOptions(-1, []).subscribe({ next, error });
      service.setAnswerOptions(1, []).subscribe({ next, error });

      await jest.runAllTimers();

      expect(next).not.toBeCalled();
      expect(error).toBeCalledTimes(2);
    });

    it('should set answer options for specified question', async () => {
      const answerOptions: AnswerOption[] = [{ id: '1', value: '' }];

      service.createQuizee().subscribe({ next, error });
      service.createQuestion();
      service.setAnswerOptions(0, answerOptions);

      await jest.runAllTimers();

      expect(error).not.toBeCalled();
      expect(next).toBeCalledTimes(3);
      expect(next.mock.calls[2][0].questions[0].answerOptions).toEqual(answerOptions);
      expect(next.mock.calls[2][0].questions[1].answerOptions).toEqual(
        next.mock.calls[1][0].questions[1].answerOptions
      );
    });

    it('should push new quizee', async () => {
      service.createQuizee().subscribe({ next, error });
      service.setAnswerOptions(0, [{ id: '1', value: '' }]);

      await jest.runAllTimers();

      expect(error).not.toBeCalled();
      expect(next).toBeCalledTimes(2);
      expect(next.mock.calls[0][0]).not.toEqual(next.mock.calls[1][0]);
    });

    it('should not push new quizee if it is the same', async () => {
      service.createQuizee().subscribe({ next, error });
      service.setAnswerOptions(0, [{ id: '1', value: '' }]);
      service.setAnswerOptions(0, [{ id: '1', value: '' }]);

      await jest.runAllTimers();

      expect(error).not.toBeCalled();
      expect(next).toBeCalledTimes(2);
      expect(next.mock.calls[0][0]).not.toEqual(next.mock.calls[1][0]);
    });

    it('should push specified question', async () => {
      let next1 = jest.fn();
      let error1 = jest.fn();

      service.createQuizee();
      service.getQuestion(0).subscribe({ next, error });
      service.createQuestion();
      service.getQuestion(1).subscribe({ next: next1, error: error1 });
      service.setAnswerOptions(0, [{ id: '1', value: '' }]);

      await jest.runAllTimers();

      expect(error).not.toBeCalled();
      expect(next).toBeCalledTimes(2);

      expect(error1).not.toBeCalled();
      expect(next1).toBeCalledTimes(1);
    });

    it('should not push specified question if it is the same', async () => {
      service.createQuizee();
      service.getQuestion(0).subscribe({ next, error });
      service.setAnswerOptions(0, [{ id: '1', value: '' }]);
      service.setAnswerOptions(0, [{ id: '1', value: '' }]);

      await jest.runAllTimers();

      expect(error).not.toBeCalled();
      expect(next).toBeCalledTimes(2);
    });
  });

  describe('addAnswerOptionForCurrentQuestion', () => {
    it('should throw if quizee is not loaded', async () => {
      service.addAnswerOptionForCurrentQuestion().subscribe({ next, error });

      await jest.runAllTimers();

      expect(next).not.toBeCalled();
      expect(error).toBeCalled();
    });

    it('should create new answer option for current question', async () => {
      service.createQuizee().subscribe({ next, error });
      service.createQuestion();
      service.addAnswerOptionForCurrentQuestion();

      await jest.runAllTimers();

      expect(next).toBeCalledTimes(3);
      expect(error).not.toBeCalled();
      expect(next.mock.calls[1][0].questions[1].answerOptions.length).toBe(1);
      expect(next.mock.calls[2][0].questions[1].answerOptions.length).toBe(2);
      expect(next.mock.calls[2][0].questions[0].answerOptions.length).toBe(1);
    });

    it('should create unique id for each answer option', async () => {
      service.createQuizee();
      service.getCurrentQuestion().subscribe({ next, error });
      service.addAnswerOptionForCurrentQuestion();

      await jest.runAllTimers();

      expect(next).toBeCalledTimes(2);
      expect(next.mock.calls[1][0].question.answerOptions[0].id).not.toBe(
        next.mock.calls[1][0].question.answerOptions[1].id
      );
    });

    it('should create valid answer option', async () => {
      const { verifyAnswerOption } = jest.requireActual('@di-strix/quizee-verification-functions');

      service.createQuizee();
      service.getCurrentQuestion().subscribe({ next, error });
      service.addAnswerOptionForCurrentQuestion();

      await jest.runAllTimers();

      expect(await verifyAnswerOption(next.mock.calls[1][0].question.answerOptions[1])).toEqual([]);
    });

    it('should push quizee', async () => {
      service.createQuizee().subscribe({ next, error });
      service.addAnswerOptionForCurrentQuestion();

      await jest.runAllTimers();

      expect(next).toBeCalledTimes(2);
      expect(error).not.toBeCalled();
    });

    it('should push current question', async () => {
      service.createQuizee();
      service.getCurrentQuestion().subscribe({ next, error });
      service.addAnswerOptionForCurrentQuestion();

      await jest.runAllTimers();

      expect(next).toBeCalledTimes(2);
      expect(error).not.toBeCalled();
    });
  });

  describe('addAnswerOption', () => {
    it('should throw if quizee is not loaded', async () => {
      service.addAnswerOption(0).subscribe({ next, error });

      await jest.runAllTimers();

      expect(next).not.toBeCalled();
      expect(error).toBeCalled();
    });

    it('should create new answer option for specified question', async () => {
      service.createQuizee().subscribe({ next, error });
      service.createQuestion();
      service.addAnswerOption(0);

      await jest.runAllTimers();

      expect(next).toBeCalledTimes(3);
      expect(error).not.toBeCalled();
      expect(next.mock.calls[1][0].questions[0].answerOptions.length).toBe(1);
      expect(next.mock.calls[2][0].questions[0].answerOptions.length).toBe(2);
      expect(next.mock.calls[2][0].questions[1].answerOptions.length).toBe(1);
    });

    it('should create unique id for each answer option', async () => {
      service.createQuizee();
      service.getQuestion(0).subscribe({ next, error });
      service.addAnswerOption(0);

      await jest.runAllTimers();

      expect(next).toBeCalledTimes(2);
      expect(next.mock.calls[1][0].question.answerOptions[0].id).not.toBe(
        next.mock.calls[1][0].question.answerOptions[1].id
      );
    });

    it('should create valid answer option', async () => {
      const { verifyAnswerOption } = jest.requireActual('@di-strix/quizee-verification-functions');

      service.createQuizee();
      service.getQuestion(0).subscribe({ next, error });
      service.addAnswerOption(0);

      await jest.runAllTimers();

      expect(await verifyAnswerOption(next.mock.calls[1][0].question.answerOptions[1])).toEqual([]);
    });

    it('should push quizee', async () => {
      service.createQuizee().subscribe({ next, error });
      service.addAnswerOption(0);

      await jest.runAllTimers();

      expect(next).toBeCalledTimes(2);
      expect(error).not.toBeCalled();
    });

    it('should push specified question', async () => {
      let next1 = jest.fn();
      let error1 = jest.fn();

      service.createQuizee();
      service.createQuestion();
      service.getQuestion(0).subscribe({ next, error });
      service.getQuestion(1).subscribe({ next: next1, error: error1 });
      service.addAnswerOption(0);

      await jest.runAllTimers();

      expect(next).toBeCalledTimes(2);
      expect(error).not.toBeCalled();

      expect(next1).toBeCalledTimes(1);
      expect(error1).not.toBeCalled();
    });
  });

  describe('removeAnswerOptionForCurrentQuestion', () => {
    it('should throw if quizee is not loaded', async () => {
      service.removeAnswerOptionForCurrentQuestion('').subscribe({ next, error });

      await jest.runAllTimers();

      expect(next).not.toBeCalled();
      expect(error).toBeCalled();
    });

    it('should remove answer option with provided id for selected question', async () => {
      service.createQuizee();
      service.getCurrentQuestion().subscribe({ next, error });
      service.addAnswerOptionForCurrentQuestion();

      await jest.runAllTimers();

      service.removeAnswerOptionForCurrentQuestion(next.mock.calls[1][0].question.answerOptions[0].id);

      await jest.runAllTimers();

      expect(next.mock.calls[1][0].question.answerOptions.length).toBe(2);
      expect(next.mock.calls[2][0].question.answerOptions[0].id).not.toBe(
        next.mock.calls[1][0].question.answerOptions[0].id
      );
    });

    it('should remove answer with provided id for selected question', async () => {
      service.createQuizee();
      service.getCurrentQuestion().subscribe({ next, error });
      service.addAnswerOptionForCurrentQuestion();

      await jest.runAllTimers();

      expect(next).toBeCalledTimes(2);
      service.setCurrentQuestionAnswerOptions([next.mock.calls[1][0].question.answerOptions[0].id]);
      service.removeAnswerOptionForCurrentQuestion(next.mock.calls[1][0].question.answerOptions[0].id);

      await jest.runAllTimers();

      expect(error).not.toBeCalled();
      expect(next).toBeCalledTimes(4);
      expect(next.mock.calls[3][0].answer.answer).toEqual([]);
    });

    it('should do nothing if id not found', async () => {
      service.createQuizee().subscribe({ next, error });
      service.removeAnswerOptionForCurrentQuestion('');
      service.removeAnswerOptionForCurrentQuestion('123123');

      await jest.runAllTimers();

      expect(next).toBeCalledTimes(1);
      expect(error).not.toBeCalled();
    });

    it('should push quizee', async () => {
      service.createQuizee().subscribe({ next, error });
      service.removeAnswerOptionForCurrentQuestion(service.quizee?.questions[0].answerOptions[0].id || '');

      await jest.runAllTimers();

      expect(next).toBeCalledTimes(3);
      expect(error).not.toBeCalled();
    });

    it('should not push quizee if it is the same', async () => {
      service.createQuizee().subscribe({ next, error });

      const id = service.quizee?.questions[0].answerOptions[0]?.id || '';
      service.removeAnswerOptionForCurrentQuestion(id);
      service.removeAnswerOptionForCurrentQuestion(id);

      await jest.runAllTimers();

      expect(next).toBeCalledTimes(3);
      expect(error).not.toBeCalled();
    });
  });

  describe('removeAnswerOption', () => {
    it('should throw if quizee is not loaded', async () => {
      service.removeAnswerOption(0, '').subscribe({ next, error });

      await jest.runAllTimers();

      expect(next).not.toBeCalled();
      expect(error).toBeCalled();
    });

    it('should throw if index is invalid', async () => {
      service.createQuizee();
      service.removeAnswerOption(-1, '').subscribe({ next, error });
      service.removeAnswerOption(1, '').subscribe({ next, error });

      await jest.runAllTimers();

      expect(next).not.toBeCalled();
      expect(error).toBeCalledTimes(2);
    });

    it('should remove answer option with provided id for specified question', async () => {
      service.createQuizee();
      service.createQuestion();
      service.addAnswerOption(0);
      service.getQuizee().subscribe({ next, error });

      await jest.runAllTimers();

      service.removeAnswerOption(0, next.mock.calls[0][0].questions[0].answerOptions[0].id);

      await jest.runAllTimers();

      expect(next.mock.calls[0][0].questions[0].answerOptions.length).toBe(2);
      expect(next.mock.calls[1][0].questions[0].answerOptions[0].id).not.toBe(
        next.mock.calls[0][0].questions[0].answerOptions[0].id
      );
      expect(next.mock.calls[0][0].questions[1].answerOptions[0].id).toBe(
        next.mock.calls[1][0].questions[1].answerOptions[0].id
      );
    });

    it('should remove answer with provided id for specified question', async () => {
      service.createQuizee();
      service.createQuestion();
      service.getQuizee().subscribe({ next, error });

      await jest.runAllTimers();

      service.removeAnswerOption(0, next.mock.calls[0][0].questions[0].answerOptions[0].id);

      await jest.runAllTimers();

      expect(error).not.toBeCalled();
      expect(next).toBeCalledTimes(3);
      expect(next.mock.calls[2][0].answers[0].answer).toEqual([]);
      expect(next.mock.calls[2][0].answers[1].answer.length).toBe(1);
    });

    it('should do nothing if id not found', async () => {
      service.createQuizee().subscribe({ next, error });
      service.removeAnswerOption(0, '');
      service.removeAnswerOption(0, '123123');

      await jest.runAllTimers();

      expect(next).toBeCalledTimes(1);
      expect(error).not.toBeCalled();
    });

    it('should push quizee', async () => {
      service.createQuizee().subscribe({ next, error });
      service.removeAnswerOption(0, next.mock.calls[0][0].questions[0].answerOptions[0].id);

      await jest.runAllTimers();

      expect(next).toBeCalledTimes(3);
      expect(error).not.toBeCalled();
    });

    it('should not push quizee if it is the same', async () => {
      service.createQuizee().subscribe({ next, error });

      service.removeAnswerOption(0, next.mock.calls[0][0].questions[0].answerOptions[0].id);
      service.removeAnswerOption(0, next.mock.calls[0][0].questions[0].answerOptions[0].id);

      await jest.runAllTimers();

      expect(next).toBeCalledTimes(3);
      expect(error).not.toBeCalled();
    });

    it('should push specified question', async () => {
      let next1 = jest.fn();
      let error1 = jest.fn();

      service.createQuizee();
      service.createQuestion();
      service.getQuestion(0).subscribe({ next, error });
      service.getQuestion(1).subscribe({ next: next1, error: error1 });

      service.removeAnswerOption(0, next.mock.calls[0][0].question.answerOptions[0].id);

      await jest.runAllTimers();

      expect(next).toBeCalledTimes(3);
      expect(error).not.toBeCalled();

      expect(next1).toBeCalledTimes(1);
      expect(error1).not.toBeCalled();
    });

    it('should not push specified question if it is the same', async () => {
      service.createQuizee();
      service.getQuestion(0).subscribe({ next, error });

      service.removeAnswerOption(0, next.mock.calls[0][0].question.answerOptions[0].id);
      service.removeAnswerOption(0, next.mock.calls[0][0].question.answerOptions[0].id);

      await jest.runAllTimers();

      expect(next).toBeCalledTimes(3);
      expect(error).not.toBeCalled();
    });
  });
});
