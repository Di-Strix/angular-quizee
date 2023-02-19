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

    jest.useFakeTimers();
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
    it('should subscribe to provided question', () => {
      const subject = new Subject();
      const getQuestion = jest.spyOn(service, 'getQuestion');
      getQuestion.mockReturnValue(subject as any);
      component.subscribeToUpdates(service, 1);

      expect(getQuestion).toBeCalledTimes(1);
      expect(getQuestion).toBeCalledWith(1);
      expect(subject.observed).toBeTruthy();
    });

    it('should not subscribe to provided question if index is negative', () => {
      const getQuestion = jest.spyOn(service, 'getQuestion');
      getQuestion.mockReturnValue(of());
      component.subscribeToUpdates(service, -1);

      expect(getQuestion).not.toBeCalled();
    });

    it('should create form controls for each answer option', () => {
      const ids = ['id1', 'id2', 'id3'];

      const getQuestion = jest.spyOn(service, 'getQuestion');
      getQuestion.mockReturnValue(
        of({
          answer: { answer: [], answerTo: 'question id', config: { equalCase: false } },
          question: {
            answerOptions: ids.map<AnswerOption>((id) => ({ id, value: 'id' })),
            caption: '',
            id: 'question id',
            type: 'SEVERAL_TRUE',
          },
          index: 0,
        } as QuestionPair)
      );

      component.subscribeToUpdates(service, 0);

      expect(component.controls.map(({ id }) => id)).toEqual(expect.arrayContaining(ids));
    });
    it('should update provided question on input value change', async () => {
      const ids = ['id1'];

      const getQuestion = jest.spyOn(service, 'getQuestion');
      getQuestion.mockReturnValue(
        of({
          answer: { answer: [], answerTo: 'question id', config: { equalCase: false } },
          question: {
            answerOptions: ids.map<AnswerOption>((id) => ({ id, value: 'id' })),
            caption: '',
            id: 'question id',
            type: 'SEVERAL_TRUE',
          },
          index: 0,
        } as QuestionPair)
      );

      const setAnswer = jest.spyOn(service, 'setAnswer');
      const setAnswerOptions = jest.spyOn(service, 'setAnswerOptions');

      component.subscribeToUpdates(service, 1);
      component.controls.find(({ id }) => id === 'id1')?.control.setValue('id1');

      await jest.runAllTimers();

      expect(setAnswer).toBeCalledTimes(0);
      expect(setAnswerOptions).toBeCalledTimes(1);
      expect(setAnswerOptions).toBeCalledWith(1, [{ id: 'id1', value: 'id1' }]);
    });

    describe('controls management', () => {
      let mockQuestionPair: QuestionPair;

      beforeEach(() => {
        mockQuestionPair = {
          answer: { answer: [], answerTo: 'question id', config: { equalCase: false } },
          question: {
            answerOptions: [],
            caption: '',
            id: 'question id',
            type: 'SEVERAL_TRUE',
          },
          index: 0,
        };
      });

      it('should not update controls if values are the same', async () => {
        mockQuestionPair.question.answerOptions = [{ id: 'some-unique-id', value: '1' }];

        const subject = new Subject();
        const getCurrentQuestion = jest.spyOn(service, 'getCurrentQuestion');
        getCurrentQuestion.mockReturnValue(subject as any);

        component.subscribeToUpdates(service, 1);
        subject.next(_.cloneDeep(mockQuestionPair));

        await jest.runAllTimers();

        const controls = _.cloneDeep(component.controls);
        subject.next(_.cloneDeep(mockQuestionPair));

        await jest.runAllTimers();

        expect(component.controls).toEqual(controls);
      });

      it('should only update controls that are dependent on changed answer options', async () => {
        mockQuestionPair.question.answerOptions = [
          { id: 'some-unique-id', value: '1' },
          { id: 'another-unique-id', value: '2' },
        ];

        const subject = new Subject();
        const getQuestion = jest.spyOn(service, 'getQuestion');
        getQuestion.mockReturnValue(subject as any);

        component.subscribeToUpdates(service, 1);
        subject.next(_.cloneDeep(mockQuestionPair));

        await jest.runAllTimers();

        const controls = component.controls.slice(0);
        const setValue1 = jest.spyOn(controls[0].control, 'setValue');
        const setValue2 = jest.spyOn(controls[1].control, 'setValue');

        mockQuestionPair.question.answerOptions[0].value = '2';
        subject.next(_.cloneDeep(mockQuestionPair));

        await jest.runAllTimers();

        expect(component.controls[0]).toBe(controls[0]);
        expect(component.controls[1]).toBe(controls[1]);
        expect(setValue1).toBeCalledTimes(1);
        expect(setValue2).not.toBeCalled();
      });
    });
  });

  describe('trackByControl', () => {
    it('should return control id', () => {
      expect(component.trackByControl(0, { id: '1', control: {} as any })).toBe('1');
    });
  });
});
