import { Component } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { AnswerOption, AnswerOptionId } from '@di-strix/quizee-types';

import * as _ from 'lodash';
import { Subscription, filter } from 'rxjs';
import { QuizeeEditingService } from 'src/app/editor/quizee-editing.service';
import { QuizeeValidators } from 'src/app/editor/quizee-validators';

export interface Control {
  id: AnswerOptionId;
  control: UntypedFormControl;
}

export interface Controls extends Array<Control> {}

@Component({ template: '' })
export abstract class SelectiveAnswersBase {
  controls: Controls = [];
  correctAnswers: AnswerOptionId[] = [];

  subscribeToUpdates(service: QuizeeEditingService): Subscription {
    return service
      .getCurrentQuestion()
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
            const control = new UntypedFormControl(
              value,
              null,
              QuizeeValidators.forCurrentQuestion(
                service,
                `question.answerOptions[${pair.question.answerOptions.findIndex(({ id }) => id === key)}].value`
              )
            );
            control.markAsTouched();

            this.controls.push({ id: key, control });

            control.valueChanges.subscribe(() => {
              service.setAnswerOptions(this.assembleAnswerOptions());
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

  trackByControl(index: number, pair: Control) {
    return pair.id;
  }
}
