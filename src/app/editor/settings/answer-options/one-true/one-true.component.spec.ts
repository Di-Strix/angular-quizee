import * as _ from 'lodash';
import { Subject } from 'rxjs';
import { QuizeeEditingService } from 'src/app/editor/quizee-editing.service';

import { OneTrueComponent } from './one-true.component';

describe('OneTrueComponent', () => {
  let component: OneTrueComponent;
  let service: QuizeeEditingService;

  beforeEach(() => {
    service = new QuizeeEditingService();
    component = new OneTrueComponent(service);

    jest.useFakeTimers();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('onChanges', () => {
    it('should call `subscribeToUpdates` with provided question index', () => {
      const subscribeToUpdates = jest.spyOn(component, 'subscribeToUpdates');

      component.questionIndex = 1;
      component.ngOnChanges({});

      expect(subscribeToUpdates).toBeCalledTimes(1);
      expect(subscribeToUpdates).toBeCalledWith(service, 1);
    });

    it('should not call `subscribeToUpdates` if question index is negative', () => {
      const subscribeToUpdates = jest.spyOn(component, 'subscribeToUpdates');

      component.questionIndex = -1;
      component.ngOnChanges({});

      expect(subscribeToUpdates).not.toBeCalled();
    });

    it('should unsubscribe if question index is negative', async () => {
      const subject = new Subject();
      const subscribeToUpdates = jest.spyOn(component, 'subscribeToUpdates').mockReturnValue(subject as any);

      component.questionIndex = 1;
      component.ngOnChanges({});

      await jest.runAllTimers();
      subscribeToUpdates.mockReset();

      component.questionIndex = -1;
      component.ngOnChanges({});

      expect(subject.observed).toBeFalsy();
    });

    it('should unsubscribe from previous subscription', async () => {
      const subject = new Subject();
      const subscribeToUpdates = jest.spyOn(component, 'subscribeToUpdates').mockReturnValue(subject as any);

      component.ngOnChanges({});

      await jest.runAllTimers();
      subscribeToUpdates.mockReset();

      component.ngOnChanges({});

      expect(subject.observed).toBeFalsy();
    });
  });

  describe('remove answer option', () => {
    it('should not remove answer option if it is the last one', async () => {
      const removeAnswerOption = jest.spyOn(service, 'removeAnswerOption');
      component.controls = [{ id: '1', control: {} as any }];
      component.removeAnswerOption('1');

      await jest.runAllTimers();

      expect(removeAnswerOption).not.toHaveBeenCalled();
    });

    it('should prompt service to remove answer option with provided id in provided question', async () => {
      const removeAnswerOption = jest.spyOn(service, 'removeAnswerOption');
      component.controls = [
        { id: '1', control: {} as any },
        { id: '2', control: {} as any },
      ];

      component.questionIndex = 1;
      component.ngOnChanges({});

      await jest.runAllTimers();

      component.removeAnswerOption('1');

      await jest.runAllTimers();

      expect(removeAnswerOption).toBeCalledTimes(1);
      expect(removeAnswerOption).toBeCalledWith(1, '1');
    });
  });

  describe('createAnswerOption', () => {
    it('should prompt service to create answer option for provided question', async () => {
      const addAnswerOption = jest.spyOn(service, 'addAnswerOption');

      component.questionIndex = 1;
      component.ngOnChanges({});

      await jest.runAllTimers();

      component.createAnswerOption();

      await jest.runAllTimers();

      expect(addAnswerOption).toBeCalledTimes(1);
      expect(addAnswerOption).toBeCalledWith(1);
    });
  });

  describe('setAnswer', () => {
    it('should allow only one correct answer', async () => {
      component.setAnswer('1');
      component.setAnswer('2');
      component.setAnswer('3');

      await jest.runAllTimers();

      expect(component.correctAnswers).toEqual(['3']);
    });

    it('should push answer to service', async () => {
      const setAnswer = jest.spyOn(service, 'setAnswer');

      component.questionIndex = 1;
      component.ngOnChanges({});

      await jest.runAllTimers();

      component.setAnswer('1');

      await jest.runAllTimers();

      expect(setAnswer).toBeCalledTimes(1);
      expect(setAnswer).toBeCalledWith(1, ['1']);
    });
  });
});
