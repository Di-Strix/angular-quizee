import { Component, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { Answer } from '@di-strix/quizee-types';

import * as _ from 'lodash';
import { Subscription, filter } from 'rxjs';
import { RecursivePartial } from 'src/app/shared/helpers/RecursivePartial';

import { QuizeeEditingService } from '../../quizee-editing.service';
import { QuizeeValidators } from '../../quizee-validators';

type Config = {
  [P in keyof Answer['config']]: UntypedFormControl;
};

@Component({
  selector: 'app-answer-input',
  templateUrl: './answer-input.component.html',
  styleUrls: ['./answer-input.component.scss'],
})
export class AnswerInputComponent implements OnInit, OnDestroy {
  subs = new Subscription();

  answer = new UntypedFormControl(
    '',
    null,
    QuizeeValidators.forCurrentQuestion(this.quizeeEditingService, 'answer.answer[0]')
  );
  config = new UntypedFormGroup({ equalCase: new UntypedFormControl(false) } as Config);

  constructor(public quizeeEditingService: QuizeeEditingService) {}

  ngOnInit(): void {
    this.answer.markAsTouched();

    this.subs.add(
      this.quizeeEditingService
        .getCurrentQuestion()
        .pipe(filter((qp) => qp.answer.answer[0] !== this.answer.value))
        .subscribe((qp) => {
          this.answer.setValue(qp.answer.answer[0]);
        })
    );

    this.subs.add(
      this.quizeeEditingService
        .getCurrentQuestion()
        .pipe(filter((qp) => !_.isEqual(qp.answer.config, this.config.value)))
        .subscribe((qp) => {
          this.config.controls['equalCase'].setValue(qp.answer.config.equalCase);
        })
    );

    this.answer.valueChanges.subscribe((v) => {
      this.quizeeEditingService.setAnswer([v]);
    });

    this.config.valueChanges.subscribe((v: Answer['config']) => {
      this.quizeeEditingService.setAnswerConfig(v);
    });
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
