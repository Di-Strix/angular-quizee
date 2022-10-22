import { ActivatedRoute, Router } from '@angular/router';

import { Subject, of, throwError } from 'rxjs';

import { PlayerComponent } from './player.component';
import { PlayerService } from './player.service';

jest.mock('@angular/router');
jest.mock('./player.service');

describe('PlayerComponent', () => {
  let playerService: jest.MockedClass<typeof PlayerService>['prototype'];
  let activatedRoute: jest.MockedClass<typeof ActivatedRoute>['prototype'];
  let router: jest.MockedClass<typeof Router>['prototype'];
  let component: PlayerComponent;

  beforeEach(async () => {
    playerService = new (PlayerService as any)();
    activatedRoute = new (ActivatedRoute as any)();
    router = new (Router as any)();

    component = new PlayerComponent(playerService, activatedRoute, router);

    jest.useFakeTimers();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('onInit', () => {
    it('should subscribe to paramMap', async () => {
      const subject = new Subject();
      (activatedRoute as any).paramMap = subject;

      component.ngOnInit();

      await jest.runAllTimers();

      expect(subject.observed).toBeTruthy();
    });

    it('should get id from paramMap', async () => {
      playerService.loadQuizee.mockReturnValue(of());
      const get = jest.fn();

      const subject = new Subject();
      (activatedRoute as any).paramMap = subject;

      component.ngOnInit();
      subject.next({ get });

      await jest.runAllTimers();

      expect(get).toBeCalledTimes(1);
      expect(get).toBeCalledWith('id');
    });

    it('should call loadQuizee with provided id', async () => {
      playerService.loadQuizee.mockReturnValue(of());
      const get = jest.fn().mockReturnValue('someId');

      const subject = new Subject();
      (activatedRoute as any).paramMap = subject;

      component.ngOnInit();
      subject.next({ get });

      await jest.runAllTimers();

      expect(playerService.loadQuizee).toBeCalledTimes(1);
      expect(playerService.loadQuizee).toBeCalledWith('someId');
    });

    it('should place empty string if id is falsy', async () => {
      playerService.loadQuizee.mockReturnValue(of());
      const get = jest.fn();

      const subject = new Subject();
      (activatedRoute as any).paramMap = subject;

      component.ngOnInit();
      subject.next({ get });

      await jest.runAllTimers();

      expect(playerService.loadQuizee).toBeCalledTimes(1);
      expect(playerService.loadQuizee).toBeCalledWith('');
    });

    it('should navigate to 404 if loadQuizee pushed error', async () => {
      playerService.loadQuizee.mockReturnValue(throwError(() => new Error('mockError')));
      const get = jest.fn();

      const subject = new Subject();
      (activatedRoute as any).paramMap = subject;

      component.ngOnInit();
      subject.next({ get });

      await jest.runAllTimers();

      expect(playerService.loadQuizee).toBeCalledTimes(1);
      expect(router.navigate).toBeCalledTimes(1);
      expect(router.navigate).toBeCalledWith(['solve/404']);
    });
  });

  describe('reloadQuizee', () => {
    it('should call reloadQuizee and subscribe to the result', async () => {
      const subject = new Subject<any>();
      playerService.reloadQuizee.mockReturnValue(subject);

      component.reloadQuizee();

      await jest.runAllTimers();

      expect(playerService.reloadQuizee).toBeCalledTimes(1);
      expect(subject.observed).toBeTruthy();
    });

    it('should unsubscribe after got result', async () => {
      const subject = new Subject<any>();
      playerService.reloadQuizee.mockReturnValue(subject);

      component.reloadQuizee();

      await jest.runAllTimers();

      subject.next(0);

      await jest.runAllTimers();

      expect(subject.observed).toBeFalsy();
    });
  });

  describe('onDestroy', () => {
    it('should unsubscribe', async () => {
      const subject = new Subject();
      (activatedRoute as any).paramMap = subject;

      component.ngOnInit();

      await jest.runAllTimers();

      component.ngOnDestroy();

      await jest.runAllTimers();

      expect(subject.observed).toBeFalsy();
    });
  });
});
