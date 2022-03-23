import { Firestore, doc, docData } from '@angular/fire/firestore';

import { of } from 'rxjs';

import { QuizeeService } from './quizee.service';

describe('QuizeeService', () => {
  let mockDB: object = {};
  let service: QuizeeService;

  beforeEach(() => {
    // @ts-ignore
    doc = jest.fn((_, path: string) => {
      let anchor: { [key: string]: any } = mockDB;

      path.split('/').forEach((key: string) => (anchor = anchor && key in anchor ? anchor[key] : undefined));
      return anchor;
    });

    // @ts-ignore
    // noinspection JSConstantReassignment
    docData = jest.fn((val) => val);

    mockDB = {};
    service = new QuizeeService(undefined as any as Firestore);
  });

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
