import * as _ from 'lodash';
import { Subject, of } from 'rxjs';

import { QuestionPair, QuizeeEditingService } from '../../quizee-editing.service';

import { AnswerInputComponent } from './answer-input.component';

describe('AnswerInputComponent', () => {
  let component: AnswerInputComponent;
  let service: QuizeeEditingService;

  beforeEach(() => {
    service = new QuizeeEditingService();
    component = new AnswerInputComponent(service);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should subscribe to current question', () => {
    const getCurrentQuestion = jest.spyOn(service, 'getCurrentQuestion');
    getCurrentQuestion.mockReturnValue(of());
    component.ngOnInit();

    expect(service.getCurrentQuestion).toHaveBeenCalled();
  });

  describe('answer', () => {
    describe('input value change', () => {
      it('should update quizee on input value change', () => {
        jest.useFakeTimers();

        const getCurrentQuestion = jest.spyOn(service, 'getCurrentQuestion');
        getCurrentQuestion.mockReturnValue(
          of({
            answer: { answer: [], answerTo: 'question id', config: { equalCase: false } },
            question: {
              answerOptions: [],
              caption: '',
              id: 'question id',
              type: 'WRITE_ANSWER',
            },
          } as QuestionPair)
        );

        const setAnswer = jest.spyOn(service, 'setAnswer');

        component.ngOnInit();
        component.answer.setValue('Some correct answer');

        jest.runAllTimers();

        expect(setAnswer).toHaveBeenCalledTimes(1);
        expect(setAnswer.mock.calls[0][0]).toEqual(['Some correct answer']);
      });
    });

    describe('form update event filtering', () => {
      let mockQuestionPair: QuestionPair;

      beforeEach(() => {
        jest.useFakeTimers();

        mockQuestionPair = {
          answer: { answer: [], answerTo: 'question id', config: { equalCase: false } },
          question: {
            answerOptions: [],
            caption: '',
            id: 'question id',
            type: 'WRITE_ANSWER',
          },
        };
      });

      it('should update form if answer changed', () => {
        mockQuestionPair.answer.answer = ['some value'];

        const subject = new Subject();
        const getCurrentQuestion = jest.spyOn(service, 'getCurrentQuestion');
        getCurrentQuestion.mockReturnValue(subject as any);

        component.ngOnInit();
        subject.next(_.cloneDeep(mockQuestionPair));

        jest.runAllTimers();

        expect(component.answer.value).toBe('some value');
        mockQuestionPair.answer.answer = ['some another value'];
        subject.next(_.cloneDeep(mockQuestionPair));

        jest.runAllTimers();

        expect(component.answer.value).toBe('some another value');
      });

      it('should not update form if value is the same', () => {
        mockQuestionPair.answer.answer = ['val'];

        const subject = new Subject();
        const getCurrentQuestion = jest.spyOn(service, 'getCurrentQuestion');
        getCurrentQuestion.mockReturnValue(subject as any);

        component.ngOnInit();
        subject.next(_.cloneDeep(mockQuestionPair));

        jest.runAllTimers();

        const setValue = jest.spyOn(component.answer, 'setValue');
        subject.next(_.cloneDeep(mockQuestionPair));

        expect(setValue).not.toHaveBeenCalled();
      });
    });
  });

  describe('config', () => {
    describe('config change', () => {
      it('should update quizee on config change', () => {
        jest.useFakeTimers();

        const getCurrentQuestion = jest.spyOn(service, 'getCurrentQuestion');
        getCurrentQuestion.mockReturnValue(
          of({
            answer: { answer: [], answerTo: 'question id', config: { equalCase: false } },
            question: {
              answerOptions: [],
              caption: '',
              id: 'question id',
              type: 'WRITE_ANSWER',
            },
          } as QuestionPair)
        );

        const setAnswerConfig = jest.spyOn(service, 'setAnswerConfig');

        component.ngOnInit();
        component.config.get('equalCase')?.setValue(true);

        jest.runAllTimers();

        expect(setAnswerConfig).toHaveBeenCalledTimes(1);
        expect(setAnswerConfig.mock.calls[0][0].equalCase).toEqual(true);
      });
    });

    describe('form update event filtering', () => {
      let mockQuestionPair: QuestionPair;

      beforeEach(() => {
        jest.useFakeTimers();

        mockQuestionPair = {
          answer: { answer: [], answerTo: 'question id', config: { equalCase: false } },
          question: {
            answerOptions: [],
            caption: '',
            id: 'question id',
            type: 'WRITE_ANSWER',
          },
        };
      });

      it('should update form if related config changed', () => {
        mockQuestionPair.answer.config.equalCase = true;
        const subject = new Subject();
        const getCurrentQuestion = jest.spyOn(service, 'getCurrentQuestion');
        getCurrentQuestion.mockReturnValue(subject as any);

        component.ngOnInit();
        subject.next(_.cloneDeep(mockQuestionPair));

        jest.runAllTimers();

        expect(component.config.value.equalCase).toBe(true);
        mockQuestionPair.answer.config.equalCase = false;
        subject.next(_.cloneDeep(mockQuestionPair));

        jest.runAllTimers();

        expect(component.config.value.equalCase).toBe(false);
      });

      it('should not update form if value is the same', () => {
        mockQuestionPair.answer.config.equalCase = true;

        const subject = new Subject();
        const getCurrentQuestion = jest.spyOn(service, 'getCurrentQuestion');
        getCurrentQuestion.mockReturnValue(subject as any);

        component.ngOnInit();
        subject.next(_.cloneDeep(mockQuestionPair));

        jest.runAllTimers();

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
