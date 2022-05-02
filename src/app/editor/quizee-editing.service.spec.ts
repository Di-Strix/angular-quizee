import { Quiz } from '@di-strix/quizee-types';

import { first } from 'rxjs';

import { QuizeeEditingService } from './quizee-editing.service';

describe('QuizeeEditingService', () => {
  let service: QuizeeEditingService;

  beforeEach(() => {
    service = new QuizeeEditingService();
  });

  it("'create' function should create new quiz and return observable that emits new quizee", () => {
    expect.assertions(1);

    service
      .create()
      .pipe(first())
      .subscribe((quizee) => expect(quizee).toBeTruthy());
  });

  it("'load' function should load provided quiz and return observable that emits loaded quizee", () => {
    expect.assertions(1);

    const quizee = {
      [Symbol()]: 'data',
    };

    service
      .load(quizee as any as Quiz)
      .pipe(first())
      .subscribe((quizee) => expect(quizee).toEqual(quizee));
  });

  it("'modify' function should concat current quizee with the provided changes", () => {
    expect.assertions(2);

    const change1 = {
      change1: 'change1',
    };

    const change2 = {
      change2: 'change2',
    };

    service
      .modify(change1 as any as Quiz)
      .pipe(first())
      .subscribe((quizee) => expect(quizee).toEqual(change1));
    service
      .modify(change2 as any as Quiz)
      .pipe(first())
      .subscribe((quizee) => expect(quizee).toEqual({ ...change1, ...change2 }));
  });

  it("'get' function shold return observable thar emits current quizee", () => {
    expect.assertions(1);

    const quizee = {
      [Symbol()]: 'data',
    };

    service.load(quizee as any as Quiz);
    service
      .get()
      .pipe(first())
      .subscribe((quiz) => expect(quiz).toEqual(quizee));
  });

  it('should emit updates to subscribers', () => {
    expect.assertions(3);

    const quizee = {
      [Symbol()]: 'data',
    };
    const change1 = {
      [Symbol()]: 'change1',
    };
    const change2 = {
      [Symbol()]: 'change2',
    };

    let currentQuizee = quizee;

    service.load(quizee as any as Quiz).subscribe((quiz) => expect(quiz).toEqual(currentQuizee));

    currentQuizee = { ...currentQuizee, ...change1 };
    service.modify(change1 as any as Quiz);

    currentQuizee = { ...currentQuizee, ...change2 };
    service.modify(change2 as any as Quiz);
  });
});
