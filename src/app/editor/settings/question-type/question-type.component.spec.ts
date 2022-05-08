import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { Subject, of } from 'rxjs';

import { EditorModule } from '../../editor.module';
import { QuizeeEditingService } from '../../quizee-editing.service';

import { QuestionTypeComponent } from './question-type.component';

describe('QuestionTypeComponent', () => {
  let component: QuestionTypeComponent;
  let fixture: ComponentFixture<QuestionTypeComponent>;
  let service: QuizeeEditingService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [QuestionTypeComponent],
      imports: [BrowserAnimationsModule, EditorModule],
      providers: [QuizeeEditingService],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(QuestionTypeComponent);
    service = TestBed.inject(QuizeeEditingService);
    component = fixture.componentInstance;

    jest.useFakeTimers();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should subscribe to current question', () => {
    const getCurrentQuestion = jest.spyOn(service, 'getCurrentQuestion');
    getCurrentQuestion.mockReturnValue(of());

    component.ngOnInit();

    jest.runAllTimers();

    expect(getCurrentQuestion).toHaveBeenCalled();
  });

  describe('input value change', () => {
    it('should update quizee on input value change', () => {
      const getCurrentQuestion = jest.spyOn(service, 'getCurrentQuestion');
      getCurrentQuestion.mockReturnValue(of({ question: { type: 'ONE_TRUE' } } as any));

      const modifyCurrentQuestion = jest.spyOn(service, 'modifyCurrentQuestion');

      component.ngOnInit();
      component.questionType.setValue('SEVERAL_TRUE');

      jest.runAllTimers();

      expect(modifyCurrentQuestion).toHaveBeenCalledTimes(1);
      expect(modifyCurrentQuestion).toHaveBeenCalledWith({ question: { type: 'SEVERAL_TRUE' } });
    });
  });

  describe('question type value change', () => {
    it('should update input value if its value differs', () => {
      const subject = new Subject();
      const getCurrentQuestion = jest.spyOn(service, 'getCurrentQuestion');
      getCurrentQuestion.mockReturnValue(subject as any);

      const setValue = jest.spyOn(component.questionType, 'setValue');

      component.ngOnInit();
      subject.next({ question: { type: 'ONE_TRUE' } });

      jest.runAllTimers();

      subject.next({ question: { type: 'SEVERAL_TRUE' } });

      expect(setValue).toBeCalledTimes(2);
      expect(setValue.mock.calls[0][0]).toBe('ONE_TRUE');
      expect(setValue.mock.calls[1][0]).toBe('SEVERAL_TRUE');
    });

    it('should not update input value if it is the same', () => {
      const subject = new Subject();
      const getCurrentQuestion = jest.spyOn(service, 'getCurrentQuestion');
      getCurrentQuestion.mockReturnValue(subject as any);

      const setValue = jest.spyOn(component.questionType, 'setValue');

      component.ngOnInit();
      subject.next({ question: { type: 'ONE_TRUE' } });

      jest.runAllTimers();

      subject.next({ question: { type: 'ONE_TRUE' } });

      expect(setValue).toBeCalledTimes(1);
      expect(setValue.mock.calls[0][0]).toBe('ONE_TRUE');
    });
  });
});
