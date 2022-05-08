import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AnswerOption, AnswerOptionId } from '@di-strix/quizee-types';

import * as _ from 'lodash';
import { Subscription, filter } from 'rxjs';
import { QuizeeEditingService } from 'src/app/editor/quizee-editing.service';

export interface OneTrueAnswerOptionForm {
  correctAnswer: string;
  values: {
    [key: string]: string;
  };
}

@Component({
  selector: 'app-one-true',
  templateUrl: './one-true.component.html',
  styleUrls: ['./one-true.component.scss'],
})
export class OneTrueComponent implements OnInit, OnDestroy {
  ids: AnswerOptionId[] = [];
  formGroup!: FormGroup;

  subs = new Subscription();

  constructor(public quizeeEditingService: QuizeeEditingService) {}

  ngOnInit(): void {
    this.subs.add(
      this.quizeeEditingService
        .getCurrentQuestion()
        .pipe(
          filter((questionPair) => {
            if (!this.formGroup) return true;

            return (
              !_.isEqual(this.assembleAnswers(this.formGroup.value), questionPair.answer.answer) ||
              !_.isEqual(this.assembleAnswerOptions(this.formGroup.value), questionPair.question.answerOptions)
            );
          })
        )
        .subscribe((pair) => {
          this.ids = [];
          this.formGroup = new FormGroup({});
          this.formGroup.addControl('correctAnswer', new FormControl(pair.answer.answer[0] || ''));
          const valuesGroup = new FormGroup({});

          this.ids = pair.question.answerOptions.map((answerOption) => {
            valuesGroup.addControl(answerOption.id, new FormControl(answerOption.value, [Validators.required]));
            return answerOption.id;
          });

          this.formGroup.addControl('values', valuesGroup);

          this.formGroup.valueChanges.subscribe((object: OneTrueAnswerOptionForm) => {
            this.quizeeEditingService.setAnswer(this.assembleAnswers(object));
            this.quizeeEditingService.setAnswerOptions(this.assembleAnswerOptions(object));
          });
        })
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  private assembleAnswers(object: OneTrueAnswerOptionForm): AnswerOptionId[] {
    return _.compact([object.correctAnswer]);
  }

  private assembleAnswerOptions(object: OneTrueAnswerOptionForm): AnswerOption[] {
    return Object.keys(object.values).reduce((acc, key) => [...acc, { id: key, value: object.values[key] }], Array());
  }
}
