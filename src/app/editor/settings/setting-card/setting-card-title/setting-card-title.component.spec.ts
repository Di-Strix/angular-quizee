import { Subject } from 'rxjs';
import { QuizeeEditingService } from 'src/app/editor/quizee-editing.service';
import { QuizeeValidators } from 'src/app/editor/quizee-validators';

import { SettingCardTitleComponent } from './setting-card-title.component';

describe('SettingCardTitleComponent', () => {
  let component: SettingCardTitleComponent;
  let service: QuizeeEditingService;
  let forQuizee: jest.Mock;
  let forCurrentQuestion: jest.Mock;
  let forQuestion: jest.Mock;

  beforeEach(() => {
    forQuizee = jest.fn().mockReturnValue(() => new Subject());
    forCurrentQuestion = jest.fn().mockReturnValue(() => new Subject());
    forQuestion = jest.fn().mockReturnValue(() => new Subject());

    QuizeeValidators.forQuizee = forQuizee;
    QuizeeValidators.forCurrentQuestion = forCurrentQuestion;
    QuizeeValidators.forQuestion = forQuestion;

    service = new QuizeeEditingService();
    component = new SettingCardTitleComponent(service);

    jest.useFakeTimers();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('forQuizee', () => {
    it('should subscribe to quizee errors if checkErrors is "forQuizee"', async () => {
      const subject = new Subject();
      forQuizee.mockReturnValue(() => subject);

      component.checkErrors = 'forQuizee';
      component.path = 'path';

      component.ngOnChanges({});

      await jest.runAllTimers();

      expect(forQuizee).toBeCalledTimes(1);
      expect(forQuizee).toBeCalledWith(service, component.path, false);
      expect(subject.observed).toBeTruthy();
      expect(forCurrentQuestion).not.toBeCalled();
      expect(forQuestion).not.toBeCalled();
    });

    it('should cancel previous subscription', async () => {
      const subject = new Subject();
      forQuizee.mockReturnValue(() => subject);

      component.checkErrors = 'forQuizee';
      component.path = 'path';

      component.ngOnChanges({});

      await jest.runAllTimers();

      forQuizee.mockReturnValue(() => new Subject());
      component.ngOnChanges({});

      await jest.runAllTimers();

      expect(subject.observed).toBeFalsy();
    });

    it('should throw if path is not specified', () => {
      component.checkErrors = 'forQuizee';

      expect(() => component.ngOnChanges({})).toThrow();
    });
  });

  describe('forCurrentQuestion', () => {
    it('should subscribe to current question errors if checkErrors is "forQuestion" and questionIndex is -1', async () => {
      const subject = new Subject();
      forCurrentQuestion.mockReturnValue(() => subject);

      component.checkErrors = 'forQuestion';
      component.path = 'path';

      component.ngOnChanges({});

      await jest.runAllTimers();

      expect(forCurrentQuestion).toBeCalledTimes(1);
      expect(forCurrentQuestion).toBeCalledWith(service, component.path, false);
      expect(subject.observed).toBeTruthy();
      expect(forQuizee).not.toBeCalled();
      expect(forQuestion).not.toBeCalled();
    });

    it('should cancel previous subscription', async () => {
      const subject = new Subject();
      forCurrentQuestion.mockReturnValue(() => subject);

      component.checkErrors = 'forQuestion';
      component.path = 'path';

      component.ngOnChanges({});

      await jest.runAllTimers();

      forCurrentQuestion.mockReturnValue(() => new Subject());
      component.ngOnChanges({});

      await jest.runAllTimers();

      expect(subject.observed).toBeFalsy();
    });

    it('should throw if path is not specified', () => {
      component.checkErrors = 'forQuestion';

      expect(() => component.ngOnChanges({})).toThrow();
    });
  });

  describe('forQuestion', () => {
    it('should subscribe to specified question errors if checkErrors is "forQuestion" and questionIndex is set', async () => {
      const subject = new Subject();
      forQuestion.mockReturnValue(() => subject);

      component.checkErrors = 'forQuestion';
      component.path = 'path';
      component.questionIndex = 2;

      component.ngOnChanges({});

      await jest.runAllTimers();

      expect(forQuestion).toBeCalledTimes(1);
      expect(forQuestion).toBeCalledWith(service, 2, component.path, false);
      expect(subject.observed).toBeTruthy();
      expect(forCurrentQuestion).not.toBeCalled();
      expect(forQuizee).not.toBeCalled();
    });

    it('should cancel previous subscription', async () => {
      const subject = new Subject();
      forQuestion.mockReturnValue(() => subject);

      component.checkErrors = 'forQuestion';
      component.path = 'path';
      component.questionIndex = 2;

      component.ngOnChanges({});

      await jest.runAllTimers();

      forQuestion.mockReturnValue(() => new Subject());
      component.ngOnChanges({});

      await jest.runAllTimers();

      expect(subject.observed).toBeFalsy();
    });

    it('should throw if path is not specified', () => {
      component.checkErrors = 'forQuestion';
      component.questionIndex = 1;

      expect(() => component.ngOnChanges({})).toThrow();
    });
  });

  it('should set error depending on pushed value', async () => {
    const subject = new Subject();
    const forCurrentQuestion = jest.fn().mockReturnValue(() => subject);

    QuizeeValidators.forCurrentQuestion = forCurrentQuestion;

    component.checkErrors = 'forQuestion';
    component.path = 'answer.path';

    component.ngOnChanges({});
    subject.next({});

    await jest.runAllTimers();

    expect(component.error).toBeTruthy();

    subject.next(null);

    await jest.runAllTimers();

    expect(component.error).toBeFalsy();
  });
});
