import { ValidationErrors } from '@angular/forms';
import { VerificationErrors } from '@di-strix/quizee-verification-functions';

import { Observable, Subject } from 'rxjs';

import { QuestionPair, QuizeeEditingService } from './quizee-editing.service';
import { QuizeeValidators } from './quizee-validators';

describe('QuizeeValidatorsDirective', () => {
  let service: QuizeeEditingService;
  let next: jest.Mock;
  let error: jest.Mock;

  beforeEach(() => {
    service = new QuizeeEditingService();

    next = jest.fn();
    error = jest.fn();

    jest.useFakeTimers();
  });

  describe('forQuizee', () => {
    it('should call getQuizeeErrors from service', async () => {
      const getQuizeeErrors = jest.spyOn(service, 'getQuizeeErrors');

      QuizeeValidators.forQuizee(service, '')({} as any);

      await jest.runAllTimers();

      expect(getQuizeeErrors).toBeCalledTimes(1);
    });

    it('should take only first value if once = true', async () => {
      const subject = new Subject();
      jest.spyOn(service, 'getQuizeeErrors').mockReturnValue(subject as any);

      (QuizeeValidators.forQuizee(service, '')(null as any) as Observable<ValidationErrors>).subscribe({ next, error });

      subject.next([]);
      subject.next([]);

      await jest.runAllTimers();

      expect(next).toBeCalledTimes(1);
      expect(error).not.toBeCalled();
    });

    it('should take all values value if once = false', async () => {
      const subject = new Subject();
      jest.spyOn(service, 'getQuizeeErrors').mockReturnValue(subject as any);

      (QuizeeValidators.forQuizee(service, '', false)(null as any) as Observable<ValidationErrors>).subscribe({
        next,
        error,
      });

      subject.next([]);
      subject.next([]);

      await jest.runAllTimers();

      expect(next).toBeCalledTimes(2);
      expect(error).not.toBeCalled();
    });

    it('should filter errors by path', async () => {
      const errors: VerificationErrors = [
        {
          message: '',
          path: [],
          type: 'type1',
          context: { label: 'path1' },
        },
        {
          message: '',
          path: [],
          type: 'type2',
          context: { label: 'path2' },
        },
      ];

      const subject = new Subject();
      jest.spyOn(service, 'getQuizeeErrors').mockReturnValue(subject as any);

      (QuizeeValidators.forQuizee(service, 'path2')(null as any) as Observable<typeof errors>).subscribe({
        next,
        error,
      });

      subject.next(errors);

      await jest.runAllTimers();

      expect(next).toBeCalledWith({ type2: true });
      expect(error).not.toBeCalled();
    });

    it('should return null if no errors by path', async () => {
      const errors: VerificationErrors = [
        {
          message: '',
          path: [],
          type: 'type1',
          context: { label: 'path1' },
        },
        {
          message: '',
          path: [],
          type: 'type2',
          context: { label: 'path2' },
        },
      ];

      const subject = new Subject();
      jest.spyOn(service, 'getQuizeeErrors').mockReturnValue(subject as any);

      (QuizeeValidators.forQuizee(service, 'path3')(null as any) as Observable<typeof errors>).subscribe({
        next,
        error,
      });

      subject.next(errors);

      await jest.runAllTimers();

      expect(next).toBeCalledWith(null);
      expect(error).not.toBeCalled();
    });

    it('should not throw if context is undefined', async () => {
      const errors: VerificationErrors = [
        {
          message: '',
          path: [],
          type: 'type1',
        },
        {
          message: '',
          path: [],
          type: 'type2',
        },
      ];

      const subject = new Subject();
      jest.spyOn(service, 'getQuizeeErrors').mockReturnValue(subject as any);

      (QuizeeValidators.forQuizee(service, 'path2')(null as any) as Observable<typeof errors>).subscribe({
        next,
        error,
      });

      subject.next(errors);

      await jest.runAllTimers();

      expect(next).toBeCalledWith(null);
      expect(error).not.toBeCalled();
    });
  });

  describe('forCurrentQuestion', () => {
    it('should call getCurrentQuestionErrors from service', async () => {
      const getCurrentQuestionErrors = jest.spyOn(service, 'getCurrentQuestionErrors');

      QuizeeValidators.forCurrentQuestion(service, 'question')({} as any);

      await jest.runAllTimers();

      expect(getCurrentQuestionErrors).toBeCalledTimes(1);
    });

    it('should take only first value if once = true', async () => {
      const subject = new Subject();
      jest.spyOn(service, 'getCurrentQuestionErrors').mockReturnValue(subject as any);

      (
        QuizeeValidators.forCurrentQuestion(service, 'answer', true)(null as any) as Observable<ValidationErrors>
      ).subscribe({
        next,
        error,
      });

      subject.next({ answer: [], question: [] });
      subject.next({ answer: [], question: [] });

      await jest.runAllTimers();

      expect(next).toBeCalledTimes(1);
      expect(error).not.toBeCalled();
    });

    it('should take all values if once = false', async () => {
      const subject = new Subject();
      jest.spyOn(service, 'getCurrentQuestionErrors').mockReturnValue(subject as any);

      (
        QuizeeValidators.forCurrentQuestion(service, 'answer', false)(null as any) as Observable<ValidationErrors>
      ).subscribe({
        next,
        error,
      });

      subject.next({ answer: [], question: [] });
      subject.next({ answer: [], question: [] });

      await jest.runAllTimers();

      expect(next).toBeCalledTimes(2);
      expect(error).not.toBeCalled();
    });

    it('should filter errors by path', async () => {
      let errors: { [K in keyof Omit<QuestionPair, 'index'>]: VerificationErrors } = {
        answer: [{ context: { label: '' }, message: '', path: [], type: 'type1' }],
        question: [],
      };

      const subject = new Subject();
      jest.spyOn(service, 'getCurrentQuestionErrors').mockReturnValue(subject as any);

      (QuizeeValidators.forCurrentQuestion(service, 'answer')(null as any) as Observable<typeof errors>).subscribe({
        next,
        error,
      });

      subject.next(errors);

      await jest.runAllTimers();

      expect(next).toBeCalledWith({ type1: true });
      expect(error).not.toBeCalled();

      errors = {
        answer: [],
        question: [
          {
            message: '',
            path: [],
            type: 'type1',
            context: { label: 'path1' },
          },
          {
            message: '',
            path: [],
            type: 'type2',
            context: { label: 'path2' },
          },
        ],
      };

      (
        QuizeeValidators.forCurrentQuestion(service, 'question.path2')(null as any) as Observable<typeof errors>
      ).subscribe({
        next,
        error,
      });

      subject.next(errors);

      await jest.runAllTimers();

      expect(next).toBeCalledWith({ type2: true });
      expect(error).not.toBeCalled();
    });

    it('should throw if first part of path is invalid', async () => {
      let errors: { [K in keyof Omit<QuestionPair, 'index'>]: VerificationErrors } = {
        answer: [{ context: { label: '' }, message: '', path: [], type: 'type1' }],
        question: [],
      };

      const subject = new Subject();
      jest.spyOn(service, 'getCurrentQuestionErrors').mockReturnValue(subject as any);

      (
        QuizeeValidators.forCurrentQuestion(service, 'anotherValue.nestedPath')(null as any) as Observable<
          typeof errors
        >
      ).subscribe({
        next,
        error,
      });

      subject.next(errors);

      await jest.runAllTimers();

      expect(next).not.toBeCalled();
      expect(error).toBeCalled();
    });

    it('should return null if no errors by path', async () => {
      const errors: { [K in keyof Omit<QuestionPair, 'index'>]: VerificationErrors } = {
        answer: [
          {
            message: '',
            path: [],
            type: 'type1',
            context: { label: 'path1' },
          },
        ],
        question: [
          {
            message: '',
            path: [],
            type: 'type2',
            context: { label: 'path2' },
          },
        ],
      };

      const subject = new Subject();
      jest.spyOn(service, 'getCurrentQuestionErrors').mockReturnValue(subject as any);

      (
        QuizeeValidators.forCurrentQuestion(service, 'answer.path3')(null as any) as Observable<typeof errors>
      ).subscribe({
        next,
        error,
      });

      subject.next(errors);

      await jest.runAllTimers();

      expect(next).toBeCalledWith(null);
      expect(error).not.toBeCalled();
    });

    it('should not throw if context is undefined', async () => {
      const errors: { [K in keyof Omit<QuestionPair, 'index'>]: VerificationErrors } = {
        answer: [
          {
            message: '',
            path: [],
            type: 'type1',
          },
        ],
        question: [
          {
            message: '',
            path: [],
            type: 'type2',
          },
        ],
      };
      const subject = new Subject();
      jest.spyOn(service, 'getCurrentQuestionErrors').mockReturnValue(subject as any);

      (
        QuizeeValidators.forCurrentQuestion(service, 'answer.path2')(null as any) as Observable<typeof errors>
      ).subscribe({
        next,
        error,
      });

      subject.next(errors);

      await jest.runAllTimers();

      expect(next).toBeCalledWith(null);
      expect(error).not.toBeCalled();
    });
  });

  describe('forQuestion', () => {
    it('should call getQuestionErrors with provided index from service', async () => {
      const getQuestion = jest.spyOn(service, 'getQuestionErrors');

      QuizeeValidators.forQuestion(service, 2, 'question')({} as any);

      await jest.runAllTimers();

      expect(getQuestion).toBeCalledTimes(1);
      expect(getQuestion).toBeCalledWith(2);
    });

    it('should take only first value if once = true', async () => {
      const subject = new Subject();
      jest.spyOn(service, 'getQuestionErrors').mockReturnValue(subject as any);

      (QuizeeValidators.forQuestion(service, 1, 'answer', true)(null as any) as Observable<ValidationErrors>).subscribe(
        {
          next,
          error,
        }
      );

      subject.next({ answer: [], question: [] });
      subject.next({ answer: [], question: [] });

      await jest.runAllTimers();

      expect(next).toBeCalledTimes(1);
      expect(error).not.toBeCalled();
    });

    it('should take all values if once = false', async () => {
      const subject = new Subject();
      jest.spyOn(service, 'getQuestionErrors').mockReturnValue(subject as any);

      (
        QuizeeValidators.forQuestion(service, 2, 'answer', false)(null as any) as Observable<ValidationErrors>
      ).subscribe({
        next,
        error,
      });

      subject.next({ answer: [], question: [] });
      subject.next({ answer: [], question: [] });

      await jest.runAllTimers();

      expect(next).toBeCalledTimes(2);
      expect(error).not.toBeCalled();
    });

    it('should filter errors by path', async () => {
      let errors: { [K in keyof Omit<QuestionPair, 'index'>]: VerificationErrors } = {
        answer: [{ context: { label: '' }, message: '', path: [], type: 'type1' }],
        question: [],
      };

      const subject = new Subject();
      jest.spyOn(service, 'getQuestionErrors').mockReturnValue(subject as any);

      (QuizeeValidators.forQuestion(service, 2, 'answer')(null as any) as Observable<typeof errors>).subscribe({
        next,
        error,
      });

      subject.next(errors);

      await jest.runAllTimers();

      expect(next).toBeCalledWith({ type1: true });
      expect(error).not.toBeCalled();

      errors = {
        answer: [],
        question: [
          {
            message: '',
            path: [],
            type: 'type1',
            context: { label: 'path1' },
          },
          {
            message: '',
            path: [],
            type: 'type2',
            context: { label: 'path2' },
          },
        ],
      };

      (QuizeeValidators.forQuestion(service, 2, 'question.path2')(null as any) as Observable<typeof errors>).subscribe({
        next,
        error,
      });

      subject.next(errors);

      await jest.runAllTimers();

      expect(next).toBeCalledWith({ type2: true });
      expect(error).not.toBeCalled();
    });

    it('should throw if first part of path is invalid', async () => {
      let errors: { [K in keyof Omit<QuestionPair, 'index'>]: VerificationErrors } = {
        answer: [{ context: { label: '' }, message: '', path: [], type: 'type1' }],
        question: [],
      };

      const subject = new Subject();
      jest.spyOn(service, 'getQuestionErrors').mockReturnValue(subject as any);

      (
        QuizeeValidators.forQuestion(service, 2, 'anotherValue.nestedPath')(null as any) as Observable<typeof errors>
      ).subscribe({
        next,
        error,
      });

      subject.next(errors);

      await jest.runAllTimers();

      expect(next).not.toBeCalled();
      expect(error).toBeCalled();
    });

    it('should return null if no errors by path', async () => {
      const errors: { [K in keyof Omit<QuestionPair, 'index'>]: VerificationErrors } = {
        answer: [
          {
            message: '',
            path: [],
            type: 'type1',
            context: { label: 'path1' },
          },
        ],
        question: [
          {
            message: '',
            path: [],
            type: 'type2',
            context: { label: 'path2' },
          },
        ],
      };

      const subject = new Subject();
      jest.spyOn(service, 'getQuestionErrors').mockReturnValue(subject as any);

      (QuizeeValidators.forQuestion(service, 2, 'answer.path3')(null as any) as Observable<typeof errors>).subscribe({
        next,
        error,
      });

      subject.next(errors);

      await jest.runAllTimers();

      expect(next).toBeCalledWith(null);
      expect(error).not.toBeCalled();
    });

    it('should not throw if context is undefined', async () => {
      const errors: { [K in keyof Omit<QuestionPair, 'index'>]: VerificationErrors } = {
        answer: [
          {
            message: '',
            path: [],
            type: 'type1',
          },
        ],
        question: [
          {
            message: '',
            path: [],
            type: 'type2',
          },
        ],
      };
      const subject = new Subject();
      jest.spyOn(service, 'getQuestionErrors').mockReturnValue(subject as any);

      (QuizeeValidators.forQuestion(service, 2, 'answer.path2')(null as any) as Observable<typeof errors>).subscribe({
        next,
        error,
      });

      subject.next(errors);

      await jest.runAllTimers();

      expect(next).toBeCalledWith(null);
      expect(error).not.toBeCalled();
    });
  });
});
