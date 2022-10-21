import { AngularFireFunctions } from '@angular/fire/compat/functions';
import { MatDialog } from '@angular/material/dialog';

import { httpsCallable } from 'firebase/functions';
import { Subject, of } from 'rxjs';

import { AuthService } from './auth.service';
import { QuizeeService } from './quizee.service';

jest.mock('firebase/functions');
jest.mock('@angular/material/dialog');
jest.mock('./auth.service');

const mockCloudFunction = (expectedFnName: string) => {
  const fn = jest.fn();

  (httpsCallable as jest.Mock).mockImplementation((calledFnName) => (...args: any) => {
    if (calledFnName === expectedFnName) return fn(...args);
    else throw new Error(`expected ${expectedFnName} to be called, but got ${calledFnName} called`);
  });

  return fn;
};

describe('QuizeeService', () => {
  let service: QuizeeService;
  let authService: AuthService;
  let matDialog: MatDialog;
  let next: jest.Mock;
  let error: jest.Mock;

  beforeEach(() => {
    authService = new AuthService({} as any);
    matDialog = new (MatDialog as any)();

    service = new QuizeeService({ httpsCallable } as any as AngularFireFunctions, authService, matDialog);

    jest.spyOn(service, 'withAuthGuard' as any).mockImplementation((fn: any) => fn());

    next = jest.fn();
    error = jest.fn();

    jest.useFakeTimers();
  });

  describe('getQuizee', () => {
    let fn: jest.Mock;

    beforeEach(() => {
      fn = mockCloudFunction('getFullQuizee');
      fn.mockReturnValue(of({}));
    });

    it('should be called with auth guard', async () => {
      service.getFullQuizee('1').subscribe();

      await jest.runAllTimers();

      expect((service as any).withAuthGuard).toBeCalledTimes(1);
    });

    it('should call cloud function with provided id', async () => {
      service.getFullQuizee('mockId').subscribe();

      await jest.runAllTimers();

      expect(fn).toBeCalledTimes(1);
      expect(fn).toBeCalledWith('mockId');
    });

    it(`should push Quiz to subscriber`, async () => {
      const symbol = Symbol();
      const mockData = {
        [symbol]: 1,
      };

      fn.mockReturnValue(of(mockData));

      service.getFullQuizee('mockId').subscribe({ next, error });

      await jest.runAllTimers();

      expect(error).not.toBeCalled();
      expect(next).toBeCalledWith(mockData);
    });
  });

  describe('getQuizeePublicData', () => {
    let fn: jest.Mock;

    beforeEach(() => {
      fn = mockCloudFunction('getPublicQuizee');
      fn.mockReturnValue(of({}));
    });

    it('should return Quiz', async () => {
      const infoSymbol = Symbol();
      const questionsSymbol = Symbol();

      const mockData = {
        info: { [infoSymbol]: 1 },
        questions: { [questionsSymbol]: 1 },
        answers: [],
      };

      fn.mockReturnValue(of(mockData));

      service.getPublicQuizee('mock').subscribe({
        next,
        error,
      });

      await jest.runAllTimers();

      expect(error).not.toBeCalled();
      expect(next).toBeCalledTimes(1);
      expect(next).toBeCalledWith(mockData);
    });

    it('should call cloud function with provided id', async () => {
      service.getPublicQuizee('mock').subscribe();

      await jest.runAllTimers();

      expect(fn).toBeCalledTimes(1);
      expect(fn).toBeCalledWith('mock');
    });
  });

  describe('getQuizeeList', () => {
    let fn: jest.Mock;

    beforeEach(() => {
      fn = mockCloudFunction('getQuizeeList');
      fn.mockImplementation(async () => ({ data: {} }));
    });

    it('should call cloud function', async () => {
      const mockData = { someMockData: 'abc' };
      fn.mockImplementation(() => of(mockData));

      service.getQuizeeList().subscribe({ next, error });

      await jest.runAllTimers();

      expect(error).not.toBeCalled();
      expect(fn).toBeCalledTimes(1);
      expect(next).toBeCalledTimes(1);
    });

    it('should return cloud function response', async () => {
      const mockData = { someMockData: 'abc' };
      fn.mockImplementation(() => of(mockData));

      service.getQuizeeList().subscribe({ next, error });

      await jest.runAllTimers();

      expect(error).not.toBeCalled();
      expect(next).toBeCalledTimes(1);
      expect(next).toBeCalledWith(mockData);
    });
  });

  describe('checkAnswers', () => {
    let fn: jest.Mock;

    beforeEach(() => {
      fn = mockCloudFunction('checkAnswers');
      fn.mockImplementation(async () => ({ data: {} }));
    });

    it('should call cloud function', async () => {
      const mockData = { someMockData: 'abc' };
      fn.mockImplementation(() => of(mockData));

      service.checkAnswers({} as any).subscribe({ next, error });

      await jest.runAllTimers();

      expect(error).not.toBeCalled();
      expect(fn).toBeCalledTimes(1);
      expect(next).toBeCalledTimes(1);
    });

    it('should return cloud function response', async () => {
      const mockData = { someMockData: 'abc' };
      fn.mockImplementation(() => of(mockData));

      service.checkAnswers({} as any).subscribe({ next, error });

      await jest.runAllTimers();

      expect(error).not.toBeCalled();
      expect(next).toBeCalledTimes(1);
      expect(next).toBeCalledWith(mockData);
    });
  });

  describe('publishQuizee', () => {
    let fn: jest.Mock;

    beforeEach(() => {
      fn = mockCloudFunction('publishQuizee');
      fn.mockImplementation(async () => ({ data: {} }));
    });

    it('should call cloud function', async () => {
      const mockData = { someMockData: 'abc' };
      fn.mockImplementation(() => of(mockData));

      service.publishQuizee({} as any).subscribe({ next, error });

      await jest.runAllTimers();

      expect(error).not.toBeCalled();
      expect(fn).toBeCalledTimes(1);
      expect(next).toBeCalledTimes(1);
    });

    it('should return cloud function response', async () => {
      const mockData = { someMockData: 'abc' };
      fn.mockImplementation(() => of(mockData));

      service.publishQuizee({} as any).subscribe({ next, error });

      await jest.runAllTimers();

      expect(error).not.toBeCalled();
      expect(next).toBeCalledTimes(1);
      expect(next).toBeCalledWith(mockData);
    });

    it('should be called with auth guard', async () => {
      fn.mockImplementation(() => of());

      service.publishQuizee({} as any).subscribe();

      await jest.runAllTimers();

      expect((service as any).withAuthGuard).toBeCalledTimes(1);
    });
  });

  describe('withAuthGuard', () => {
    let afterClosed$: Subject<boolean>;
    let isAuthenticated$: Subject<boolean>;

    beforeEach(() => {
      afterClosed$ = new Subject<boolean>();
      isAuthenticated$ = new Subject<boolean>();

      ((service as any).withAuthGuard as jest.Mock).mockRestore();

      jest.spyOn(matDialog, 'open').mockReturnValue({ afterClosed: () => afterClosed$ } as any);
      jest.spyOn(authService, 'isAuthenticated').mockReturnValue(isAuthenticated$);
    });

    it('should request auth state from auth service', async () => {
      (service as any).withAuthGuard(() => of()).subscribe();

      isAuthenticated$.next(true);

      await jest.runAllTimers();

      expect(authService.isAuthenticated).toBeCalled();
    });

    it('should immediately switch to provided stream if authorized', async () => {
      (service as any).withAuthGuard(() => of(1, 2, 3)).subscribe({ next, error });

      isAuthenticated$.next(true);

      await jest.runAllTimers();

      expect(error).not.toBeCalled();
      expect(next).toBeCalledTimes(3);

      expect(authService.isAuthenticated).toBeCalled();
    });

    it('should open dialog and wait for auth if not authorized', async () => {
      (service as any).withAuthGuard(() => of(1, 2, 3)).subscribe({ next, error });

      isAuthenticated$.next(false);

      await jest.runAllTimers();

      expect(error).not.toBeCalled();
      expect(next).not.toBeCalled();

      expect(matDialog.open).toBeCalledTimes(1);
      expect(authService.isAuthenticated).toBeCalled();
    });

    it('should throw if dialog closed before auth', async () => {
      (service as any).withAuthGuard(() => of(1, 2, 3)).subscribe({ next, error });

      isAuthenticated$.next(false);
      afterClosed$.next(false);

      await jest.runAllTimers();

      expect(error).toBeCalledTimes(1);
      expect(next).not.toBeCalled();
    });

    it('should close dialog and switch to provided stream when authorized after dialog open', async () => {
      const dialogRef = {
        afterClosed: jest.fn().mockReturnValue(of()),
        close: jest.fn(),
      };

      jest.spyOn(matDialog, 'open').mockReturnValue(dialogRef as any);

      (service as any).withAuthGuard(() => of(1, 2, 3)).subscribe({ next, error });

      isAuthenticated$.next(false);
      isAuthenticated$.next(true);

      await jest.runAllTimers();

      expect(error).not.toBeCalled();
      expect(next).toBeCalledTimes(3);

      expect(dialogRef.close).toBeCalledTimes(1);
    });

    it('should not start provided stream every time auth state changes', async () => {
      (service as any).withAuthGuard(() => of(1, 2, 3)).subscribe({ next, error });

      isAuthenticated$.next(true);

      await jest.runAllTimers();

      isAuthenticated$.next(true);

      await jest.runAllTimers();

      expect(error).not.toBeCalled();
      expect(next).toBeCalledTimes(3);
    });
  });
});
