import { Injectable } from '@angular/core';
import { AngularFireFunctions } from '@angular/fire/compat/functions';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import {
  CheckAnswers,
  GetFullQuizee,
  GetPublicQuizee,
  GetQuizeeList,
  PublishQuizee,
} from '@di-strix/quizee-cloud-functions-interfaces';

import { Observable, filter, first, map, merge, of, switchMap, tap, throwError } from 'rxjs';

import { AuthDialogComponent } from '../components/auth-dialog/auth-dialog.component';

import { AuthService } from './auth.service';

type PromiseToObservable<T> = T extends Promise<infer R> ? Observable<R> : never;

@Injectable({
  providedIn: 'root',
})
export class QuizeeService {
  constructor(
    private cloudFunctions: AngularFireFunctions,
    private authService: AuthService,
    private authDialog: MatDialog
  ) {}

  getFullQuizee(...args: GetFullQuizee.Args): PromiseToObservable<GetFullQuizee.ReturnType> {
    return this.withAuthGuard(() => this.cloudFunctions.httpsCallable('getFullQuizee')(...args));
  }

  getPublicQuizee(...args: GetPublicQuizee.Args): PromiseToObservable<GetPublicQuizee.ReturnType> {
    return this.cloudFunctions.httpsCallable('getPublicQuizee')(...args);
  }

  getQuizeeList(): PromiseToObservable<GetQuizeeList.ReturnType> {
    return this.cloudFunctions.httpsCallable('getQuizeeList')(null);
  }

  checkAnswers(...args: CheckAnswers.Args): PromiseToObservable<CheckAnswers.ReturnType> {
    return this.cloudFunctions.httpsCallable('checkAnswers')(...args);
  }

  publishQuizee(...args: PublishQuizee.Args): PromiseToObservable<PublishQuizee.ReturnType> {
    return this.withAuthGuard(() => this.cloudFunctions.httpsCallable('publishQuizee')(...args));
  }

  private withAuthGuard<T>(fn: () => Observable<T>): Observable<T> {
    let dialogRef: MatDialogRef<AuthDialogComponent>;

    return this.authService.isAuthenticated().pipe(
      first(),
      switchMap((authenticated) => {
        if (!authenticated) {
          dialogRef = this.authDialog.open(AuthDialogComponent);
          return merge(
            dialogRef.afterClosed().pipe(map(() => false)),
            this.authService.isAuthenticated().pipe(filter((v) => v))
          );
        }
        return of(true);
      }),
      first(),
      switchMap((state) => (!state ? throwError(() => new Error('Auth required')) : of(true))),
      tap(() => dialogRef?.close()),
      switchMap(() => fn())
    );
  }
}
