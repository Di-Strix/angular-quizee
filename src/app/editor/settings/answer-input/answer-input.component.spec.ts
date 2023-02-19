import * as _ from 'lodash';
import { Subject, of } from 'rxjs';

import { QuestionPair, QuizeeEditingService } from '../../quizee-editing.service';
import { QuizeeValidators } from '../../quizee-validators';

import { AnswerInputComponent } from './answer-input.component';

jest.mock('../../quizee-validators');

describe('AnswerInputComponent', () => {
  let component: AnswerInputComponent;
  let service: QuizeeEditingService;
  let forQuestion: jest.Mock;

  beforeEach(() => {
    forQuestion = jest.fn().mockReturnValue(() => of());
    (QuizeeValidators.forQuestion as jest.Mock).mockImplementation((...args: any[]) => forQuestion(...args));

    service = new QuizeeEditingService();
    component = new AnswerInputComponent(service);

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

      expect(component.answer.touched).toBeTruthy();
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
      const clearAsyncValidators = jest.spyOn(component.answer, 'clearAsyncValidators');

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
      const clearAsyncValidators = jest.spyOn(component.answer, 'clearAsyncValidators');

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
      const setAsyncValidators = jest.spyOn(component.answer, 'setAsyncValidators');

      component.questionIndex = 1;
      component.ngOnInit();
      component.ngOnChanges({});

      await jest.runAllTimers();

      expect(forQuestion.mock.calls[0][1]).toEqual(1);
      expect(setAsyncValidators).toBeCalledWith([validatorFn]);
    });

    it('should update validity after validators set', async () => {
      jest.spyOn(service, 'getQuestion').mockReturnValue(of());
      const updateValueAndValidity = jest.spyOn(component.answer, 'updateValueAndValidity');

      component.questionIndex = 1;
      component.ngOnInit();
      component.ngOnChanges({});

      await jest.runAllTimers();

      expect(updateValueAndValidity).toBeCalledWith({ emitEvent: false });
    });
  });

  describe('answer', () => {
    describe('input value change', () => {
      it('should update specified question on input value change', async () => {
        const getQuestion = jest.spyOn(service, 'getQuestion');
        getQuestion.mockReturnValue(
          of({
            answer: { answer: [], answerTo: 'question id', config: { equalCase: false } },
            question: {
              answerOptions: [],
              caption: '',
              id: 'question id',
              type: 'WRITE_ANSWER',
            },
            index: 1,
          } as QuestionPair)
        );

        const setAnswer = jest.spyOn(service, 'setAnswer');

        component.questionIndex = 1;
        component.ngOnInit();
        component.ngOnChanges({});

        await jest.runAllTimers();

        component.questionIndex = 2;
        component.ngOnChanges({});

        await jest.runAllTimers();

        component.answer.setValue('Some correct answer');

        await jest.runAllTimers();

        expect(setAnswer).toBeCalledTimes(1);
        expect(setAnswer).toBeCalledWith(2, ['Some correct answer']);
      });
    });

    describe('form update event filtering', () => {
      let mockQuestionPair: QuestionPair;

      beforeEach(() => {
        mockQuestionPair = {
          answer: { answer: [], answerTo: 'question id', config: { equalCase: false } },
          question: {
            answerOptions: [],
            caption: '',
            id: 'question id',
            type: 'WRITE_ANSWER',
          },
          index: 0,
        };
      });

      it('should update form if answer changed', async () => {
        mockQuestionPair.answer.answer = ['some value'];

        const subject = new Subject();
        const getQuestion = jest.spyOn(service, 'getQuestion');
        getQuestion.mockReturnValue(subject as any);

        component.questionIndex = 1;
        component.ngOnInit();
        component.ngOnChanges({});
        subject.next(_.cloneDeep(mockQuestionPair));

        await jest.runAllTimers();

        expect(component.answer.value).toBe('some value');
        mockQuestionPair.answer.answer = ['some another value'];
        subject.next(_.cloneDeep(mockQuestionPair));

        await jest.runAllTimers();

        expect(component.answer.value).toBe('some another value');
      });

      it('should not update form if value is the same', async () => {
        mockQuestionPair.answer.answer = ['val'];

        const subject = new Subject();
        const getQuestion = jest.spyOn(service, 'getQuestion');
        getQuestion.mockReturnValue(subject as any);

        component.ngOnInit();
        component.ngOnChanges({});
        subject.next(_.cloneDeep(mockQuestionPair));

        await jest.runAllTimers();

        const setValue = jest.spyOn(component.answer, 'setValue');
        subject.next(_.cloneDeep(mockQuestionPair));

        expect(setValue).not.toBeCalled();
      });
    });
  });

  describe('config', () => {
    describe('config change', () => {
      it('should update specified question on config change', async () => {
        const getQuestion = jest.spyOn(service, 'getQuestion');
        getQuestion.mockReturnValue(
          of({
            answer: { answer: [], answerTo: 'question id', config: { equalCase: false } },
            question: {
              answerOptions: [],
              caption: '',
              id: 'question id',
              type: 'WRITE_ANSWER',
            },
            index: 0,
          } as QuestionPair)
        );

        const setAnswerConfig = jest.spyOn(service, 'setAnswerConfig');

        component.questionIndex = 1;
        component.ngOnInit();
        component.ngOnChanges({});

        await jest.runAllTimers();

        component.questionIndex = 2;
        component.ngOnChanges({});

        await jest.runAllTimers();

        component.config.get('equalCase')?.setValue(true);

        await jest.runAllTimers();

        expect(setAnswerConfig).toBeCalledTimes(1);
        expect(setAnswerConfig.mock.calls[0][1].equalCase).toEqual(true);
      });
    });

    describe('form update event filtering', () => {
      let mockQuestionPair: QuestionPair;

      beforeEach(() => {
        mockQuestionPair = {
          answer: { answer: [], answerTo: 'question id', config: { equalCase: false } },
          question: {
            answerOptions: [],
            caption: '',
            id: 'question id',
            type: 'WRITE_ANSWER',
          },
          index: 0,
        };
      });

      it('should update form if related config changed', async () => {
        mockQuestionPair.answer.config.equalCase = true;
        const subject = new Subject();
        const getQuestion = jest.spyOn(service, 'getQuestion');
        getQuestion.mockReturnValue(subject as any);

        component.questionIndex = 1;
        component.ngOnInit();
        component.ngOnChanges({});
        subject.next(_.cloneDeep(mockQuestionPair));

        await jest.runAllTimers();

        expect(component.config.value.equalCase).toBe(true);
        mockQuestionPair.answer.config.equalCase = false;
        subject.next(_.cloneDeep(mockQuestionPair));

        await jest.runAllTimers();

        expect(component.config.value.equalCase).toBe(false);
      });

      it('should not update form if value is the same', async () => {
        mockQuestionPair.answer.config.equalCase = true;

        const subject = new Subject();
        const getQuestion = jest.spyOn(service, 'getQuestion');
        getQuestion.mockReturnValue(subject as any);

        component.questionIndex = 1;
        component.ngOnInit();
        component.ngOnChanges({});
        subject.next(_.cloneDeep(mockQuestionPair));

        await jest.runAllTimers();

        const setValue = jest.spyOn(component.config, 'setValue');
        subject.next(_.cloneDeep(mockQuestionPair));

        expect(setValue).not.toHaveBeenCalled();
      });
    });
  });

  describe('onDestroy', () => {
    it('should unsubscribe', () => {
      const unsubscribe = jest.spyOn(component.subs, 'unsubscribe');

      component.ngOnDestroy();

      expect(unsubscribe).toBeCalledTimes(1);
    });
  });
});
