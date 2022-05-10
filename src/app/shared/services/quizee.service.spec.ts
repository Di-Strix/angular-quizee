import { Firestore, doc, docData } from '@angular/fire/firestore';

import { of, throwError } from 'rxjs';

import { QuizeeService } from './quizee.service';

describe('QuizeeService', () => {
  let mockDB: object = {};
  let service: QuizeeService;

  beforeEach(() => {
    // @ts-ignore
    doc = jest.fn((anchor = mockDB, path: string) => {
      path.split('/').forEach((key: string) => (anchor = anchor && key in anchor ? anchor[key] : undefined));
      return anchor;
    });

    // @ts-ignore
    // noinspection JSConstantReassignment
    docData = jest.fn((val) => val);

    mockDB = {};
    service = new QuizeeService(undefined as any as Firestore);
  });

  describe('#getQuizee', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it(`should throw error if data is undefined`, (done) => {
      mockDB = { quizees: { mockId: of(undefined) } };
      const error = () => done();

      service.getQuizee('mockId').subscribe({ error });
    });

    it(`should push Quiz to subscriber`, () => {
      expect.assertions(1);

      const symbol = Symbol();
      mockDB = {
        quizees: {
          mockId: of({
            [symbol]: 1,
          }),
        },
      };

      const next = (val: any) => expect(val[symbol]).toBe(1);

      service.getQuizee('mockId').subscribe({ next });
    });

    it(`should push Quiz to subscriber only once if once = true`, () => {
      expect.assertions(1);

      mockDB = {
        quizees: {
          mockArr: of(1, 2, 3),
        },
      };

      const next = (_: any) => expect(true).toBeTruthy();

      service.getQuizee('mockArr', true).subscribe({ next });
    });

    it(`should push Quiz to subscriber everytime it updates if once = false`, () => {
      expect.assertions(3);

      mockDB = {
        quizees: {
          mockArr: of(1, 2, 3),
        },
      };

      const next = (_: any) => expect(true).toBeTruthy();

      service.getQuizee('mockArr').subscribe({ next });
    });
  });

  // describe('#getQuizeePublicData', () => {
  //   it('should return Quiz', () => {
  //     expect.assertions(3);

  //     const infoSymbol = Symbol();
  //     const questionsSymbol = Symbol();

  //     mockDB = {
  //       quizees: {
  //         mock: {
  //           info: of({ [infoSymbol]: 1 }),
  //           questions: of({ [questionsSymbol]: 1 }),
  //         },
  //       },
  //     };

  //     service.getQuizeePublicData('mock').subscribe({
  //       next: (value: any) => {
  //         expect(value.info[infoSymbol]).toBe(1);
  //         expect(value.questions[questionsSymbol]).toBe(1);
  //         expect(value.answers).toBeTruthy();
  //       },
  //     });
  //   });

  //   it('should not try to access answers', (done) => {
  //     mockDB = {
  //       quizees: {
  //         mock: {
  //           info: of({}),
  //           questions: of([]),
  //           answers: throwError(() => new Error('Attempted to access answers')),
  //         },
  //       },
  //     };

  //     service.getQuizeePublicData('mock').subscribe({ next: (_) => done() });
  //   });

  //   it('should throw error if info or questions is undefined', () => {
  //     expect.assertions(3);

  //     const performTest = (info: any, questions: any) => {
  //       mockDB = {
  //         quizees: {
  //           mock: {
  //             info: of(info),
  //             questions: of(questions),
  //           },
  //         },
  //       };

  //       service.getQuizeePublicData('mock').subscribe({ error: () => expect(true).toBeTruthy() });
  //     };

  //     performTest({}, undefined);
  //     performTest(undefined, []);
  //     performTest(undefined, undefined);
  //   });

  //   it('should complete stream after getting data', (done) => {
  //     mockDB = {
  //       quizees: {
  //         mock: {
  //           info: of({}),
  //           questions: of([]),
  //         },
  //       },
  //     };

  //     service.getQuizeePublicData('mock').subscribe({ complete: () => done() });
  //   });
  // });
});
