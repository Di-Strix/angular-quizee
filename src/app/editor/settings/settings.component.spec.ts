import { ComponentFixture, TestBed } from '@angular/core/testing';

import * as _ from 'lodash';
import { Subject } from 'rxjs';

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
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('question update event filtering', () => {
    let mockQuestionPair: QuestionPair;
    let clear: any;

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
