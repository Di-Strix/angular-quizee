import { AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { VerificationErrors } from '@di-strix/quizee-verification-functions';

import { Observable, first, map } from 'rxjs';

import { QuestionPair, QuizeeEditingService } from './quizee-editing.service';

export class QuizeeValidators {
  /**
   * @param path path to object to search errors for. Should look like `prop1.nestedProp2`
   */
  static forQuizee(service: QuizeeEditingService, path: string): AsyncValidatorFn {
    return (): Observable<ValidationErrors | null> =>
      service.getQuizeeErrors().pipe(
        first(),
        map((errors) => this.filterErrors(errors, path))
      );
  }

  /**
   * @param path path to object to search errors for. Should look like `prop1.nestedProp2`
   */
  static forCurrentQuestion(
    service: QuizeeEditingService,
    forProp: keyof QuestionPair,
    path: string
  ): AsyncValidatorFn {
    return () =>
      service.getCurrentQuestionErrors().pipe(
        first(),
        map((errors) => this.filterErrors(errors[forProp], path))
      );
  }

  private static filterErrors(errors: VerificationErrors, path: string): ValidationErrors | null {
    const err = errors.filter((err) => err.context?.label === path)[0];
    return err ? { [err.type]: true } : null;
  }
}
