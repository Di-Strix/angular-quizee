import { Firestore, doc, docData } from '@angular/fire/firestore';
import { Functions } from '@angular/fire/functions';
import { MatDialog } from '@angular/material/dialog';

import { httpsCallable } from 'firebase/functions';
import { Subject, of, throwError } from 'rxjs';

import { AuthService } from './auth.service';
import { QuizeeService } from './quizee.service';

jest.mock('firebase/functions');
jest.mock('@angular/fire/firestore');
jest.mock('@angular/material/dialog');
jest.mock('./auth.service');

const mockCloudFunction = (expectedFnName: string) => {
  const fn = jest.fn();

  (httpsCallable as jest.Mock).mockImplementation((_, calledFnName) => (...args: any) => {
    if (calledFnName === expectedFnName) return fn(...args);
    else throw new Error(`expected ${expectedFnName} to be called, but got ${calledFnName} called`);
  });

  return fn;
};

describe('QuizeeService', () => {
  let mockDB: any = {};
  let service: QuizeeService;
  let authService: AuthService;
  let matDialog: MatDialog;
  let next: jest.Mock;
  let error: jest.Mock;

  beforeEach(() => {
    (doc as jest.Mock).mockImplementation((anchor = mockDB, path: string) => {
      path.split('/').forEach((key: string) => (anchor = anchor && key in anchor ? anchor[key] : undefined));
      return anchor;
    });

    (docData as jest.Mock).mockImplementation((val) => val);

    mockDB = {};

    authService = new AuthService({} as any);
    matDialog = new (MatDialog as any)();

    service = new QuizeeService(undefined as any as Firestore, {} as Functions, authService, matDialog);

    jest.spyOn(service, 'withAuthGuard' as any).mockImplementation((fn: any) => fn());

    next = jest.fn();
    error = jest.fn();

    jest.useFakeTimers();
  });

  describe('getQuizee', () => {
    it('should be called with auth guard', async () => {
      mockDB = { quizees: { 1: of({}) } };

      service.getQuizee('1').subscribe();

      await jest.runAllTimers();

      expect((service as any).withAuthGuard).toBeCalledTimes(1);
    });

    it(`should throw error if data is undefined`, async () => {
      mockDB = { quizees: { mockId: of(undefined) } };

      service.getQuizee('mockId').subscribe({ next, error });

      await jest.runAllTimers();

      expect(next).not.toBeCalled();
      expect(error).toBeCalledTimes(1);
    });

    it(`should push Quiz to subscriber`, async () => {
      const symbol = Symbol();
      const mockData = {
        [symbol]: 1,
      };
      mockDB = {
        quizees: {
          mockId: of(mockData),
        },
      };

      service.getQuizee('mockId').subscribe({ next, error });

      await jest.runAllTimers();

      expect(error).not.toBeCalled();
      expect(next).toBeCalledWith(mockData);
    });

    it(`should push Quiz to subscriber only once if once = true`, async () => {
      mockDB = {
        quizees: {
          mockArr: of(1, 2, 3),
        },
      };

      service.getQuizee('mockArr', true).subscribe({ next, error });

      await jest.runAllTimers();

      expect(error).not.toBeCalled();
      expect(next).toBeCalledTimes(1);
    });

    it(`should push Quiz to subscriber every time it updates if once = false`, async () => {
      mockDB = {
        quizees: {
          mockArr: of(1, 2, 3),
        },
      };

      service.getQuizee('mockArr').subscribe({ next, error });

      await jest.runAllTimers();

      expect(error).not.toBeCalled();
      expect(next).toBeCalledTimes(3);
    });
  });

  describe('getQuizeePublicData', () => {
    it('should return Quiz', async () => {
      const infoSymbol = Symbol();
      const questionsSymbol = Symbol();

      const mockData = {
        info: { [infoSymbol]: 1 },
        questions: { [questionsSymbol]: 1 },
        answers: [],
      };

      mockDB = {
        quizees: {
          mock: {
            info: of(mockData.info),
            questions: of(mockData.questions),
          },
        },
      };

      service.getQuizeePublicData('mock').subscribe({
        next,
        error,
      });

      await jest.runAllTimers();

      expect(error).not.toBeCalled();
      expect(next).toBeCalledTimes(1);
      expect(next).toBeCalledWith(mockData);
    });

    it('should not try to access answers', async () => {
      mockDB = {
        quizees: {
          mock: {
            info: of({}),
            questions: of([]),
            answers: throwError(() => new Error('Attempted to access answers')),
          },
        },
      };

      service.getQuizeePublicData('mock').subscribe({ next, error });

      await jest.runAllTimers();

      expect(error).not.toBeCalled();
      expect(next).toBeCalledTimes(1);
    });

    it('should throw error if info or questions is undefined', async () => {
      const performTest = async (info: any, questions: any) => {
        mockDB = {
          quizees: {
            mock: {
              info: of(info),
              questions: of(questions),
            },
          },
        };

        service.getQuizeePublicData('mock').subscribe({ next, error });

        await jest.runAllTimers();

        expect(next).not.toBeCalled();
        expect(error).toBeCalled();
      };

      await performTest({}, undefined);
      await performTest(undefined, []);
      await performTest(undefined, undefined);
    });

    it('should complete stream after getting data', async () => {
      mockDB = {
        quizees: {
          mock: {
            info: of({}),
            questions: of([]),
          },
        },
      };

      const complete = jest.fn();

      service.getQuizeePublicData('mock').subscribe({ next, error, complete });

      await jest.runAllTimers();

      expect(next).toBeCalledTimes(1);
      expect(error).not.toBeCalled();
      expect(complete).toBeCalled();
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
      fn.mockImplementation(() => Promise.resolve({ data: mockData }));

      service.getQuizeeList().subscribe({ next, error });

      await jest.runAllTimers();

      expect(error).not.toBeCalled();
      expect(fn).toBeCalledTimes(1);
      expect(next).toBeCalledTimes(1);
    });

    it('should return cloud function response', async () => {
      const mockData = { someMockData: 'abc' };
      fn.mockImplementation(() => Promise.resolve({ data: mockData }));

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
      fn.mockImplementation(() => Promise.resolve({ data: mockData }));

      service.checkAnswers({} as any).subscribe({ next, error });

      await jest.runAllTimers();

      expect(error).not.toBeCalled();
      expect(fn).toBeCalledTimes(1);
      expect(next).toBeCalledTimes(1);
    });

    it('should return cloud function response', async () => {
      const mockData = { someMockData: 'abc' };
      fn.mockImplementation(() => Promise.resolve({ data: mockData }));

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
      fn.mockImplementation(() => Promise.resolve({ data: mockData }));

      service.publishQuizee({} as any).subscribe({ next, error });

      await jest.runAllTimers();

      expect(error).not.toBeCalled();
      expect(fn).toBeCalledTimes(1);
      expect(next).toBeCalledTimes(1);
    });

    it('should return cloud function response', async () => {
      const mockData = { someMockData: 'abc' };
      fn.mockImplementation(() => Promise.resolve({ data: mockData }));

      service.publishQuizee({} as any).subscribe({ next, error });

      await jest.runAllTimers();

      expect(error).not.toBeCalled();
      expect(next).toBeCalledTimes(1);
      expect(next).toBeCalledWith(mockData);
    });

    it('should be called with auth guard', async () => {
      service.publishQuizee({} as any).subscribe();

      await jest.runAllTimers();

      expect((service as any).withAuthGuard).toBeCalledTimes(1);
    });
  });

  describe('callHttpsFunction', () => {
    it('should call function with provided args', async () => {
      const fn = jest.fn().mockReturnValue(Promise.resolve(0));

      (service as any).callHttpsFunction(fn, 1, 2, 3);

      await jest.runAllTimers();

      expect(fn).toBeCalledTimes(1);
      expect(fn).toBeCalledWith(1, 2, 3);
    });

    it('should unwrap cloud function response', async () => {
      const mockData = { 1: 'a', b: 2 };
      const fn = jest.fn().mockReturnValue(Promise.resolve({ data: mockData }));

      (service as any).callHttpsFunction(fn).subscribe({ next, error });

      await jest.runAllTimers();

      expect(error).not.toBeCalled();
      expect(next).toBeCalledTimes(1);
      expect(next).toBeCalledWith(mockData);
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
      jest.spyOn(matDialog, 'closeAll');

      (service as any).withAuthGuard(() => of(1, 2, 3)).subscribe({ next, error });

      isAuthenticated$.next(false);
      isAuthenticated$.next(true);

      await jest.runAllTimers();

      expect(error).not.toBeCalled();
      expect(next).toBeCalledTimes(3);

      expect(matDialog.closeAll).toBeCalledTimes(1);
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
