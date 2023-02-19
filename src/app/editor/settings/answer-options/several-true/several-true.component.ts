import { Component, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { AnswerOptionId } from '@di-strix/quizee-types';

import * as _ from 'lodash';
import { Subscription } from 'rxjs';
import { QuizeeEditingService } from 'src/app/editor/quizee-editing.service';

import { SelectiveAnswersBase } from '../selective-answers-base.component';

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
export class SeveralTrueComponent extends SelectiveAnswersBase implements OnDestroy, OnChanges {
  subs = new Subscription();

  constructor(public quizeeEditingService: QuizeeEditingService) {
    super();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.subs.unsubscribe();
    this.subs = new Subscription();

    if (this.questionIndex < 0) return;

    this.subs.add(this.subscribeToUpdates(this.quizeeEditingService, this.questionIndex));
  }

  setAnswer(id: AnswerOptionId) {
    this.correctAnswers = _.xor(this.correctAnswers, [id]);

    this.quizeeEditingService.setAnswer(this.questionIndex, this.assembleAnswers());
  }

  removeAnswerOption(id: AnswerOptionId) {
    if (this.controls.length <= 1) return;

    this.quizeeEditingService.removeAnswerOption(this.questionIndex, id);
  }

  createAnswerOption() {
    this.quizeeEditingService.addAnswerOption(this.questionIndex);
  }
}
