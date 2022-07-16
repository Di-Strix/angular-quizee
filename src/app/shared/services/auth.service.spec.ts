import { AngularFireAuth } from '@angular/fire/compat/auth';

import { Subject, of } from 'rxjs';

import { AuthService } from './auth.service';

jest.mock('@angular/fire/compat/auth');
jest.mock('firebase/auth');

describe('AuthService', () => {
  let service: AuthService;
  let auth: AngularFireAuth;
  let next: jest.Mock;
  let error: jest.Mock;

  beforeEach(() => {
    auth = new (AngularFireAuth as any)();
    service = new AuthService(auth);

    (auth as any).user = new Subject();

    auth.signInWithPopup = jest.fn().mockReturnValue(Promise.resolve());
    auth.signOut = jest.fn().mockReturnValue(Promise.resolve());

    next = jest.fn();
    error = jest.fn();

    jest.useFakeTimers();
  });

  describe('isAuthenticated', () => {
    it('should stream current state', async () => {
      (auth as any).authState = of({}, null);

      service.isAuthenticated().subscribe({ next, error });

      await jest.runAllTimers();

      expect(error).not.toBeCalled();
      expect(next).toBeCalledTimes(2);

      expect(next).toHaveBeenNthCalledWith(1, true);
      expect(next).toHaveBeenNthCalledWith(2, false);
    });
  });

  describe('logIn', () => {
    it('should call signInWithPopup', async () => {
      service.logIn().subscribe();

      await jest.runAllTimers();

      expect(auth.signInWithPopup).toBeCalledTimes(1);
    });

    it('should return current user', async () => {
      const user$ = new Subject<any>();
      (auth as any).user = user$;

      service.logIn().subscribe({ next, error });

      await jest.runAllTimers();

      user$.next(1);

      await jest.runAllTimers();

      expect(error).not.toBeCalled();
      expect(next).toBeCalledTimes(1);
      expect(next).toBeCalledWith(1);
    });

    it('should emit current user only once', async () => {
      const user$ = new Subject<any>();
      (auth as any).user = user$;

      service.logIn().subscribe({ next, error });

      await jest.runAllTimers();

      user$.next(1);
      user$.next(1);

      await jest.runAllTimers();

      expect(error).not.toBeCalled();
      expect(next).toBeCalledTimes(1);
    });
  });

  describe('logOut', () => {
    it('should call signOut and return observable from returned promise', async () => {
      service.logOut().subscribe({ next, error });

      await jest.runAllTimers();

      expect(error).not.toBeCalled();
      expect(next).toBeCalledTimes(1);

      expect(auth.signOut).toBeCalledTimes(1);
    });
  });

  describe('getUser', () => {
    it('should stream current user', async () => {
      const user$ = new Subject<any>();
      (auth as any).user = user$;

      service.getUser().subscribe({ next, error });

      user$.next(1);
      user$.next(2);

      await jest.runAllTimers();

      expect(error).not.toBeCalled();
      expect(next).toBeCalledTimes(2);
    });
  });
});
