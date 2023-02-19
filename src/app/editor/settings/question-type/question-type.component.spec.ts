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

  describe('onChanges', () => {
    it('should subscribe on question with provided index', async () => {
      const subject = new Subject();
      jest.spyOn(service, 'getQuestion').mockReturnValue(subject as any);

      component.questionIndex = 1;
      component.ngOnChanges({});

      await jest.runAllTimers();

      expect(subject.observed).toBeTruthy();
    });

    it('should unsubscribe from previous question', async () => {
      const subject = new Subject();
      const getQuestion = jest.spyOn(service, 'getQuestion').mockReturnValue(subject as any);

      component.questionIndex = 1;
      component.ngOnChanges({});

      await jest.runAllTimers();

      getQuestion.mockReset();
      getQuestion.mockReturnValue(of());

      component.questionIndex = 2;
      component.ngOnChanges({});

      await jest.runAllTimers();

      expect(subject.observed).toBeFalsy();
    });

    it('should subscribe to new question with provided index', async () => {
      const subject = new Subject();
      const getQuestion = jest.spyOn(service, 'getQuestion').mockReturnValue(of());

      component.questionIndex = 1;
      component.ngOnChanges({});

      await jest.runAllTimers();

      getQuestion.mockReset();
      getQuestion.mockReturnValue(subject as any);

      component.questionIndex = 2;
      component.ngOnChanges({});

      await jest.runAllTimers();

      expect(subject.observed).toBeTruthy();
    });

    it('should not subscribe if provided index is negative', async () => {
      const subject1 = new Subject();
      const subject2 = new Subject();
      const getQuestion = jest.spyOn(service, 'getQuestion').mockReturnValue(subject1 as any);

      component.questionIndex = 1;
      component.ngOnChanges({});

      await jest.runAllTimers();

      getQuestion.mockReset();
      getQuestion.mockReturnValue(subject2 as any);

      component.questionIndex = -1;
      component.ngOnChanges({});

      await jest.runAllTimers();

      expect(subject1.observed).toBeFalsy();
      expect(subject2.observed).toBeFalsy();
    });
  });

  describe('input value change', () => {
    it('should update provided question on input value change', async () => {
      const getQuestion = jest.spyOn(service, 'getQuestion');
      getQuestion.mockReturnValue(of({ question: { type: 'ONE_TRUE' } } as any));

      const setQuestionType = jest.spyOn(service, 'setQuestionType');

      component.questionIndex = 1;
      component.ngOnChanges({});

      await jest.runAllTimers();

      component.questionType.setValue('SEVERAL_TRUE');

      await jest.runAllTimers();

      expect(setQuestionType).toBeCalledTimes(1);
      expect(setQuestionType).toBeCalledWith(1, 'SEVERAL_TRUE');
    });
  });

  describe('question type value change', () => {
    it('should update input value if its value differs', async () => {
      const subject = new Subject();
      const getQuestion = jest.spyOn(service, 'getQuestion');
      getQuestion.mockReturnValue(subject as any);

      const setValue = jest.spyOn(component.questionType, 'setValue');

      component.questionIndex = 1;
      component.ngOnChanges({});

      await jest.runAllTimers();

      subject.next({ question: { type: 'WRITE_ANSWER' } });

      await jest.runAllTimers();

      subject.next({ question: { type: 'SEVERAL_TRUE' } });

      await jest.runAllTimers();

      expect(setValue).toBeCalledTimes(2);
      expect(setValue).toHaveBeenNthCalledWith(1, 'WRITE_ANSWER');
      expect(setValue).toHaveBeenNthCalledWith(2, 'SEVERAL_TRUE');
    });

    it('should not update input value if it is the same', async () => {
      const subject = new Subject();
      const getQuestion = jest.spyOn(service, 'getQuestion');
      getQuestion.mockReturnValue(subject as any);

      const setValue = jest.spyOn(component.questionType, 'setValue');

      component.questionIndex = 1;
      component.ngOnChanges({});

      await jest.runAllTimers();

      subject.next({ question: { type: 'WRITE_ANSWER' } });

      await jest.runAllTimers();

      subject.next({ question: { type: 'WRITE_ANSWER' } });

      expect(setValue).toBeCalledTimes(1);
      expect(setValue).toHaveBeenNthCalledWith(1, 'WRITE_ANSWER');
    });
  });
});
