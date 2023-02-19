import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Answer } from '@di-strix/quizee-types';

import * as _ from 'lodash';
import { Subscription, filter } from 'rxjs';

import { QuizeeEditingService } from '../../quizee-editing.service';
import { QuizeeValidators } from '../../quizee-validators';

type Config = {
  [P in keyof Answer['config']]: FormControl<Answer['config'][P]>;
};

@Component({
  selector: 'app-answer-input',
  templateUrl: './answer-input.component.html',
  styleUrls: ['./answer-input.component.scss'],
})
export class AnswerInputComponent implements OnInit, OnDestroy, OnChanges {
  @Input() questionIndex: number = -1;

  subs = new Subscription();

  answer = new FormControl<Answer['answer'][0]>('', {
    nonNullable: true,
  });
  config = new FormGroup<Config>({ equalCase: new FormControl(false, { nonNullable: true }) });

  constructor(public quizeeEditingService: QuizeeEditingService) {}

  ngOnInit(): void {
    this.answer.markAsTouched();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  ngOnChanges(changes: SimpleChanges) {
    this.updateSubscriptions();
  }

  updateSubscriptions() {
    this.subs.unsubscribe();
    this.subs = new Subscription();
    this.answer.clearAsyncValidators();

    if (this.questionIndex < 0) return;

    this.subs.add(
      this.quizeeEditingService
        .getQuestion(this.questionIndex)
        .pipe(filter((qp) => qp.answer.answer[0] !== this.answer.value))
        .subscribe((qp) => {
          this.answer.setValue(qp.answer.answer[0]);
        })
    );

    this.subs.add(
      this.quizeeEditingService
        .getQuestion(this.questionIndex)
        .pipe(filter((qp) => !_.isEqual(qp.answer.config, this.config.value)))
        .subscribe((qp) => {
          this.config.controls['equalCase'].setValue(qp.answer.config.equalCase);
        })
    );

    this.subs.add(
      this.answer.valueChanges.subscribe((v) => {
        this.quizeeEditingService.setAnswer(this.questionIndex, [v]);
      })
    );

    this.subs.add(
      this.config.valueChanges.subscribe((v) => {
        this.quizeeEditingService.setAnswerConfig(this.questionIndex, v);
      })
    );

    this.answer.setAsyncValidators([
      QuizeeValidators.forQuestion(this.quizeeEditingService, this.questionIndex, 'answer.answer[0]'),
    ]);
    this.answer.updateValueAndValidity({ emitEvent: false });
  }
}
