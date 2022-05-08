import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AnswerOption, AnswerOptionId } from '@di-strix/quizee-types';

import * as _ from 'lodash';
import { Subscription, filter } from 'rxjs';
import { QuizeeEditingService } from 'src/app/editor/quizee-editing.service';

export interface SeveralTrueAnswerOptionForm {
  [key: string]: {
    value: string;
    isCorrect: boolean;
  };
}

@Component({
  selector: 'app-several-true',
  templateUrl: './several-true.component.html',
  styleUrls: ['./several-true.component.scss'],
})
export class SeveralTrueComponent implements OnInit, OnDestroy {
  ids: AnswerOptionId[] = [];
  formGroup = new FormGroup({});

  subs = new Subscription();

  constructor(public quizeeEditingService: QuizeeEditingService) {}

  ngOnInit(): void {
    this.subs.add(
      this.quizeeEditingService
        .getCurrentQuestion()
        .pipe(
          filter((questionPair) => {
            return (
              !_.isEqual(this.assembleAnswers(this.formGroup.value), questionPair.answer.answer) ||
              !_.isEqual(this.assembleAnswerOptions(this.formGroup.value), questionPair.question.answerOptions)
            );
          })
        )
        .subscribe((pair) => {
          this.ids = [];
          this.formGroup = new FormGroup({});

          this.ids = pair.question.answerOptions.map((answerOption) => {
            const questionFormGroup = new FormGroup({
              value: new FormControl(answerOption.value, [Validators.required]),
              isCorrect: new FormControl(pair.answer.answer.includes(answerOption.id)),
            });
            this.formGroup.addControl(answerOption.id, questionFormGroup);

            return answerOption.id;
          });

          this.formGroup.valueChanges.subscribe((object: SeveralTrueAnswerOptionForm) => {
            this.quizeeEditingService.setAnswer(this.assembleAnswers(object));
            this.quizeeEditingService.setAnswerOptions(this.assembleAnswerOptions(object));
          });
        })
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  private assembleAnswers(object: SeveralTrueAnswerOptionForm): AnswerOptionId[] {
    return Object.keys(object).reduce((acc, key) => (object[key].isCorrect ? [...acc, key] : acc), Array());
  }

  private assembleAnswerOptions(object: SeveralTrueAnswerOptionForm): AnswerOption[] {
    return Object.keys(object).reduce((acc, key) => [...acc, { id: key, value: object[key].value }], Array());
  }
}
