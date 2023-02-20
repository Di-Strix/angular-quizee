import { Injectable } from '@angular/core';
import { Functions, httpsCallableData } from '@angular/fire/functions';
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

@Injectable({
  providedIn: 'root',
})
export class QuizeeService {
  constructor(private cloudFunctions: Functions, private authService: AuthService, private authDialog: MatDialog) {}

  getFullQuizee(arg: GetFullQuizee.Arg): Observable<GetFullQuizee.ReturnType> {
    return this.withAuthGuard(() =>
      httpsCallableData<GetFullQuizee.Arg, GetFullQuizee.ReturnType>(this.cloudFunctions, 'getFullQuizee')(arg)
    );
  }

  getPublicQuizee(arg: GetPublicQuizee.Arg): Observable<GetPublicQuizee.ReturnType> {
    return httpsCallableData<GetPublicQuizee.Arg, GetPublicQuizee.ReturnType>(
      this.cloudFunctions,
      'getPublicQuizee'
    )(arg);
  }

  getQuizeeList(arg?: GetQuizeeList.Arg): Observable<GetQuizeeList.ReturnType> {
    return httpsCallableData<GetQuizeeList.Arg, GetQuizeeList.ReturnType>(this.cloudFunctions, 'getQuizeeList')(arg);
  }

  checkAnswers(arg: CheckAnswers.Arg): Observable<CheckAnswers.ReturnType> {
    return httpsCallableData<CheckAnswers.Arg, CheckAnswers.ReturnType>(this.cloudFunctions, 'checkAnswers')(arg);
  }

  publishQuizee(arg: PublishQuizee.Arg): Observable<PublishQuizee.ReturnType> {
    return this.withAuthGuard(() =>
      httpsCallableData<PublishQuizee.Arg, PublishQuizee.ReturnType>(this.cloudFunctions, 'publishQuizee')(arg)
    );
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
