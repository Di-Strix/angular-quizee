import { Component, Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { AnswerOption, AnswerOptionId } from '@di-strix/quizee-types';

import * as _ from 'lodash';
import { Subscription, filter, throwError } from 'rxjs';
import { QuizeeEditingService } from 'src/app/editor/quizee-editing.service';
import { QuizeeValidators } from 'src/app/editor/quizee-validators';

export interface Control<T> {
  id: AnswerOptionId;
  control: FormControl<T>;
}

export interface Controls<T> extends Array<Control<T>> {}

@Component({ template: '' })
export abstract class SelectiveAnswersBase {
  @Input() questionIndex: number = -1;

  controls: Controls<AnswerOption['value']> = [];
  correctAnswers: AnswerOptionId[] = [];

  subscribeToUpdates(service: QuizeeEditingService, questionIndex: number): Subscription {
    if (questionIndex < 0) return new Subscription();

    return service
      .getQuestion(questionIndex)
      .pipe(
        filter((questionPair) => {
          return (
            !_.isEqual(this.assembleAnswers(), questionPair.answer.answer) ||
            !_.isEqual(this.assembleAnswerOptions(), questionPair.question.answerOptions)
          );
        })
      )
      .subscribe((pair) => {
        pair.question.answerOptions.forEach(({ id: key, value }) => {
          this.controls = this.controls.filter(({ id: controlId }) =>
            pair.question.answerOptions.find(({ id }) => id === controlId)
          );

          const controlObj = this.controls.find(({ id }) => id === key);

          if (!controlObj) {
            const control = new FormControl<AnswerOption['value']>(value, {
              nonNullable: true,
              asyncValidators: [
                QuizeeValidators.forQuestion(
                  service,
                  questionIndex,
                  `question.answerOptions[${pair.question.answerOptions.findIndex(({ id }) => id === key)}].value`
                ),
              ],
            });
            control.markAsTouched();

            this.controls.push({ id: key, control });

            control.valueChanges.subscribe(() => {
              service.setAnswerOptions(questionIndex, this.assembleAnswerOptions());
            });
          } else if (controlObj.control.value !== value) controlObj.control.setValue(value, { emitEvent: false });

          this.correctAnswers = pair.answer.answer;
        });
      });
  }

  protected assembleAnswers(): AnswerOptionId[] {
    return _.compact(this.correctAnswers);
  }

  protected assembleAnswerOptions(): AnswerOption[] {
    return this.controls.reduce((acc, { id, control }) => [...acc, { id, value: control.value }], Array());
  }

  trackByControl(index: number, pair: Control<AnswerOption['value']>) {
    return pair.id;
  }
}
