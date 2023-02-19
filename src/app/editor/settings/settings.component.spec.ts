import { ComponentFixture, TestBed } from '@angular/core/testing';

import * as _ from 'lodash';
import { Subject, of } from 'rxjs';

import { EditorModule } from '../editor.module';
import { QuestionPair, QuizeeEditingService } from '../quizee-editing.service';

import { SettingsComponent } from './settings.component';

describe('SettingsComponent', () => {
  let component: SettingsComponent;
  let fixture: ComponentFixture<SettingsComponent>;
  let service: QuizeeEditingService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SettingsComponent],
      imports: [EditorModule],
      providers: [QuizeeEditingService],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SettingsComponent);
    component = fixture.componentInstance;
    service = TestBed.inject(QuizeeEditingService);

    jest.useFakeTimers();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('onInit', () => {
    it('should subscribe to current question if questionIndex is not set', async () => {
      const subject = new Subject();
      jest.spyOn(service, 'getCurrentQuestion').mockReturnValue(subject as any);

      component.ngOnInit();

      await jest.runAllTimers();

      expect(subject.observed).toBeTruthy();
    });

    it('should subscribe to specified question if questionIndex is set', async () => {
      const subject = new Subject();
      const getQuestion = jest.spyOn(service, 'getQuestion').mockReturnValue(subject as any);

      component.questionIndex = 1;
      component.ngOnInit();

      await jest.runAllTimers();

      expect(subject.observed).toBeTruthy();
      expect(getQuestion).toBeCalledWith(1);
    });
  });

  describe('onChanges', () => {
    it('should subscribe to current question if questionIndex is not set', async () => {
      const subject = new Subject();
      jest.spyOn(service, 'getCurrentQuestion').mockReturnValue(subject as any);

      component.ngOnChanges({ questionIndex: {} } as any);

      await jest.runAllTimers();

      expect(subject.observed).toBeTruthy();
    });

    it('should subscribe to specified question if questionIndex is set', async () => {
      const subject = new Subject();
      const getQuestion = jest.spyOn(service, 'getQuestion').mockReturnValue(subject as any);

      component.questionIndex = 1;
      component.ngOnChanges({ questionIndex: {} } as any);

      await jest.runAllTimers();

      expect(subject.observed).toBeTruthy();
      expect(getQuestion).toBeCalledWith(1);
    });

    it('should cancel previous subscription', async () => {
      const subject = new Subject();
      const getQuestion = jest.spyOn(service, 'getQuestion').mockReturnValue(subject as any);

      component.questionIndex = 1;
      component.ngOnChanges({ questionIndex: {} } as any);

      await jest.runAllTimers();

      component.questionIndex = -1;
      component.ngOnChanges({ questionIndex: {} } as any);

      await jest.runAllTimers();

      getQuestion.mockReturnValue(of());
      component.questionIndex = 2;
      component.ngOnChanges({ questionIndex: {} } as any);

      await jest.runAllTimers();

      expect(subject.observed).toBeFalsy();
    });
  });

  describe('question update event filtering', () => {
    let mockQuestionPair: QuestionPair;
    let clear: any;

    beforeEach(() => {
      mockQuestionPair = {
        answer: { answer: [], answerTo: 'question id', config: { equalCase: false } },
        question: {
          answerOptions: [],
          caption: '',
          id: 'question id',
          type: 'SEVERAL_TRUE',
        },
        index: 0,
      };

      clear = jest.spyOn(component.container.viewContainerRef, 'clear');
    });

    it('should not update if question id and question type are the same', () => {
      const subject = new Subject();

      const getCurrentQuestion = jest.spyOn(service, 'getCurrentQuestion');
      getCurrentQuestion.mockReturnValue(subject as any);

      component.ngOnInit();
      subject.next(_.cloneDeep(mockQuestionPair));

      jest.runAllTimers();

      mockQuestionPair.answer.answer.push('1');
      mockQuestionPair.question.answerOptions.push({ id: '1', value: '2' });
      subject.next(mockQuestionPair);

      jest.runAllTimers();

      expect(clear).toBeCalledTimes(1);
    });

    it('should update if question type is different', () => {
      const subject = new Subject();

      const getCurrentQuestion = jest.spyOn(service, 'getCurrentQuestion');
      getCurrentQuestion.mockReturnValue(subject as any);

      component.ngOnInit();
      subject.next(_.cloneDeep(mockQuestionPair));

      jest.runAllTimers();

      mockQuestionPair.question.type = 'ONE_TRUE';
      subject.next(_.cloneDeep(mockQuestionPair));

      jest.runAllTimers();

      expect(clear).toBeCalledTimes(2);
    });
  });
});
