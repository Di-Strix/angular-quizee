import { Subject, of } from 'rxjs';

import { QuizeeEditingService } from '../../quizee-editing.service';
import { QuizeeValidators } from '../../quizee-validators';

import { QuestionCaptionComponent } from './question-caption.component';

jest.mock('../../quizee-validators');

describe('QuestionCaptionComponent', () => {
  let component: QuestionCaptionComponent;
  let service: QuizeeEditingService;
  let forQuestion: jest.Mock;

  beforeEach(() => {
    forQuestion = jest.fn().mockReturnValue(() => of());
    (QuizeeValidators.forQuestion as jest.Mock).mockImplementation((...args: any[]) => forQuestion(...args));

    service = new QuizeeEditingService();
    component = new QuestionCaptionComponent(service);

    jest.useFakeTimers();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('onInit', () => {
    it('should not subscribe', async () => {
      jest.spyOn(service, 'getCurrentQuestion').mockReturnValue(of());
      jest.spyOn(service, 'getQuestion').mockReturnValue(of());
      component.ngOnInit();

      await jest.runAllTimers();

      expect(service.getCurrentQuestion).not.toBeCalled();
      expect(service.getQuestion).not.toBeCalled();
    });

    it('should mark input as touched', async () => {
      component.ngOnInit();

      await jest.runAllTimers();

      expect(component.questionCaption.touched).toBeTruthy();
    });
  });

  describe('onChanges', () => {
    it('should subscribe on question with provided index', async () => {
      const subject = new Subject();
      jest.spyOn(service, 'getQuestion').mockReturnValue(subject as any);

      component.questionIndex = 1;
      component.ngOnInit();
      component.ngOnChanges({});

      await jest.runAllTimers();

      expect(subject.observed).toBeTruthy();
    });

    it('should unsubscribe from previous question', async () => {
      const subject = new Subject();
      const getQuestion = jest.spyOn(service, 'getQuestion').mockReturnValue(subject as any);

      component.questionIndex = 1;
      component.ngOnInit();
      component.ngOnChanges({});

      await jest.runAllTimers();

      getQuestion.mockReset();
      getQuestion.mockReturnValue(of());

      component.questionIndex = 2;
      component.ngOnChanges({});

      await jest.runAllTimers();

      expect(subject.observed).toBeFalsy();
    });

    it('should subscribe to new question with provided index', async () => {
      const subject = new Subject();
      const getQuestion = jest.spyOn(service, 'getQuestion').mockReturnValue(of());

      component.questionIndex = 1;
      component.ngOnInit();
      component.ngOnChanges({});

      await jest.runAllTimers();

      getQuestion.mockReset();
      getQuestion.mockReturnValue(subject as any);

      component.questionIndex = 2;
      component.ngOnChanges({});

      await jest.runAllTimers();

      expect(subject.observed).toBeTruthy();
    });

    it('should not subscribe if provided index is negative', async () => {
      const subject1 = new Subject();
      const subject2 = new Subject();
      const getQuestion = jest.spyOn(service, 'getQuestion').mockReturnValue(subject1 as any);

      component.questionIndex = 1;
      component.ngOnInit();
      component.ngOnChanges({});

      await jest.runAllTimers();

      getQuestion.mockReset();
      getQuestion.mockReturnValue(subject2 as any);

      component.questionIndex = -1;
      component.ngOnChanges({});

      await jest.runAllTimers();

      expect(subject1.observed).toBeFalsy();
      expect(subject2.observed).toBeFalsy();
    });

    it('should clear async validators on question index change', async () => {
      jest.spyOn(service, 'getQuestion').mockReturnValue(of());
      const clearAsyncValidators = jest.spyOn(component.questionCaption, 'clearAsyncValidators');

      component.questionIndex = 1;
      component.ngOnInit();
      component.ngOnChanges({});

      await jest.runAllTimers();

      component.questionIndex = 0;
      component.ngOnChanges({});

      await jest.runAllTimers();

      expect(clearAsyncValidators).toBeCalled();
    });

    it('should clear async validators if new question index is negative', async () => {
      jest.spyOn(service, 'getQuestion').mockReturnValue(of());
      const clearAsyncValidators = jest.spyOn(component.questionCaption, 'clearAsyncValidators');

      component.questionIndex = 1;
      component.ngOnInit();
      component.ngOnChanges({});

      await jest.runAllTimers();

      component.questionIndex = -1;
      component.ngOnChanges({});

      await jest.runAllTimers();

      expect(clearAsyncValidators).toBeCalled();
    });

    it('should set async validators with validators for new question', async () => {
      jest.spyOn(service, 'getQuestion').mockReturnValue(of());
      const subject = new Subject();
      const validatorFn = jest.fn().mockReturnValue(subject);
      forQuestion.mockReturnValue(validatorFn);
      const setAsyncValidators = jest.spyOn(component.questionCaption, 'setAsyncValidators');

      component.questionIndex = 1;
      component.ngOnInit();
      component.ngOnChanges({});

      await jest.runAllTimers();

      expect(forQuestion.mock.calls[0][1]).toEqual(1);
      expect(setAsyncValidators).toBeCalledWith([validatorFn]);
    });

    it('should update validity after validators set', async () => {
      jest.spyOn(service, 'getQuestion').mockReturnValue(of());
      const updateValueAndValidity = jest.spyOn(component.questionCaption, 'updateValueAndValidity');

      component.questionIndex = 1;
      component.ngOnInit();
      component.ngOnChanges({});

      await jest.runAllTimers();

      expect(updateValueAndValidity).toBeCalledWith({ emitEvent: false });
    });
  });

  describe('input value change', () => {
    it('should update provided question on input value change', async () => {
      const getQuestion = jest.spyOn(service, 'getQuestion');
      getQuestion.mockReturnValue(of({ question: { caption: '' } } as any));

      const modifyQuestion = jest.spyOn(service, 'modifyQuestion');

      component.questionIndex = 1;
      component.ngOnInit();
      component.ngOnChanges({});

      await jest.runAllTimers();

      component.questionCaption.setValue('abc');

      await jest.runAllTimers();

      expect(modifyQuestion).toBeCalledTimes(1);
      expect(modifyQuestion).toBeCalledWith(1, { question: { caption: 'abc' } });
    });
  });

  describe('question caption value change', () => {
    it('should update input value if its value differs', async () => {
      const subject = new Subject();
      const getQuestion = jest.spyOn(service, 'getQuestion');
      getQuestion.mockReturnValue(subject as any);

      const setValue = jest.spyOn(component.questionCaption, 'setValue');

      component.questionIndex = 1;
      component.ngOnInit();
      component.ngOnChanges({});

      await jest.runAllTimers();

      subject.next({ question: { caption: 'abc' } });

      await jest.runAllTimers();

      subject.next({ question: { caption: 'abc123' } });

      await jest.runAllTimers();

      expect(setValue).toBeCalledTimes(2);
      expect(setValue).toHaveBeenNthCalledWith(1, 'abc');
      expect(setValue).toHaveBeenNthCalledWith(2, 'abc123');
    });

    it('should not update input value if it is the same', async () => {
      const subject = new Subject();
      const getQuestion = jest.spyOn(service, 'getQuestion');
      getQuestion.mockReturnValue(subject as any);

      const setValue = jest.spyOn(component.questionCaption, 'setValue');

      component.questionIndex = 1;
      component.ngOnInit();
      component.ngOnChanges({});

      await jest.runAllTimers();

      subject.next({ question: { caption: 'abc' } });

      await jest.runAllTimers();

      subject.next({ question: { caption: 'abc' } });

      await jest.runAllTimers();

      expect(setValue).toBeCalledTimes(1);
      expect(setValue).toHaveBeenNthCalledWith(1, 'abc');
    });
  });
});
