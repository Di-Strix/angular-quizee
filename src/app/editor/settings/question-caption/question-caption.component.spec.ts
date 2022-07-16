import { Subject, of } from 'rxjs';

import { QuizeeEditingService } from '../../quizee-editing.service';

import { QuestionCaptionComponent } from './question-caption.component';

describe('QuestionCaptionComponent', () => {
  let component: QuestionCaptionComponent;
  let service: QuizeeEditingService;

  beforeEach(() => {
    service = new QuizeeEditingService();
    component = new QuestionCaptionComponent(service);

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
      getCurrentQuestion.mockReturnValue(of({ question: { caption: '' } } as any));

      const modifyCurrentQuestion = jest.spyOn(service, 'modifyCurrentQuestion');

      component.ngOnInit();
      component.questionCaption.setValue('abc');

      await jest.runAllTimers();

      expect(modifyCurrentQuestion).toHaveBeenCalledTimes(1);
      expect(modifyCurrentQuestion).toHaveBeenCalledWith({ question: { caption: 'abc' } });
    });
  });

  describe('question caption value change', () => {
    it('should update input value if its value differs', async () => {
      const subject = new Subject();
      const getCurrentQuestion = jest.spyOn(service, 'getCurrentQuestion');
      getCurrentQuestion.mockReturnValue(subject as any);

      const setValue = jest.spyOn(component.questionCaption, 'setValue');

      component.ngOnInit();
      subject.next({ question: { caption: 'abc' } });

      await jest.runAllTimers();

      subject.next({ question: { caption: 'abc123' } });

      expect(setValue).toBeCalledTimes(2);
      expect(setValue.mock.calls[0][0]).toBe('abc');
      expect(setValue.mock.calls[1][0]).toBe('abc123');
    });

    it('should not update input value if it is the same', async () => {
      const subject = new Subject();
      const getCurrentQuestion = jest.spyOn(service, 'getCurrentQuestion');
      getCurrentQuestion.mockReturnValue(subject as any);

      const setValue = jest.spyOn(component.questionCaption, 'setValue');

      component.ngOnInit();
      subject.next({ question: { caption: 'abc' } });

      await jest.runAllTimers();

      subject.next({ question: { caption: 'abc' } });

      expect(setValue).toBeCalledTimes(1);
      expect(setValue.mock.calls[0][0]).toBe('abc');
    });
  });
});
