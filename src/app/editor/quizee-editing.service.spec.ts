import { Quiz } from '@di-strix/quizee-types';

import * as _ from 'lodash';
import { first } from 'rxjs';

import { QuizeeEditingService } from './quizee-editing.service';

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
});
