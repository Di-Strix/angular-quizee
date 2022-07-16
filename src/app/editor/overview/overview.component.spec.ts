import { VerificationErrors } from '@di-strix/quizee-verification-functions';

import { Observable, Subject, of } from 'rxjs';

import { QuizeeEditingService } from '../quizee-editing.service';

import { OverviewComponent } from './overview.component';

describe('OverviewComponent', () => {
  let component: OverviewComponent;
  let service: QuizeeEditingService;

  beforeEach(() => {
    service = new QuizeeEditingService();
    component = new OverviewComponent(service);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('onInit', () => {
    it('should subscribe to quizeeErrors', () => {
      const subject = new Observable();
      const getQuizeeErrors = jest.spyOn(service, 'getQuizeeErrors').mockReturnValue(subject as any);

      component.ngOnInit();

      expect(getQuizeeErrors).toBeCalledTimes(1);
    });

    it('should save errors', async () => {
      jest.useFakeTimers();

      const subject = new Subject();
      jest.spyOn(service, 'getQuizeeErrors').mockReturnValue(subject as any);

      component.ngOnInit();

      subject.next(1);

      await jest.runAllTimers();

      expect(component.errors).toBe(1);
    });
  });

  describe('trackBy', () => {
    it('should return item id', () => {
      const id = '123';

      expect(component.trackBy(0, { id } as any)).toBe(id);
    });
  });

  describe('hasError', () => {
    it('should work', async () => {
      const errors: VerificationErrors = [
        {
          message: '',
          path: [],
          type: '',
          context: { key: '', label: 'answers[0]' },
        },
        {
          message: '',
          path: [],
          type: '',
          context: { key: '', label: 'questions[1]' },
        },
      ];
      jest.spyOn(service, 'getQuizeeErrors').mockReturnValue(of(errors));

      component.ngOnInit();

      await jest.runAllTimers();

      expect(component.hasError(0)).toBeTruthy();
      expect(component.hasError(1)).toBeTruthy();
      expect(component.hasError(2)).toBeFalsy();
    });
  });
});
