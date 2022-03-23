import { Injectable } from '@angular/core';
import { Firestore, doc, docData } from '@angular/fire/firestore';
import { Quiz, QuizId } from '@di-strix/quizee-types';

import { Observable, map, take, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class QuizeeService {
  constructor(private firestore: Firestore) {}

  getQuizee(id: QuizId, once: boolean = false): Observable<Quiz> {
    return docData<Quiz>(doc(this.firestore, `quizees/${id}`) as any).pipe(
      once ? take(1) : tap(),
      map((data) => {
        if (!data) throw new Error('Quizee with given id does not exist');
        return data;
      })
    );
  }
}
