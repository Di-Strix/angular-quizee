import { Component, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { AnswerOptionId } from '@di-strix/quizee-types';

import * as _ from 'lodash';
import { Subscription } from 'rxjs';
import { QuizeeEditingService } from 'src/app/editor/quizee-editing.service';

import { SelectiveAnswersBase } from '../selective-answers-base.component';

@Component({
  selector: 'app-one-true',
  templateUrl: './one-true.component.html',
  styleUrls: ['./one-true.component.scss'],
})
export class OneTrueComponent extends SelectiveAnswersBase implements OnDestroy, OnChanges {
  subs = new Subscription();

  constructor(private quizeeEditingService: QuizeeEditingService) {
    super();
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  ngOnChanges(changes: SimpleChanges) {
    this.subs.unsubscribe();
    this.subs = new Subscription();

    if (this.questionIndex < 0) return;

    this.subs.add(this.subscribeToUpdates(this.quizeeEditingService, this.questionIndex));
  }

  setAnswer(id: AnswerOptionId) {
    this.correctAnswers = [id];
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
