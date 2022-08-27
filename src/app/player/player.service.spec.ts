import { Quiz } from '@di-strix/quizee-types';

import { of } from 'rxjs';

import { QuizeeService } from '../shared/services/quizee.service';

import { PlayerService } from './player.service';

jest.mock('../shared/services/quizee.service');

describe('PlayerService', () => {
  let quizeeService: jest.MockedClass<typeof QuizeeService>['prototype'];
  let service: PlayerService;
  let next: jest.Mock;
  let error: jest.Mock;

  beforeEach(() => {
    quizeeService = new (QuizeeService as any)();
    service = new PlayerService(quizeeService);

    next = jest.fn();
    error = jest.fn();

    jest.useFakeTimers();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getState', () => {
    it('should return stream to current state', async () => {
      service.getState().subscribe({ next, error });

      await jest.runAllTimers();

      service.state$.next('checkingResults');
      service.state$.next('gotResults');

      await jest.runAllTimers();

      expect(error).not.toBeCalled();
      expect(next).toBeCalledTimes(2);
      expect(next).toHaveBeenNthCalledWith(1, 'checkingResults');
      expect(next).toHaveBeenNthCalledWith(2, 'gotResults');
    });

    it('should push last value to new subscriber', async () => {
      service.state$.next('checkingResults');

      await jest.runAllTimers();

      service.getState().subscribe({ next, error });

      await jest.runAllTimers();

      service.state$.next('gotResults');

      await jest.runAllTimers();

      expect(error).not.toBeCalled();
      expect(next).toBeCalledTimes(2);
      expect(next).toHaveBeenNthCalledWith(1, 'checkingResults');
      expect(next).toHaveBeenNthCalledWith(2, 'gotResults');
    });
  });

  describe('getCurrentQuestion', () => {
    it('should return stream to current question', async () => {
      service.getCurrentQuestion().subscribe({ next, error });

      await jest.runAllTimers();

      service.currentQuestion$.next(1 as any);
      service.currentQuestion$.next(2 as any);

      await jest.runAllTimers();

      expect(error).not.toBeCalled();
      expect(next).toBeCalledTimes(2);
      expect(next).toHaveBeenNthCalledWith(1, 1);
      expect(next).toHaveBeenNthCalledWith(2, 2);
    });

    it('should push last value to new subscriber', async () => {
      service.currentQuestion$.next(1 as any);

      await jest.runAllTimers();

      service.getCurrentQuestion().subscribe({ next, error });

      await jest.runAllTimers();

      service.currentQuestion$.next(2 as any);

      await jest.runAllTimers();

      expect(error).not.toBeCalled();
      expect(next).toBeCalledTimes(2);
      expect(next).toHaveBeenNthCalledWith(1, 1);
      expect(next).toHaveBeenNthCalledWith(2, 2);
    });
  });

  describe('getQuizee', () => {
    it('should return stream to current quizee', async () => {
      service.getQuizee().subscribe({ next, error });

      await jest.runAllTimers();

      service.quizee$.next(1 as any);
      service.quizee$.next(2 as any);

      await jest.runAllTimers();

      expect(error).not.toBeCalled();
      expect(next).toBeCalledTimes(2);
      expect(next).toHaveBeenNthCalledWith(1, 1);
      expect(next).toHaveBeenNthCalledWith(2, 2);
    });

    it('should push last value to new subscriber', async () => {
      service.quizee$.next(1 as any);

      await jest.runAllTimers();

      service.getQuizee().subscribe({ next, error });

      await jest.runAllTimers();

      service.quizee$.next(2 as any);

      await jest.runAllTimers();

      expect(error).not.toBeCalled();
      expect(next).toBeCalledTimes(2);
      expect(next).toHaveBeenNthCalledWith(1, 1);
      expect(next).toHaveBeenNthCalledWith(2, 2);
    });
  });

  describe('loadQuizee', () => {
    it('should update state on loading start', async () => {
      quizeeService.getQuizee.mockReturnValue(of());

      service.getState().subscribe({ next, error });

      await jest.runAllTimers();

      service.loadQuizee('1').subscribe();

      await jest.runAllTimers();

      expect(error).not.toBeCalled();
      expect(next).toBeCalledTimes(1);
      expect(next).toHaveBeenNthCalledWith(1, 'loadingQuizee');
    });

    it('should request quizee from quizee service', async () => {
      const getQuizee = quizeeService.getQuizee.mockReturnValue(of());

      service.loadQuizee('1').subscribe();

      await jest.runAllTimers();

      expect(getQuizee).toBeCalledTimes(1);
      expect(getQuizee).toBeCalledWith('1');
    });

    it('should push fetched quizee', async () => {
      const mockQuizee = {
        answers: [],
        info: { caption: '', id: '', img: '', questionsCount: 1 },
        questions: [{ answerOptions: [], caption: '', id: '', type: 'ONE_TRUE' }],
      } as Quiz;

      quizeeService.getQuizee.mockReturnValue(of(mockQuizee));

      service.getQuizee().subscribe({ next, error });

      await jest.runAllTimers();

      service.loadQuizee('1').subscribe();

      await jest.runAllTimers();

      expect(error).not.toBeCalled();
      expect(next).toBeCalledTimes(1);
      expect(next).toHaveBeenNthCalledWith(1, mockQuizee);
    });

    it('should not crash if quizee is falsy', async () => {
      quizeeService.getQuizee.mockReturnValue(of(null as any));

      service.loadQuizee('').subscribe({ next, error });

      await jest.runAllTimers();

      service.loadQuizee('1').subscribe();

      await jest.runAllTimers();

      expect(error).not.toBeCalled();
      expect(next).not.toBeCalled();
    });

    it('should push current question', async () => {
      const question = { answerOptions: [], caption: '', id: '', type: 'ONE_TRUE' };

      const mockQuizee = {
        answers: [],
        info: { caption: '', id: '', img: '', questionsCount: 1 },
        questions: [question],
      } as Quiz;

      quizeeService.getQuizee.mockReturnValue(of(mockQuizee));

      service.getCurrentQuestion().subscribe({ next, error });

      await jest.runAllTimers();

      service.loadQuizee('1').subscribe();

      await jest.runAllTimers();

      expect(error).not.toBeCalled();
      expect(next).toBeCalledTimes(1);
      expect(next).toHaveBeenNthCalledWith(1, question);
    });

    it('should update state on loading finish', async () => {
      quizeeService.getQuizee.mockReturnValue(
        of({
          answers: [],
          info: { caption: '', id: '', img: '', questionsCount: 1 },
          questions: [{ answerOptions: [], caption: '', id: '', type: 'ONE_TRUE' }],
        } as Quiz)
      );

      service.getState().subscribe({ next, error });

      await jest.runAllTimers();

      service.loadQuizee('1').subscribe();

      await jest.runAllTimers();

      expect(error).not.toBeCalled();
      expect(next).toBeCalledTimes(2);
      expect(next).toHaveBeenLastCalledWith('running');
    });

    it('should return quizee stream', async () => {
      const quizee1: Quiz = {
        answers: [],
        info: { caption: '', id: '1', img: '', questionsCount: 1 },
        questions: [{ answerOptions: [], caption: '', id: '', type: 'ONE_TRUE' }],
      };
      const quizee2: Quiz = {
        answers: [],
        info: { caption: '', id: '2', img: '', questionsCount: 1 },
        questions: [{ answerOptions: [], caption: '', id: '', type: 'ONE_TRUE' }],
      };

      quizeeService.getQuizee.mockReturnValue(of(quizee1));

      service.loadQuizee('1').subscribe({ next, error });
      service.quizee$.next(quizee2);

      await jest.runAllTimers();

      expect(error).not.toBeCalled();
      expect(next).toBeCalledTimes(2);
      expect(next).toHaveBeenNthCalledWith(1, quizee1);
      expect(next).toHaveBeenNthCalledWith(2, quizee2);
    });

    it('should push deep copy of quizee', async () => {
      const quizee: Quiz = {
        answers: [],
        info: { caption: '', id: '1', img: '', questionsCount: 1 },
        questions: [{ answerOptions: [], caption: '', id: '', type: 'ONE_TRUE' }],
      };

      quizeeService.getQuizee.mockReturnValue(of(quizee));

      service.loadQuizee('1').subscribe({ next, error });

      await jest.runAllTimers();

      quizee.questions.push('123' as any);

      expect(error).not.toBeCalled();
      expect(next).toBeCalledTimes(1);
      expect(next.mock.calls[0][0]).not.toEqual(quizee);
    });

    it('should push deep copy of current question', async () => {
      const quizee: Quiz = {
        answers: [],
        info: { caption: '', id: '1', img: '', questionsCount: 1 },
        questions: [{ answerOptions: [], caption: '', id: '', type: 'ONE_TRUE' }],
      };

      quizeeService.getQuizee.mockReturnValue(of(quizee));

      service.loadQuizee('1').subscribe();
      service.getCurrentQuestion().subscribe({ next, error });

      await jest.runAllTimers();

      quizee.questions[0].answerOptions.push('123' as any);

      expect(error).not.toBeCalled();
      expect(next).toBeCalledTimes(1);
      expect(next.mock.calls[0][0]).not.toEqual(quizee.questions[0]);
    });
  });

  describe('answer saving', () => {
    it('should save answer', async () => {
      service.saveAnswer(1 as any);
      expect(service.getSavedAnswer()).toBe(1);

      service.saveAnswer(2 as any);
      expect(service.getSavedAnswer()).toBe(2);
    });
  });

  describe('commitAnswer', () => {
    beforeEach(() => {
      quizeeService.checkAnswers.mockReturnValue(of());
    });

    it('should throw if quizee is not loaded', async () => {
      service.commitAnswer().subscribe({ next, error });

      await jest.runAllTimers();

      expect(next).not.toBeCalled();
      expect(error).toBeCalledTimes(1);
      expect(error).toBeCalledWith(new Error('Quizee is not loaded'));
    });

    it('should save saved answer if no provided', async () => {
      quizeeService.getQuizee.mockReturnValue(
        of({
          answers: [],
          info: { caption: '', id: '', img: '', questionsCount: 1 },
          questions: [{ answerOptions: [], caption: '', id: '', type: 'ONE_TRUE' }],
        } as Quiz)
      );

      service.loadQuizee('').subscribe();
      service.saveAnswer(['1']);
      service.commitAnswer().subscribe({ next, error });

      await jest.runAllTimers();

      expect(error).not.toBeCalled();
      expect(service.answers[0].answer).toEqual(['1']);
    });

    it('should save provide answer', async () => {
      quizeeService.getQuizee.mockReturnValue(
        of({
          answers: [],
          info: { caption: '', id: '', img: '', questionsCount: 1 },
          questions: [{ answerOptions: [], caption: '', id: '', type: 'ONE_TRUE' }],
        } as Quiz)
      );

      service.loadQuizee('').subscribe();
      service.saveAnswer(['1']);
      service.commitAnswer(['2']).subscribe({ next, error });

      await jest.runAllTimers();

      expect(error).not.toBeCalled();
      expect(service.answers[0].answer).toEqual(['2']);
    });

    it('should attach question id to answer', async () => {
      quizeeService.getQuizee.mockReturnValue(
        of({
          answers: [],
          info: { caption: '', id: '', img: '', questionsCount: 1 },
          questions: [{ answerOptions: [], caption: '', id: 'id1', type: 'ONE_TRUE' }],
        } as Quiz)
      );

      service.loadQuizee('').subscribe();
      service.commitAnswer(['1']).subscribe({ next, error });

      await jest.runAllTimers();

      expect(error).not.toBeCalled();
      expect(service.answers[0].answer).toEqual(['1']);
      expect(service.answers[0].answerTo).toEqual('id1');
    });

    it('should switch to the next question after answer commit', async () => {
      const secondQuestion = { answerOptions: [], caption: '', id: 'id2', type: 'ONE_TRUE' };

      quizeeService.getQuizee.mockReturnValue(
        of({
          answers: [],
          info: { caption: '', id: '', img: '', questionsCount: 2 },
          questions: [{ answerOptions: [], caption: '', id: 'id1', type: 'ONE_TRUE' }, secondQuestion],
        } as Quiz)
      );

      service.loadQuizee('').subscribe();
      service.getCurrentQuestion().subscribe({ next, error });
      service.commitAnswer(['1']).subscribe();

      await jest.runAllTimers();

      expect(error).not.toBeCalled();
      expect(next).toBeCalledTimes(2);
      expect(next).toHaveBeenLastCalledWith(secondQuestion);
    });

    it('should start answer checking if last question was answered', async () => {
      const checkAnswers = quizeeService.checkAnswers.mockReturnValue(of());

      quizeeService.getQuizee.mockReturnValue(
        of({
          answers: [],
          info: { caption: '', id: 'someQuizId', img: '', questionsCount: 1 },
          questions: [{ answerOptions: [], caption: '', id: 'id1', type: 'ONE_TRUE' }],
        } as Quiz)
      );

      service.loadQuizee('').subscribe();
      service.commitAnswer(['1']).subscribe();

      await jest.runAllTimers();

      expect(checkAnswers).toBeCalledTimes(1);
      expect(checkAnswers).toHaveBeenLastCalledWith({
        answers: [{ answerTo: 'id1', answer: ['1'] }],
        quizId: 'someQuizId',
      });
    });

    it('should update state when got results', async () => {
      quizeeService.checkAnswers.mockReturnValue(of(100));

      quizeeService.getQuizee.mockReturnValue(
        of({
          answers: [],
          info: { caption: '', id: 'someQuizId', img: '', questionsCount: 1 },
          questions: [{ answerOptions: [], caption: '', id: 'id1', type: 'ONE_TRUE' }],
        } as Quiz)
      );

      service.loadQuizee('').subscribe();
      service.commitAnswer(['1']).subscribe();
      service.state$.subscribe({ next, error });

      await jest.runAllTimers();

      expect(error).not.toBeCalled();
      expect(next).toBeCalledTimes(1);
      expect(next).toHaveBeenLastCalledWith('gotResults');
    });

    it('should push result when got', async () => {
      quizeeService.checkAnswers.mockReturnValue(of(100));

      quizeeService.getQuizee.mockReturnValue(
        of({
          answers: [],
          info: { caption: '', id: 'someQuizId', img: '', questionsCount: 1 },
          questions: [{ answerOptions: [], caption: '', id: 'id1', type: 'ONE_TRUE' }],
        } as Quiz)
      );

      service.loadQuizee('').subscribe();
      service.commitAnswer(['1']).subscribe();
      service.result$.subscribe({ next, error });

      await jest.runAllTimers();

      expect(error).not.toBeCalled();
      expect(next).toBeCalledTimes(1);
      expect(next).toHaveBeenLastCalledWith(100);
    });
  });
});
