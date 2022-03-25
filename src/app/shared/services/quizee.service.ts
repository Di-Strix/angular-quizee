import { Injectable } from '@angular/core';
import { Firestore, doc, docData } from '@angular/fire/firestore';
import { Question, Quiz, QuizId, QuizInfo } from '@di-strix/quizee-types';

import { Observable, map, take, tap, zipWith } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class QuizeeService {
  constructor(private firestore: Firestore) {}

  getQuizee(id: QuizId, once: boolean = false): Observable<Quiz> {
    return docData<Quiz>(doc(this.firestore, `quizees/${id}`) as any).pipe(
      once ? take(1) : tap(),
      tap((data) => {
        if (!data) throw new Error('Quizee with given id does not exist');
      })
    );
  }

  getQuizeePublicData(id: QuizId): Observable<Quiz> {
    const anchor = doc(this.firestore, `quizees/${id}`);

    return docData<QuizInfo>(doc(anchor, 'info') as any).pipe(
      zipWith(docData<Question[]>(doc(anchor, 'questions') as any)),
      take(1),
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
}
