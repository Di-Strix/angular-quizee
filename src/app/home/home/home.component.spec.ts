import { MatSnackBar } from '@angular/material/snack-bar';
import { QuizInfo } from '@di-strix/quizee-types';

import { Observable, of, throwError, timer } from 'rxjs';
import * as rxjs from 'rxjs';
import { QuizeeService } from 'src/app/shared/services/quizee.service';

import { HomeComponent } from './home.component';

jest.mock('@angular/material/snack-bar');
jest.mock('src/app/shared/services/quizee.service');
jest.spyOn(rxjs, 'timer');

describe('HomeComponent', () => {
  let service: QuizeeService;
  let snackBar: MatSnackBar;
  let component: HomeComponent;

  beforeEach(() => {
    service = new (QuizeeService as any)();
    snackBar = new (MatSnackBar as any)();
    component = new HomeComponent(service, snackBar);

    jest.useFakeTimers();
  });

  it('should call fetchQuizees on init', async () => {
    const fetchQuizees = jest.spyOn(component, 'fetchQuizees').mockImplementation(() => {});

    component.ngOnInit();

    await jest.runAllTimers();

    expect(fetchQuizees).toBeCalledTimes(1);
  });

  describe('fetchQuizees', () => {
    it('should set quizees to fetched data', async () => {
      const mockQuizees = [{ a: 1 }, { b: 2 }];

      jest.spyOn(service, 'getQuizeeList').mockReturnValue(of(mockQuizees as any));
      component.fetchQuizees();

      await jest.runAllTimers();

      expect(component.quizees).toEqual(mockQuizees);
    });

    it(`should reset 'manualRetryRequired' state on call`, async () => {
      component.manualRetryRequired = true;

      jest.spyOn(service, 'getQuizeeList').mockReturnValue(of());
      component.fetchQuizees();

      await jest.runAllTimers();

      expect(component.manualRetryRequired).toBeFalsy();
    });

    it(`should set 'manualRetryRequired' on error`, async () => {
      component.manualRetryRequired = true;

      jest.spyOn(service, 'getQuizeeList').mockReturnValue(throwError(() => new Error('Mock error')));
      component.fetchQuizees();

      await jest.runAllTimers();

      expect(component.manualRetryRequired).toBeTruthy();
    });

    it('should retry five times on error with fibonacci sequenced delays', async () => {
      const handleSubscriber = jest.fn((subscriber) => {
        subscriber.error(new Error('Mock error'));
      });

      const observable = new Observable<QuizInfo[]>(handleSubscriber);

      jest.spyOn(service, 'getQuizeeList').mockReturnValue(observable);
      component.ngOnInit();

      await jest.runAllTimers();

      expect(handleSubscriber).toBeCalledTimes(6);
      expect(timer).toHaveBeenNthCalledWith(1, 1000);
      expect(timer).toHaveBeenNthCalledWith(2, 2000);
      expect(timer).toHaveBeenNthCalledWith(3, 3000);
      expect(timer).toHaveBeenNthCalledWith(4, 5000);
      expect(timer).toHaveBeenNthCalledWith(5, 8000);
    });
  });
});
