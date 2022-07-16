import { Subject, of } from 'rxjs';

import { QuizeeEditingService } from '../../quizee-editing.service';

import { QuestionTypeComponent } from './question-type.component';

describe('QuestionTypeComponent', () => {
  let component: QuestionTypeComponent;
  let service: QuizeeEditingService;

  beforeEach(() => {
    service = new QuizeeEditingService();
    component = new QuestionTypeComponent(service);

    jest.useFakeTimers();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should subscribe to current question', async () => {
    const getCurrentQuestion = jest.spyOn(service, 'getCurrentQuestion');
    getCurrentQuestion.mockReturnValue(of());

    component.ngOnInit();

    await jest.runAllTimers();

    expect(getCurrentQuestion).toHaveBeenCalled();
  });

  describe('input value change', () => {
    it('should update quizee on input value change', async () => {
      const getCurrentQuestion = jest.spyOn(service, 'getCurrentQuestion');
      getCurrentQuestion.mockReturnValue(of({ question: { type: 'ONE_TRUE' } } as any));

      const setQuestionType = jest.spyOn(service, 'setQuestionType');

      component.ngOnInit();
      component.questionType.setValue('SEVERAL_TRUE');

      await jest.runAllTimers();

      expect(setQuestionType).toHaveBeenCalledTimes(1);
      expect(setQuestionType).toHaveBeenCalledWith('SEVERAL_TRUE');
    });
  });

  describe('question type value change', () => {
    it('should update input value if its value differs', async () => {
      const subject = new Subject();
      const getCurrentQuestion = jest.spyOn(service, 'getCurrentQuestion');
      getCurrentQuestion.mockReturnValue(subject as any);

      const setValue = jest.spyOn(component.questionType, 'setValue');

      component.ngOnInit();
      subject.next({ question: { type: 'ONE_TRUE' } });

      await jest.runAllTimers();

      subject.next({ question: { type: 'SEVERAL_TRUE' } });

      expect(setValue).toBeCalledTimes(2);
      expect(setValue.mock.calls[0][0]).toBe('ONE_TRUE');
      expect(setValue.mock.calls[1][0]).toBe('SEVERAL_TRUE');
    });

    it('should not update input value if it is the same', async () => {
      const subject = new Subject();
      const getCurrentQuestion = jest.spyOn(service, 'getCurrentQuestion');
      getCurrentQuestion.mockReturnValue(subject as any);

      const setValue = jest.spyOn(component.questionType, 'setValue');

      component.ngOnInit();
      subject.next({ question: { type: 'ONE_TRUE' } });

      await jest.runAllTimers();

      subject.next({ question: { type: 'ONE_TRUE' } });

      expect(setValue).toBeCalledTimes(1);
      expect(setValue.mock.calls[0][0]).toBe('ONE_TRUE');
    });
  });
});
