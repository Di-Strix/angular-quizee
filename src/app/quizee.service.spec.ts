import { AngularFirestore } from '@angular/fire/compat/firestore';

import { of } from 'rxjs';

import { QuizeeService } from './quizee.service';

class AngularFirestoreMock {
  collection: jest.Mock = jest.fn();

  mock(snapshotVal: object) {
    this.collection = jest.fn().mockReturnValue({
      doc: jest.fn().mockReturnValue({
        get: jest.fn().mockReturnValue(of(snapshotVal)),
      }),
    });
  }
}

describe('QuizeeService', () => {
  jest.mock('@angular/fire/compat/firestore');
  let service: QuizeeService;
  let angularFirestore: AngularFirestoreMock;

  beforeEach(() => {
    angularFirestore = new AngularFirestoreMock();
    service = new QuizeeService(angularFirestore as unknown as AngularFirestore);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it(`should throw error if snapshot doesn't exist`, (done) => {
    const error = () => done();

    angularFirestore.mock({ exists: false });
    service.getQuizee('mockId').subscribe({ error });
  });

  it(`should push Quiz to subscriber`, () => {
    expect.assertions(1);

    const obj: any = {};
    const symbol = Symbol();
    obj[symbol] = 1;

    const next = (val: any) => expect(val[symbol]).toBe(1);

    angularFirestore.mock({ exists: false, data: jest.fn().mockReturnValue(obj) });
    service.getQuizee('mockId').subscribe({ next });
  });
});
