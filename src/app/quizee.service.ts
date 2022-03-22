import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Quiz, QuizId } from '@di-strix/quizee-types';

import { Observable, map, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class QuizeeService {
  constructor(private firestore: AngularFirestore) {}

  getQuizee(id: QuizId): Observable<Quiz> {
    return this.firestore
      .collection('quizees')
      .doc<Quiz>(id)
      .get()
      .pipe(
        map((snapshot) => {
          if (!snapshot.exists) throwError(() => new Error('Quizee with given id does not exist'));

          return snapshot.data() as Quiz;
        })
      );
  }
}
