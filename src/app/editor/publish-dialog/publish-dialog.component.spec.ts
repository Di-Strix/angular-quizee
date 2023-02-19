import { MatStepper } from '@angular/material/stepper';

import { Subject, of, throwError } from 'rxjs';
import { QuizeeService } from 'src/app/shared/services/quizee.service';

import { QuizeeEditingService } from '../quizee-editing.service';

import { PublishDialogComponent } from './publish-dialog.component';

jest.mock('src/app/shared/services/quizee.service');
jest.mock('../quizee-editing.service');
jest.mock('@angular/material/stepper');

describe('PublishDialogComponent', () => {
  let quizeeService: jest.MockedClass<typeof QuizeeService>['prototype'];
  let quizeeEditingService: jest.MockedClass<typeof QuizeeEditingService>['prototype'];
  let stepper: jest.MockedClass<typeof MatStepper>['prototype'];
  let component: PublishDialogComponent;

  beforeEach(async () => {
    quizeeService = new (QuizeeService as any)();
    quizeeEditingService = new QuizeeEditingService() as any;
    stepper = new (MatStepper as any)();

    component = new PublishDialogComponent(quizeeService, quizeeEditingService);
    component.stepper = stepper;

    quizeeEditingService.getQuizeeErrors.mockReturnValue(new Subject());
    quizeeEditingService.getQuizee.mockReturnValue(new Subject());
    quizeeService.publishQuizee.mockReturnValue(new Subject());

    stepper.selectedIndex = 0;
    stepper.next.mockImplementation(() => stepper.selectedIndex++);

    jest.useFakeTimers();
  });

  describe('onInit', () => {
    it('should fetch quizee errors', async () => {
      component.ngOnInit();

      await jest.runAllTimers();

      expect(quizeeEditingService.getQuizeeErrors).toBeCalledTimes(1);
    });

    it('should fallback to errors state if errors are present', async () => {
      jest.spyOn(console, 'error').mockImplementation(() => {});

      quizeeEditingService.getQuizeeErrors.mockReturnValue(of([{} as any]));

      component.ngOnInit();

      await jest.runAllTimers();

      expect(component.stepperState.validation.done).toBeFalsy();
      expect(component.stepperState.validation.error).toBeTruthy();
      expect(stepper.selectedIndex).toEqual(2);
    });

    it('should get quizee if no errors', async () => {
      quizeeEditingService.getQuizeeErrors.mockReturnValue(of([]));

      component.ngOnInit();

      await jest.runAllTimers();

      expect(quizeeEditingService.getQuizee).toBeCalledTimes(1);
    });

    it('should switch to the publish step when got quizee', async () => {
      quizeeEditingService.getQuizeeErrors.mockReturnValue(of([]));
      quizeeEditingService.getQuizee.mockReturnValue(of({} as any));

      component.ngOnInit();

      await jest.runAllTimers();

      expect(stepper.selectedIndex).toEqual(1);
    });

    it('should fallback if error occurred during upload', async () => {
      jest.spyOn(console, 'error').mockImplementation(() => {});

      quizeeEditingService.getQuizeeErrors.mockReturnValue(of([]));
      quizeeEditingService.getQuizee.mockReturnValue(of({} as any));
      quizeeService.publishQuizee.mockReturnValue(throwError(() => new Error('Mock error')));

      component.ngOnInit();

      await jest.runAllTimers();

      expect(component.stepperState.validation.done).toBeTruthy();
      expect(component.stepperState.validation.error).toBeFalsy();
      expect(component.stepperState.publish.done).toBeFalsy();
      expect(component.stepperState.publish.error).toBeTruthy();
      expect(stepper.selectedIndex).toEqual(2);
    });

    it('should switch to the final tep when published', async () => {
      const mockId = 'mockId';

      quizeeEditingService.getQuizeeErrors.mockReturnValue(of([]));
      quizeeEditingService.getQuizee.mockReturnValue(of({} as any));
      quizeeService.publishQuizee.mockReturnValue(of({ quizId: mockId }));

      component.ngOnInit();

      await jest.runAllTimers();

      expect(component.stepperState.publish.done).toBeTruthy();
      expect(component.stepperState.publish.error).toBeFalsy();
      expect(stepper.selectedIndex).toEqual(2);
      expect(component.quizeeId).toEqual(mockId);
    });
  });
});
