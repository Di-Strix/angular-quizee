import * as _ from 'lodash';
import { QuizeeEditingService } from 'src/app/editor/quizee-editing.service';

import { SeveralTrueComponent } from './several-true.component';

describe('SeveralTrueComponent', () => {
  let component: SeveralTrueComponent;
  let service: QuizeeEditingService;

  beforeEach(() => {
    service = new QuizeeEditingService();
    component = new SeveralTrueComponent(service);

    jest.useFakeTimers();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call subscribeToUpdates', () => {
    const subscribeToUpdates = jest.spyOn(component, 'subscribeToUpdates');

    component.ngOnInit();

    expect(subscribeToUpdates).toBeCalledTimes(1);
  });

  describe('remove answer option', () => {
    it('should not remove answer option if it is the last one', async () => {
      const removeAnswerOption = jest.spyOn(service, 'removeAnswerOption');
      component.controls = [{ id: '1', control: {} as any }];
      component.removeAnswerOption('1');

      await jest.runAllTimers();

      expect(removeAnswerOption).not.toHaveBeenCalled();
    });

    it('should prompt service to remove answer option with provided id', async () => {
      const removeAnswerOption = jest.spyOn(service, 'removeAnswerOption');
      component.controls = [
        { id: '1', control: {} as any },
        { id: '2', control: {} as any },
      ];
      component.removeAnswerOption('1');

      await jest.runAllTimers();

      expect(removeAnswerOption).toHaveBeenCalledTimes(1);
      expect(removeAnswerOption).toHaveBeenCalledWith('1');
    });
  });

  describe('createAnswerOption', () => {
    it('should prompt service to create answer option', async () => {
      const addAnswerOption = jest.spyOn(service, 'addAnswerOption');
      component.createAnswerOption();

      await jest.runAllTimers();

      expect(addAnswerOption).toHaveBeenCalledTimes(1);
    });
  });

  describe('setAnswer', () => {
    it('should allow multiple correct answer', () => {
      component.setAnswer('1');
      component.setAnswer('2');
      component.setAnswer('3');

      expect(component.correctAnswers).toEqual(['1', '2', '3']);
    });

    it('should toggle correct answer ids', () => {
      component.setAnswer('1');
      component.setAnswer('2');
      component.setAnswer('3');

      component.setAnswer('1');

      expect(component.correctAnswers).toEqual(['2', '3']);
    });

    it('should push answer to service', () => {
      const setAnswer = jest.spyOn(service, 'setAnswer');

      component.setAnswer('1');
      component.setAnswer('2');
      component.setAnswer('3');

      expect(setAnswer).toBeCalledTimes(3);
      expect(setAnswer.mock.calls[2][0]).toEqual(['1', '2', '3']);
    });
  });
});
