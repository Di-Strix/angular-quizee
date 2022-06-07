import { Component, OnDestroy, OnInit } from '@angular/core';
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
export class OneTrueComponent extends SelectiveAnswersBase implements OnInit, OnDestroy {
  subs = new Subscription();

  constructor(private quizeeEditingService: QuizeeEditingService) {
    super();
  }

  ngOnInit() {
    this.subs.add(this.subscribeToUpdates(this.quizeeEditingService));
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  setAnswer(id: AnswerOptionId) {
    this.correctAnswers = [id];
    this.quizeeEditingService.setAnswer(this.assembleAnswers());
  }

  removeAnswerOption(id: AnswerOptionId) {
    if (this.controls.length <= 1) return;

    this.quizeeEditingService.removeAnswerOption(id);
  }

  createAnswerOption() {
    this.quizeeEditingService.addAnswerOption();
  }
}
