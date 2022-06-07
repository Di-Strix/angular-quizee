import { AnswerOption } from '@di-strix/quizee-types';

import * as _ from 'lodash';
import { Subject, of } from 'rxjs';
import { QuestionPair, QuizeeEditingService } from 'src/app/editor/quizee-editing.service';

import { SelectiveAnswersBase } from './selective-answers-base.component';

describe('SelectiveAnswersBaseComponent', () => {
  let component: SelectiveAnswersBase;
  let service: QuizeeEditingService;

  beforeEach(() => {
    service = new QuizeeEditingService();
    component = new (class extends SelectiveAnswersBase {})();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('assembleFunctions', () => {
    describe('assembleAnswers', () => {
      it('should work', () => {
        component.correctAnswers = ['id2'];
        const result = (component as any).assembleAnswers();

        expect(result).toEqual(['id2']);
      });
    });

    describe('assembleAnswerOptions', () => {
      it('should work', () => {
        component.controls = [
          { id: 'id1', control: { value: 'answerOption1' } as any },
          { id: 'id2', control: { value: 'answerOption2' } as any },
        ];
        const result = (component as any).assembleAnswerOptions();

        expect(result).toEqual([
          { id: 'id1', value: 'answerOption1' },
          { id: 'id2', value: 'answerOption2' },
        ]);
      });
    });
  });

  describe('subscribeToUpdates', () => {
    it('should subscribe to current question', () => {
      const getCurrentQuestion = jest.spyOn(service, 'getCurrentQuestion');
      getCurrentQuestion.mockReturnValue(of());
      component.subscribeToUpdates(service);

      expect(service.getCurrentQuestion).toHaveBeenCalled();
    });

    it('should create form controls for each answer option', () => {
      const ids = ['id1', 'id2', 'id3'];

      const getCurrentQuestion = jest.spyOn(service, 'getCurrentQuestion');
      getCurrentQuestion.mockReturnValue(
        of({
          answer: { answer: [], answerTo: 'question id', config: { equalCase: false } },
          question: {
            answerOptions: ids.map<AnswerOption>((id) => ({ id, value: 'id' })),
            caption: '',
            id: 'question id',
            type: 'SEVERAL_TRUE',
          },
        } as QuestionPair)
      );

      component.subscribeToUpdates(service);

      expect(component.controls.map(({ id }) => id)).toEqual(expect.arrayContaining(ids));
    });
    it('should update quizee on input value change', () => {
      jest.useFakeTimers();

      const ids = ['id1'];

      const getCurrentQuestion = jest.spyOn(service, 'getCurrentQuestion');
      getCurrentQuestion.mockReturnValue(
        of({
          answer: { answer: [], answerTo: 'question id', config: { equalCase: false } },
          question: {
            answerOptions: ids.map<AnswerOption>((id) => ({ id, value: 'id' })),
            caption: '',
            id: 'question id',
            type: 'SEVERAL_TRUE',
          },
        } as QuestionPair)
      );

      const setAnswer = jest.spyOn(service, 'setAnswer');
      const setAnswerOptions = jest.spyOn(service, 'setAnswerOptions');

      component.subscribeToUpdates(service);
      component.controls.find(({ id }) => id === 'id1')?.control.setValue('id1');

      jest.runAllTimers();

      expect(setAnswer).toHaveBeenCalledTimes(0);
      expect(setAnswerOptions).toHaveBeenCalledTimes(1);

      expect(setAnswerOptions.mock.calls[0][0]).toEqual([{ id: 'id1', value: 'id1' }]);
    });

    describe('controls management', () => {
      let mockQuestionPair: QuestionPair;

      beforeEach(() => {
        jest.useFakeTimers();

        mockQuestionPair = {
          answer: { answer: [], answerTo: 'question id', config: { equalCase: false } },
          question: {
            answerOptions: [],
            caption: '',
            id: 'question id',
            type: 'SEVERAL_TRUE',
          },
        };
      });

      it('should not update controls if values are the same', () => {
        mockQuestionPair.question.answerOptions = [{ id: 'some-unique-id', value: '1' }];

        const subject = new Subject();
        const getCurrentQuestion = jest.spyOn(service, 'getCurrentQuestion');
        getCurrentQuestion.mockReturnValue(subject as any);

        component.subscribeToUpdates(service);
        subject.next(_.cloneDeep(mockQuestionPair));

        jest.runAllTimers();

        const controls = _.cloneDeep(component.controls);
        subject.next(_.cloneDeep(mockQuestionPair));

        jest.runAllTimers();

        expect(component.controls).toEqual(controls);
      });

      it('should only update controls that are dependent on changed answer options', () => {
        mockQuestionPair.question.answerOptions = [
          { id: 'some-unique-id', value: '1' },
          { id: 'another-unique-id', value: '2' },
        ];

        const subject = new Subject();
        const getCurrentQuestion = jest.spyOn(service, 'getCurrentQuestion');
        getCurrentQuestion.mockReturnValue(subject as any);

        component.subscribeToUpdates(service);
        subject.next(_.cloneDeep(mockQuestionPair));

        jest.runAllTimers();

        const controls = _.cloneDeep(component.controls);
        mockQuestionPair.question.answerOptions[0].value = '2';
        subject.next(_.cloneDeep(mockQuestionPair));

        jest.runAllTimers();

        expect(component.controls[0]).not.toEqual(controls[0]);
        expect(component.controls[1]).toEqual(controls[1]);
      });
    });
  });

  describe('trackByControl', () => {
    it('should return control id', () => {
      expect(component.trackByControl(0, { id: '1', control: {} as any })).toBe('1');
    });
  });
});
