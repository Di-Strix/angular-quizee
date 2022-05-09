import { AnswerOption, AnswerOptionId, Quiz } from '@di-strix/quizee-types';

import * as _ from 'lodash';
import { Observable, first } from 'rxjs';

import { QuestionPair, QuizeeEditingService } from './quizee-editing.service';

describe('QuizeeEditingService', () => {
  let service: QuizeeEditingService;
  let next: jest.Mock;
  let error: jest.Mock;

  beforeEach(() => {
    service = new QuizeeEditingService();

    error = jest.fn();
    next = jest.fn();

    jest.useFakeTimers();
  });

  describe('create', () => {
    it('should create new quiz and return observable that emits new quizee', () => {
      service.create().subscribe({ next, error });

      jest.runAllTimers();

      expect(next).toHaveBeenCalled();
      expect(next.mock.calls[0][0]).toBeTruthy();
      expect(error).not.toHaveBeenCalled();
    });
  });

  describe('load', () => {
    it('should load provided quiz and return observable that emits loaded quizee', () => {
      const quizee = {
        [Symbol()]: 'data',
        questions: [],
        answers: [],
      };

      service.load(quizee as any as Quiz).subscribe({ next, error });

      jest.runAllTimers();

      expect(next).toHaveBeenCalledWith(quizee);
      expect(error).not.toHaveBeenCalled();
    });

    it('should make sure that length of questions and answers is equal', () => {
      let quizee = {
        [Symbol()]: 'data',
        questions: [{}],
        answers: [],
      };

      service.load(quizee as any as Quiz).subscribe({ next, error });

      jest.runAllTimers();

      expect(next).not.toHaveBeenCalled();
      expect(error).toHaveBeenCalled();

      next.mockReset();
      error.mockReset();

      quizee.questions.pop();

      service
        .load(quizee as any as Quiz)
        .pipe(first())
        .subscribe({ next, error });

      jest.runAllTimers();

      expect(next).toHaveBeenCalledWith(quizee);
      expect(error).not.toHaveBeenCalled();
    });
  });

  describe('modify', () => {
    it("should throw if quizee isn't created", () => {
      service.modify({}).subscribe({ next, error });

      jest.runAllTimers();

      expect(next).not.toHaveBeenCalled();
      expect(error).toHaveBeenCalled();
    });

    it('should concat current quizee with the provided changes', () => {
      const change1 = {
        change1: 'change1',
      };

      const change2 = {
        change2: 'change2',
      };

      service.create().subscribe({ next, error });
      service.modify(change1 as any as Quiz);
      service.modify(change2 as any as Quiz);

      jest.runAllTimers();

      expect(error).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalledTimes(3);
      expect(next.mock.calls[1][0]).toEqual({ ...next.mock.calls[0][0], ...change1 });
      expect(next.mock.calls[2][0]).toEqual({ ...next.mock.calls[1][0], ...change2 });
    });

    it('should emit updates to subscribers', () => {
      const quizee = {
        a: 'data',
        questions: [],
        answers: [],
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

      jest.runAllTimers();

      expect(error).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalledTimes(3);
      expect(next.mock.calls[0][0]).toEqual(quizee);
      expect(next.mock.calls[1][0]).toEqual({ ...next.mock.calls[0][0], ...change1 });
      expect(next.mock.calls[2][0]).toEqual({ ...next.mock.calls[1][0], ...change2 });
    });

    it('should not change selected question', () => {
      service.create();
      service.createQuestion();
      service.createQuestion().subscribe({ next, error });
      const index = service.currentIndex;
      service.modify({ info: { caption: 'aaa' } });

      jest.runAllTimers();

      expect(error).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalledTimes(1);
      expect(service.currentIndex).toEqual(index);
    });
  });

  describe('get', () => {
    it('should return observable that emits current quizee', () => {
      const quizee = {
        [Symbol()]: 'data',
        questions: [],
        answers: [],
      };

      service.load(quizee as any as Quiz);
      service.get().subscribe({ next, error });

      jest.runAllTimers();

      expect(error).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalled();
      expect(next.mock.calls[0][0]).toEqual(quizee);
    });
  });

  describe('createQuestion', () => {
    it('should throw if quizee is not loaded', () => {
      service.createQuestion().subscribe({ next, error });

      jest.runAllTimers();

      expect(next).not.toHaveBeenCalled();
      expect(error).toHaveBeenCalled();
    });

    it('should push updated quizee', () => {
      service.create().subscribe({ next, error });
      service.createQuestion();

      jest.runAllTimers();

      expect(error).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalledTimes(2);
      expect(next.mock.calls[0]).not.toEqual(next.mock.calls[1]);
    });

    it('should select created question', () => {
      service.create();
      service.createQuestion().subscribe({ next, error });
      service.createQuestion();

      jest.runAllTimers();

      expect(error).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalledTimes(2);
      expect(next.mock.calls[0]).not.toEqual(next.mock.calls[1]);
    });

    it('should create question with initial answer and answerOption', () => {
      service.create();
      service.createQuestion().subscribe({ next, error });

      jest.runAllTimers();

      expect(next.mock.calls[0][0].answer.answer.length).toBe(1);
      expect(next.mock.calls[0][0].question.answerOptions.length).toBe(1);
      expect(next.mock.calls[0][0].answer.answer[0]).toBe(next.mock.calls[0][0].question.answerOptions[0].id);
    });
  });

  describe('selectQuestion', () => {
    it('should throw if quizee is not loaded', () => {
      service.selectQuestion(0).subscribe({ next, error });

      jest.runAllTimers();

      expect(next).not.toHaveBeenCalled();
      expect(error).toHaveBeenCalled();
    });

    it('should throw if out of range', () => {
      service.create();
      service.selectQuestion(0).subscribe({ next, error });

      jest.runAllTimers();

      expect(next).not.toHaveBeenCalled();
      expect(error).toHaveBeenCalled();
    });

    it('should throw if invalid index', () => {
      service.create();
      service.selectQuestion(-1).subscribe({ next, error });

      jest.runAllTimers();

      expect(next).not.toHaveBeenCalled();
      expect(error).toHaveBeenCalled();
    });

    it('should push current question', () => {
      service.create();
      service.createQuestion();
      service.createQuestion();
      service.selectQuestion(0).subscribe({ next, error });
      service.selectQuestion(1);

      jest.runAllTimers();

      expect(error).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalledTimes(2);
      expect(next.mock.calls[1][0]).not.toEqual(next.mock.calls[0][0]);
    });
  });

  describe('modifyCurrentQuestion', () => {
    it('should throw if quizee is not loaded', () => {
      service.modifyCurrentQuestion({}).subscribe({ next, error });

      jest.runAllTimers();

      expect(next).not.toHaveBeenCalled();
      expect(error).toHaveBeenCalled();
    });

    it('should throw if question is not selected', () => {
      service.create();
      service.modifyCurrentQuestion({}).subscribe({ next, error });

      jest.runAllTimers();

      expect(next).not.toHaveBeenCalled();
      expect(error).toHaveBeenCalled();
    });

    it('should concat current question with the provided changes', () => {
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

      jest.runAllTimers();

      expect(error).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalledTimes(3);
      expect(next.mock.calls[1][0]).toEqual(_.merge({}, next.mock.calls[0][0], change1));
      expect(next.mock.calls[2][0]).toEqual(_.merge({}, next.mock.calls[1][0], change2));
    });

    it('should push new quizee', () => {
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

      jest.runAllTimers();

      expect(error).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalledTimes(4);
      expect(next.mock.calls[1][0]).not.toEqual(next.mock.calls[0][0]);
      expect(next.mock.calls[2][0]).not.toEqual(next.mock.calls[1][0]);
    });
  });

  describe('setAnswer', () => {
    it('should throw if quizee is not loaded', () => {
      service.setAnswer([]).subscribe({ next, error });

      jest.runAllTimers();

      expect(next).not.toHaveBeenCalled();
      expect(error).toHaveBeenCalled();
    });

    it('should throw if question is not selected', () => {
      service.create();
      service.setAnswer([]).subscribe({ next, error });

      jest.runAllTimers();

      expect(next).not.toHaveBeenCalled();
      expect(error).toHaveBeenCalled();
    });

    it('should set answer for current question', () => {
      const answer: AnswerOptionId[] = ['1', '2', '3'];

      service.create();
      service.createQuestion();
      service.setAnswer(answer).subscribe({ next, error });

      jest.runAllTimers();

      expect(error).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalledTimes(1);
      expect(next.mock.calls[0][0].answer.answer).toEqual(answer);
    });

    it('should push new quizee', () => {
      service.create().subscribe({ next, error });
      service.createQuestion();
      service.setAnswer(['1']);

      jest.runAllTimers();

      expect(error).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalledTimes(3);
      expect(next.mock.calls[0][0]).not.toEqual(next.mock.calls[2][0]);
    });
  });

  describe('setAnswerOptions', () => {
    it('should throw if quizee is not loaded', () => {
      service.setAnswerOptions([]).subscribe({ next, error });

      jest.runAllTimers();

      expect(next).not.toHaveBeenCalled();
      expect(error).toHaveBeenCalled();
    });

    it('should throw if question is not selected', () => {
      service.create();
      service.setAnswerOptions([]).subscribe({ next, error });

      jest.runAllTimers();

      expect(next).not.toHaveBeenCalled();
      expect(error).toHaveBeenCalled();
    });

    it('should set answer options for current question', () => {
      const answerOptions: AnswerOption[] = [{ id: '1', value: '' }];

      service.create();
      service.createQuestion();
      service.setAnswerOptions(answerOptions).subscribe({ next, error });

      jest.runAllTimers();

      expect(error).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalledTimes(1);
      expect(next.mock.calls[0][0].question.answerOptions).toEqual(answerOptions);
    });

    it('should push new quizee', () => {
      service.create().subscribe({ next, error });
      service.createQuestion();
      service.setAnswerOptions([{ id: '1', value: '' }]);

      jest.runAllTimers();

      expect(error).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalledTimes(3);
      expect(next.mock.calls[1][0]).not.toEqual(next.mock.calls[2][0]);
    });
  });

  describe('pushQuizee', () => {
    it('should not push if quizee is falsy', () => {
      const testingService = service as any as { quizee: Quiz; get: () => Observable<Quiz>; pushQuizee: () => void };

      testingService.get().subscribe({ next, error });
      testingService.pushQuizee();

      jest.runAllTimers();

      expect(testingService.quizee).toBeFalsy();
      expect(next).not.toHaveBeenCalled();
      expect(error).not.toHaveBeenCalled();
    });

    it('should push quizee if it exists', () => {
      const testingService = service as any as {
        quizee: Quiz;
        get: () => Observable<Quiz>;
        pushQuizee: () => void;
        create: () => Observable<Quiz>;
      };

      testingService.create().subscribe({ next, error });
      testingService.pushQuizee();

      jest.runAllTimers();

      expect(testingService.quizee).toBeTruthy();
      expect(next).toBeCalledTimes(2);
      expect(error).not.toHaveBeenCalled();
    });

    it('should make deep copy', () => {
      const testingService = service as any as {
        quizee: Quiz;
        create: () => Observable<Quiz>;
        get: () => Observable<Quiz>;
        pushQuizee: () => void;
      };

      testingService.create().subscribe({ next, error });
      testingService.pushQuizee();
      testingService.quizee.info.caption = '123123';

      jest.runAllTimers();

      expect(next).toHaveBeenCalledTimes(2);
      expect(error).not.toHaveBeenCalled();
      expect(next.mock.calls[1][0].info.caption).not.toEqual('123123');
      expect(next.mock.calls[1][0].info.caption).toEqual(next.mock.calls[0][0].info.caption);
    });
  });

  describe('pushCurrentQuestion', () => {
    it('should not push if quizee is not created', () => {
      const testingService = service as any as {
        get: () => Observable<Quiz>;
        pushCurrentQuestion: () => void;
      };

      testingService.get().subscribe({ next, error });
      testingService.pushCurrentQuestion();

      jest.runAllTimers();

      expect(next).not.toHaveBeenCalled();
      expect(error).not.toHaveBeenCalled();
    });

    it('should not push if question is not selected', () => {
      const testingService = service as any as {
        create: () => Observable<Quiz>;
        getCurrentQuestion: () => Observable<QuestionPair>;
        pushCurrentQuestion: () => void;
      };

      testingService.getCurrentQuestion().subscribe({ next, error });
      testingService.pushCurrentQuestion();

      jest.runAllTimers();

      expect(next).not.toHaveBeenCalled();
      expect(error).not.toHaveBeenCalled();
    });

    it('should push', () => {
      const testingService = service as any as {
        quizee: Quiz;
        create: () => Observable<Quiz>;
        createQuestion: () => Observable<QuestionPair>;
        getCurrentQuestion: () => Observable<QuestionPair>;
        pushCurrentQuestion: () => void;
      };

      testingService.create();
      testingService.createQuestion().subscribe({ next, error });
      testingService.pushCurrentQuestion();

      jest.runAllTimers();

      expect(next).toHaveBeenCalledTimes(2);
      expect(error).not.toHaveBeenCalled();
    });

    it('should make deep copy', () => {
      const testingService = service as any as {
        quizee: Quiz;
        create: () => Observable<Quiz>;
        createQuestion: () => Observable<QuestionPair>;
        getCurrentQuestion: () => Observable<QuestionPair>;
        pushCurrentQuestion: () => void;
      };

      testingService.create();
      testingService.createQuestion().subscribe({ next, error });
      testingService.pushCurrentQuestion();
      testingService.quizee.answers[0].answerTo = '123123';

      jest.runAllTimers();

      expect(next).toHaveBeenCalledTimes(2);
      expect(error).not.toHaveBeenCalled();
      expect(next.mock.calls[1][0].answer.answerTo).not.toEqual('123123');
      expect(next.mock.calls[1][0].answer.answerTo).toEqual(next.mock.calls[0][0].answer.answerTo);
    });
  });

  describe('addAnswerOption', () => {
    it('should throw if quizee is not created', () => {
      service.addAnswerOption().subscribe({ next, error });

      jest.runAllTimers();

      expect(next).not.toHaveBeenCalled();
      expect(error).toHaveBeenCalled();
    });

    it('should throw if question is not selected', () => {
      service.create();
      service.addAnswerOption().subscribe({ next, error });

      jest.runAllTimers();

      expect(next).not.toHaveBeenCalled();
      expect(error).toHaveBeenCalled();
    });

    it('should create new answer option for selected question', () => {
      service.create();
      service.createQuestion().subscribe({ next, error });
      service.addAnswerOption();

      expect(next).toHaveBeenCalledTimes(2);
      expect(next.mock.calls[0][0].question.answerOptions.length).toBe(1);
      expect(next.mock.calls[1][0].question.answerOptions.length).toBe(2);
    });

    it('should create unique id for each answer option', () => {
      service.create();
      service.createQuestion().subscribe({ next, error });
      service.addAnswerOption();

      expect(next).toHaveBeenCalledTimes(2);
      expect(next.mock.calls[1][0].question.answerOptions[0].id).not.toBe(
        next.mock.calls[1][0].question.answerOptions[1].id
      );
    });
  });

  describe('removeAnswerOption', () => {
    it('should throw if quizee is not created', () => {
      service.removeAnswerOption('').subscribe({ next, error });

      jest.runAllTimers();

      expect(next).not.toHaveBeenCalled();
      expect(error).toHaveBeenCalled();
    });

    it('should throw if question is not selected', () => {
      service.create();
      service.removeAnswerOption('').subscribe({ next, error });

      jest.runAllTimers();

      expect(next).not.toHaveBeenCalled();
      expect(error).toHaveBeenCalled();
    });

    it('should remove answer option with provided id for selected question', () => {
      service.create();
      service.createQuestion().subscribe({ next, error });
      service.addAnswerOption();

      jest.runAllTimers();

      service.removeAnswerOption(next.mock.calls[1][0].question.answerOptions[0].id);

      jest.runAllTimers();

      expect(next.mock.calls[1][0].question.answerOptions.length).toBe(2);
      expect(next.mock.calls[2][0].question.answerOptions[0].id).not.toBe(
        next.mock.calls[1][0].question.answerOptions[0].id
      );
    });

    it('should remove answer with provided id for selected question', () => {
      service.create();
      service.createQuestion().subscribe({ next, error });
      service.addAnswerOption();
      service.addAnswerOption();

      jest.runAllTimers();

      service.setAnswer([next.mock.calls[1][0].question.answerOptions[0].id]);
      service.removeAnswerOption(next.mock.calls[1][0].question.answerOptions[0].id);

      jest.runAllTimers();

      expect(next.mock.calls[5][0].answer.answer).toEqual([]);
    });
  });
});
