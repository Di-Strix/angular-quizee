import { Question } from '@di-strix/quizee-types';

import { FakePlayerService } from './fake-player.service';

describe('FakePlayerService', () => {
  let service: FakePlayerService;

  beforeEach(() => {
    service = new FakePlayerService();

    jest.useFakeTimers();
  });

  describe('construction', () => {
    it('should create and assign mock quiz', async () => {
      expect(service.quizee).toEqual({ questions: [], info: { caption: '', img: '', questionsCount: 0, id: '' } });
    });
  });

  describe('loadQuestion', () => {
    it('should create mock quiz with provided question', async () => {
      const loadQuizee = jest.spyOn(service, 'loadQuizee');

      const question: Question = { answerOptions: [], caption: '', id: '', type: 'ONE_TRUE' };

      service.loadQuestion(question);

      expect(service.quizee).toEqual({
        questions: [{ answerOptions: [], caption: '', id: '', type: 'ONE_TRUE' }],
        info: { caption: '', img: '', questionsCount: 1, id: '' },
      });
      expect(loadQuizee).toBeCalledTimes(1);
      expect(loadQuizee).toBeCalledWith('');
    });
  });

  describe('commitAnswer', () => {
    it('should return empty stream', async () => {
      let next = jest.fn();
      let error = jest.fn();
      let complete = jest.fn();

      service.commitAnswer().subscribe({ complete, error, next });

      await jest.runAllTimers();

      expect(next).not.toBeCalled();
      expect(error).not.toBeCalled();
      expect(complete).toBeCalled();
    });
  });
});
