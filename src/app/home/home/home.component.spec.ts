import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouteConfigLoadEnd, RouteConfigLoadStart, Router } from '@angular/router';
import { QuizInfo } from '@di-strix/quizee-types';

import { Observable, Subject, of, throwError, timer } from 'rxjs';
import * as rxjs from 'rxjs';
import { QuizeeService } from 'src/app/shared/services/quizee.service';

import { HomeComponent } from './home.component';

jest.mock('@angular/material/snack-bar');
jest.mock('src/app/shared/services/quizee.service');
jest.mock('@angular/router', () => {
  return {
    ...jest.requireActual('@angular/router'),
    Router: class {},
  };
});
jest.mock('@angular/material/dialog');
jest.spyOn(rxjs, 'timer');

describe('HomeComponent', () => {
  let service: QuizeeService;
  let snackBar: MatSnackBar;
  let router: Router;
  let routerEvents: Subject<any>;
  let dialog: MatDialog;
  let component: HomeComponent;

  beforeEach(() => {
    service = new (QuizeeService as any)();
    snackBar = new (MatSnackBar as any)();

    router = new (Router as any)();
    routerEvents = new Subject();
    routerEvents = (router as any).events = new Subject();

    dialog = new (MatDialog as any)();
    component = new HomeComponent(service, snackBar, router, dialog);

    jest.useFakeTimers();
  });

  describe('init', () => {
    it('should call fetchQuizees on init', async () => {
      const fetchQuizees = jest.spyOn(component, 'fetchQuizees').mockImplementation(() => {});

      component.ngOnInit();

      await jest.runAllTimers();

      expect(fetchQuizees).toBeCalledTimes(1);
    });

    describe('router lazy-load events', () => {
      beforeEach(() => {
        jest.spyOn(component, 'fetchQuizees').mockImplementation(() => {});
      });

      it('should subscribe to router events', async () => {
        const subscribe = jest.spyOn(router.events, 'subscribe');

        component.ngOnInit();

        await jest.runAllTimers();

        expect(subscribe).toBeCalledTimes(1);
      });

      it('should open dialog on RouteConfigLoadStart for editor', async () => {
        component.ngOnInit();

        routerEvents.next(new RouteConfigLoadStart({ path: 'edit/acbdefg' }));
        await jest.runAllTimers();

        routerEvents.next(new RouteConfigLoadStart({ path: 'edit' }));
        await jest.runAllTimers();

        expect(dialog.open).toBeCalledTimes(2);
      });

      it('should open dialog on RouteConfigLoadStart for solver', async () => {
        component.ngOnInit();

        routerEvents.next(new RouteConfigLoadStart({ path: 'solve' }));
        await jest.runAllTimers();

        routerEvents.next(new RouteConfigLoadStart({ path: 'solve/acbdefg' }));
        await jest.runAllTimers();

        expect(dialog.open).toBeCalledTimes(2);
      });

      it('should open dialog with 500ms delay', async () => {
        component.ngOnInit();

        routerEvents.next(new RouteConfigLoadStart({ path: 'edit' }));

        expect(dialog.open).toBeCalledTimes(0);

        await jest.advanceTimersByTime(500);

        expect(dialog.open).toBeCalledTimes(1);
      });

      it('should close all dialogs on RouteConfigLoadEnd', async () => {
        component.ngOnInit();

        routerEvents.next(new RouteConfigLoadEnd({ path: 'edit' }));

        await jest.runAllTimers();

        expect(dialog.closeAll).toBeCalledTimes(1);
      });

      it('should do nothing if path is invalid ', async () => {
        component.ngOnInit();

        routerEvents.next(new RouteConfigLoadStart({}));
        await jest.runAllTimers();

        expect(dialog.closeAll).toBeCalledTimes(0);
        expect(dialog.open).toBeCalledTimes(0);
      });

      it('should unsubscribe from events on destroy', async () => {
        component.ngOnInit();

        component.ngOnDestroy();

        await jest.runAllTimers();

        expect(routerEvents.observed).toBeFalsy();
      });
    });
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
