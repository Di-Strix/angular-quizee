import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AnswerOption } from '@di-strix/quizee-types';

import * as _ from 'lodash';
import { Subject, of } from 'rxjs';
import { EditorModule } from 'src/app/editor/editor.module';
import { QuestionPair, QuizeeEditingService } from 'src/app/editor/quizee-editing.service';

import { SeveralTrueComponent } from './several-true.component';

class QuizeeEditingServiceMock {
  getCurrentQuestion = jest.fn();
  setAnswer = jest.fn();
  setAnswerOptions = jest.fn();
}

describe('SeveralTrueComponent', () => {
  let component: SeveralTrueComponent;
  let service: QuizeeEditingServiceMock;
  let fixture: ComponentFixture<SeveralTrueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SeveralTrueComponent],
      imports: [EditorModule],
      providers: [
        {
          provide: QuizeeEditingService,
          useValue: new QuizeeEditingServiceMock(),
        },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SeveralTrueComponent);
    service = TestBed.inject(QuizeeEditingService) as any as QuizeeEditingServiceMock;
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('assembleFunctions', () => {
    let testComponent: {
      assembleAnswers: SeveralTrueComponent['assembleAnswers'];
      assembleAnswerOptions: SeveralTrueComponent['assembleAnswerOptions'];
    };

    beforeEach(() => {
      testComponent = component as any;
    });

    describe('assembleAnswers', () => {
      it('should work', () => {
        const result = testComponent.assembleAnswers({
          id1: { isCorrect: false, value: '' },
          id2: { isCorrect: true, value: '' },
        });

        expect(result).toEqual(['id2']);
      });
    });

    describe('assembleAnswerOptions', () => {
      it('should work', () => {
        const result = testComponent.assembleAnswerOptions({
          id1: { isCorrect: false, value: 'answerOption1' },
          id2: { isCorrect: false, value: 'answerOption2' },
        });

        expect(result).toEqual([
          { id: 'id1', value: 'answerOption1' },
          { id: 'id2', value: 'answerOption2' },
        ]);
      });
    });
  });

  it('should subscribe to current question', () => {
    service.getCurrentQuestion.mockReturnValue(of());
    component.ngOnInit();

    expect(service.getCurrentQuestion).toHaveBeenCalled();
  });

  it('should create form controls for each answer option', () => {
    const ids = ['id1', 'id2', 'id3'];
    service.getCurrentQuestion.mockReturnValue(
      of({
        answer: { answer: [], answerTo: 'question id', config: { equalCase: false } },
        question: {
          answerOptions: ids.map<AnswerOption>((id) => ({ id, value: 'id' })),
          caption: '',
          id: 'question id',
          type: 'SEVERAL_TRUE',
        },
      } as QuestionPair)
    );

    component.ngOnInit();

    expect(Object.keys(component.formGroup.controls)).toEqual(expect.arrayContaining(ids));
  });

  describe('value change', () => {
    it('should update quizee on input value change', () => {
      jest.useFakeTimers();

      const ids = ['id1'];
      service.getCurrentQuestion.mockReturnValue(
        of({
          answer: { answer: [], answerTo: 'question id', config: { equalCase: false } },
          question: {
            answerOptions: ids.map<AnswerOption>((id) => ({ id, value: 'id' })),
            caption: '',
            id: 'question id',
            type: 'SEVERAL_TRUE',
          },
        } as QuestionPair)
      );

      component.ngOnInit();
      component.formGroup.controls['id1'].get('value')?.setValue('id1');

      jest.runAllTimers();

      expect(service.setAnswer).toHaveBeenCalledTimes(1);
      expect(service.setAnswerOptions).toHaveBeenCalledTimes(1);

      expect(service.setAnswer.mock.calls[0][0]).toEqual([]);
      expect(service.setAnswerOptions.mock.calls[0][0]).toEqual([{ id: 'id1', value: 'id1' }]);
    });

    it('should update quizee on checkbox value change', () => {
      jest.useFakeTimers();

      const ids = ['id1'];
      service.getCurrentQuestion.mockReturnValue(
        of({
          answer: { answer: [], answerTo: 'question id', config: { equalCase: false } },
          question: {
            answerOptions: ids.map<AnswerOption>((id) => ({ id, value: 'id' })),
            caption: '',
            id: 'question id',
            type: 'SEVERAL_TRUE',
          },
        } as QuestionPair)
      );

      component.ngOnInit();
      component.formGroup.controls['id1'].get('isCorrect')?.setValue(true);

      jest.runAllTimers();

      expect(service.setAnswer).toHaveBeenCalledTimes(1);
      expect(service.setAnswerOptions).toHaveBeenCalledTimes(1);

      expect(service.setAnswer.mock.calls[0][0]).toEqual(['id1']);
      expect(service.setAnswerOptions.mock.calls[0][0]).toEqual([{ id: 'id1', value: 'id' }]);
    });
  });

  describe('form re-init event filtering', () => {
    let mockQuestionPair: QuestionPair;

    beforeEach(() => {
      jest.useFakeTimers();

      mockQuestionPair = {
        answer: { answer: [], answerTo: 'question id', config: { equalCase: false } },
        question: {
          answerOptions: [],
          caption: '',
          id: 'question id',
          type: 'SEVERAL_TRUE',
        },
      };
    });

    it('should not re-init form group if values are the same', () => {
      mockQuestionPair.question.answerOptions = [{ id: 'some-unique-id', value: '1' }];

      const subject = new Subject();
      service.getCurrentQuestion.mockReturnValue(subject);

      component.ngOnInit();
      subject.next(_.cloneDeep(mockQuestionPair));

      jest.runAllTimers();

      const form = component.formGroup;
      subject.next(_.cloneDeep(mockQuestionPair));
      component.ngOnInit();

      jest.runAllTimers();

      expect(component.formGroup === form).toBeTruthy();
    });

    it('should re-+init form group if answer options changed', () => {
      mockQuestionPair.question.answerOptions = [{ id: 'some-unique-id', value: '1' }];

      const subject = new Subject();
      service.getCurrentQuestion.mockReturnValue(subject);

      component.ngOnInit();
      subject.next(_.cloneDeep(mockQuestionPair));

      jest.runAllTimers();

      const form = component.formGroup;
      mockQuestionPair.question.answerOptions[0].value = '2';
      subject.next(_.cloneDeep(mockQuestionPair));
      component.ngOnInit();

      jest.runAllTimers();

      expect(component.formGroup === form).toBeFalsy();
    });

    it('should re-init form group if answers changed', () => {
      mockQuestionPair.question.answerOptions = [{ id: 'some-unique-id', value: '1' }];

      const subject = new Subject();
      service.getCurrentQuestion.mockReturnValue(subject);

      component.ngOnInit();
      subject.next(_.cloneDeep(mockQuestionPair));

      jest.runAllTimers();

      const form = component.formGroup;
      mockQuestionPair.answer.answer.push('1');
      subject.next(_.cloneDeep(mockQuestionPair));
      component.ngOnInit();

      jest.runAllTimers();

      expect(component.formGroup === form).toBeFalsy();
    });
  });
});
