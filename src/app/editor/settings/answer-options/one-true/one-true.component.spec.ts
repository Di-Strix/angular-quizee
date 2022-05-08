import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AnswerOption } from '@di-strix/quizee-types';

import * as _ from 'lodash';
import { Subject, of } from 'rxjs';
import { EditorModule } from 'src/app/editor/editor.module';
import { QuestionPair, QuizeeEditingService } from 'src/app/editor/quizee-editing.service';

import { OneTrueComponent } from './one-true.component';

describe('OneTrueComponent', () => {
  let component: OneTrueComponent;
  let fixture: ComponentFixture<OneTrueComponent>;
  let service: QuizeeEditingService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [OneTrueComponent],
      imports: [EditorModule],
      providers: [QuizeeEditingService],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OneTrueComponent);
    service = TestBed.inject(QuizeeEditingService);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('assembleFunctions', () => {
    let testComponent: {
      assembleAnswers: OneTrueComponent['assembleAnswers'];
      assembleAnswerOptions: OneTrueComponent['assembleAnswerOptions'];
    };

    beforeEach(() => {
      testComponent = component as any;
    });

    describe('assembleAnswers', () => {
      it('should work', () => {
        const result = testComponent.assembleAnswers({
          values: {},
          correctAnswer: 'id2',
        });

        expect(result).toEqual(['id2']);
      });
    });

    describe('assembleAnswerOptions', () => {
      it('should work', () => {
        const result = testComponent.assembleAnswerOptions({
          values: {
            id1: 'answerOption1',
            id2: 'answerOption2',
          },
          correctAnswer: '',
        });

        expect(result).toEqual([
          { id: 'id1', value: 'answerOption1' },
          { id: 'id2', value: 'answerOption2' },
        ]);
      });
    });
  });

  it('should subscribe to current question', () => {
    const getCurrentQuestion = jest.spyOn(service, 'getCurrentQuestion');
    getCurrentQuestion.mockReturnValue(of());
    component.ngOnInit();

    expect(service.getCurrentQuestion).toHaveBeenCalled();
  });

  it('should create form controls for each answer option', () => {
    const ids = ['id1', 'id2', 'id3'];

    const getCurrentQuestion = jest.spyOn(service, 'getCurrentQuestion');
    getCurrentQuestion.mockReturnValue(
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

    expect(Object.keys(component.formGroup.get('values')?.value)).toEqual(expect.arrayContaining(ids));
  });

  describe('value change', () => {
    it('should update quizee on input value change', () => {
      jest.useFakeTimers();

      const ids = ['id1'];

      const getCurrentQuestion = jest.spyOn(service, 'getCurrentQuestion');
      getCurrentQuestion.mockReturnValue(
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

      const setAnswer = jest.spyOn(service, 'setAnswer');
      const setAnswerOptions = jest.spyOn(service, 'setAnswerOptions');

      component.ngOnInit();
      component.formGroup.get('values')?.get('id1')?.setValue('id1');

      jest.runAllTimers();

      expect(setAnswer).toHaveBeenCalledTimes(1);
      expect(setAnswerOptions).toHaveBeenCalledTimes(1);

      expect(setAnswer.mock.calls[0][0]).toEqual([]);
      expect(setAnswerOptions.mock.calls[0][0]).toEqual([{ id: 'id1', value: 'id1' }]);
    });

    it('should update quizee on checkbox value change', () => {
      jest.useFakeTimers();

      const ids = ['id1'];

      const getCurrentQuestion = jest.spyOn(service, 'getCurrentQuestion');
      getCurrentQuestion.mockReturnValue(
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

      const setAnswer = jest.spyOn(service, 'setAnswer');
      const setAnswerOptions = jest.spyOn(service, 'setAnswerOptions');

      component.ngOnInit();
      component.formGroup.get('correctAnswer')?.setValue('id1');

      jest.runAllTimers();

      expect(setAnswer).toHaveBeenCalledTimes(1);
      expect(setAnswerOptions).toHaveBeenCalledTimes(1);

      expect(setAnswer.mock.calls[0][0]).toEqual(['id1']);
      expect(setAnswerOptions.mock.calls[0][0]).toEqual([{ id: 'id1', value: 'id' }]);
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
      const getCurrentQuestion = jest.spyOn(service, 'getCurrentQuestion');
      getCurrentQuestion.mockReturnValue(subject as any);

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
      const getCurrentQuestion = jest.spyOn(service, 'getCurrentQuestion');
      getCurrentQuestion.mockReturnValue(subject as any);

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
      const getCurrentQuestion = jest.spyOn(service, 'getCurrentQuestion');
      getCurrentQuestion.mockReturnValue(subject as any);

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
