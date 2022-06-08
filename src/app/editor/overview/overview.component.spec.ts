import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VerificationErrors } from '@di-strix/quizee-verification-functions';

import { Observable, Subject, of } from 'rxjs';

import { EditorModule } from '../editor.module';
import { QuizeeEditingService } from '../quizee-editing.service';

import { OverviewComponent } from './overview.component';

describe('OverviewComponent', () => {
  let component: OverviewComponent;
  let fixture: ComponentFixture<OverviewComponent>;
  let quizeeEditingService: QuizeeEditingService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [OverviewComponent],
      providers: [],
      imports: [EditorModule],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OverviewComponent);
    component = fixture.componentInstance;
    quizeeEditingService = TestBed.inject(QuizeeEditingService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('onInit', () => {
    it('should subscribe to quizeeErrors', () => {
      const subject = new Observable();
      const getQuizeeErrors = jest.spyOn(quizeeEditingService, 'getQuizeeErrors').mockReturnValue(subject as any);

      component.ngOnInit();

      expect(getQuizeeErrors).toBeCalledTimes(1);
    });

    it('should save errors', () => {
      jest.useFakeTimers();

      const subject = new Subject();
      jest.spyOn(quizeeEditingService, 'getQuizeeErrors').mockReturnValue(subject as any);

      component.ngOnInit();

      subject.next(1);

      jest.runAllTimers();

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
    it('should work', () => {
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
      jest.spyOn(quizeeEditingService, 'getQuizeeErrors').mockReturnValue(of(errors));

      component.ngOnInit();

      jest.runAllTimers();

      expect(component.hasError(0)).toBeTruthy();
      expect(component.hasError(1)).toBeTruthy();
      expect(component.hasError(2)).toBeFalsy();
    });
  });
});
