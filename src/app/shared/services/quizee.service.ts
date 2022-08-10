import { Injectable } from '@angular/core';
import { AngularFireFunctions } from '@angular/fire/compat/functions';
import { Firestore, doc, docData } from '@angular/fire/firestore';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { CheckAnswers, GetQuizeeList, PublishQuizee } from '@di-strix/quizee-cloud-functions-interfaces';
import { Question, Quiz, QuizId, QuizInfo } from '@di-strix/quizee-types';

import { Observable, filter, first, from, map, merge, of, switchMap, tap, throwError, zipWith } from 'rxjs';

import { AuthDialogComponent } from '../components/auth-dialog/auth-dialog.component';

import { AuthService } from './auth.service';

type PromiseToObservable<T> = T extends Promise<infer R> ? Observable<R> : never;

@Injectable({
  providedIn: 'root',
})
export class QuizeeService {
  constructor(
    private firestore: Firestore,
    private cloudFunctions: AngularFireFunctions,
    private authService: AuthService,
    private authDialog: MatDialog
  ) {}

  getQuizee(id: QuizId, once: boolean = false): Observable<Quiz> {
    return this.withAuthGuard(() =>
      docData<Quiz>(doc(this.firestore, `quizees/${id}`) as any).pipe(
        once ? first() : tap(),
        tap((data) => {
          if (!data) throw new Error('Quizee with given id does not exist');
        })
      )
    );
  }

  getQuizeePublicData(id: QuizId): Observable<Quiz> {
    const anchor = doc(this.firestore, `quizees/${id}`);

    return docData<QuizInfo>(doc(anchor, 'info') as any).pipe(
      zipWith(docData<Question[]>(doc(anchor, 'questions') as any)),
      first(),
      tap(([info, questions]: [QuizInfo, Question[]]) => {
        if (!info || !questions) throw new Error('Quizee with given id does not exist');
      }),
      map(
        ([info, questions]: [QuizInfo, Question[]]): Quiz => ({
          answers: [],
          info,
          questions,
        })
      )
    );
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
