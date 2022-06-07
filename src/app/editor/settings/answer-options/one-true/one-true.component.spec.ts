import { ComponentFixture, TestBed } from '@angular/core/testing';

import * as _ from 'lodash';
import { EditorModule } from 'src/app/editor/editor.module';
import { QuizeeEditingService } from 'src/app/editor/quizee-editing.service';

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

    jest.useFakeTimers();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call subscribeToUpdates', () => {
    const subscribeToUpdates = jest.spyOn(component, 'subscribeToUpdates');

    component.ngOnInit();

    expect(subscribeToUpdates).toBeCalledTimes(1);
  });

  describe('remove answer option', () => {
    it('should not remove answer option if it is the last one', () => {
      const removeAnswerOption = jest.spyOn(service, 'removeAnswerOption');
      component.controls = [{ id: '1', control: {} as any }];
      component.removeAnswerOption('1');

      jest.runAllTimers();

      expect(removeAnswerOption).not.toHaveBeenCalled();
    });

    it('should prompt service to remove answer option with provided id', () => {
      const removeAnswerOption = jest.spyOn(service, 'removeAnswerOption');
      component.controls = [
        { id: '1', control: {} as any },
        { id: '2', control: {} as any },
      ];
      component.removeAnswerOption('1');

      jest.runAllTimers();

      expect(removeAnswerOption).toHaveBeenCalledTimes(1);
      expect(removeAnswerOption).toHaveBeenCalledWith('1');
    });
  });

  describe('createAnswerOption', () => {
    it('should prompt service to create answer option', () => {
      const addAnswerOption = jest.spyOn(service, 'addAnswerOption');
      component.createAnswerOption();

      jest.runAllTimers();

      expect(addAnswerOption).toHaveBeenCalledTimes(1);
    });
  });

  describe('setAnswer', () => {
    it('should allow only one correct answer', () => {
      component.setAnswer('1');
      component.setAnswer('2');
      component.setAnswer('3');

      expect(component.correctAnswers).toEqual(['3']);
    });

    it('should push answer to service', () => {
      const setAnswer = jest.spyOn(service, 'setAnswer');

      component.setAnswer('1');

      expect(setAnswer).toBeCalledTimes(1);
      expect(setAnswer).toBeCalledWith(['1']);
    });
  });
});
