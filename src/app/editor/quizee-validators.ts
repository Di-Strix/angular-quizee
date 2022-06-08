import { AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { VerificationErrors } from '@di-strix/quizee-verification-functions';

import { Observable, first, map, tap, throwError } from 'rxjs';

import { QuestionPair, QuizeeEditingService } from './quizee-editing.service';

export class QuizeeValidators {
  /**
   * @param path path to object to search errors for. Should look like `prop1.nestedProp2`
   */
  static forQuizee(service: QuizeeEditingService, path: string, once: boolean = true): AsyncValidatorFn {
    return (): Observable<ValidationErrors | null> =>
      service.getQuizeeErrors().pipe(
        once ? first() : tap(() => {}),
        map((errors) => this.filterErrors(errors, path))
      );
  }

  /**
   * @param path path to object to search errors for. Must starts with either 'question' or 'answer' Should look like `prop1.nestedProp2`
   */
  static forCurrentQuestion(service: QuizeeEditingService, fullPath: string, once: boolean = true): AsyncValidatorFn {
    const path: string = fullPath.split('.').slice(1).join('.');
    const forProp = fullPath.split('.').shift() as keyof QuestionPair;
    const allowedProps: (keyof QuestionPair)[] = ['answer', 'question'];

    if (!forProp || !allowedProps.includes(forProp))
      return () => throwError(() => new Error("Path must starts with either 'question' or 'answer'"));

    return () =>
      service.getCurrentQuestionErrors().pipe(
        once ? first() : tap(() => {}),
        map((errors) => this.filterErrors(errors[forProp], path))
      );
  }

  static filterErrors(errors: VerificationErrors, path: string): ValidationErrors | null {
    const err = errors.filter((err) => err.context?.label?.indexOf(path) === 0)[0];
    return err ? { [err.type]: true } : null;
  }
}
