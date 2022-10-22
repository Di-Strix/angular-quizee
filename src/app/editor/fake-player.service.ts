import { Injectable } from '@angular/core';
import { Question, Quiz } from '@di-strix/quizee-types';

import * as _ from 'lodash';
import { Observable, of } from 'rxjs';

import { PlayerService } from '../player/player.service';

@Injectable()
export class FakePlayerService extends PlayerService {
  constructor() {
    super({} as any);

    this.quizee = this.createMockQuizee();
  }

  loadQuestion(question: Question): Observable<Omit<Quiz, 'answers'>> {
    this.quizee = this.createMockQuizee(question);

    return this.loadQuizee('');
  }

  override commitAnswer(): Observable<void> {
    return of();
  }

  private createMockQuizee(question?: Question) {
    const quizee: Omit<Quiz, 'answers'> = { info: { caption: '', img: '', questionsCount: 0, id: '' }, questions: [] };
    if (question) {
      quizee.info.questionsCount = 1;
      quizee.questions = [question];
    }

    return quizee;
  }
}
