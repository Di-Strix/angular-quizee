import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { AnswerOption, AnswerOptionId } from '@di-strix/quizee-types';

import * as _ from 'lodash';
import { Subscription, filter } from 'rxjs';
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
export class SeveralTrueComponent extends SelectiveAnswersBase implements OnInit, OnDestroy {
  subs = new Subscription();

  constructor(public quizeeEditingService: QuizeeEditingService) {
    super();
  }

  ngOnInit(): void {
    this.subs.add(this.subscribeToUpdates(this.quizeeEditingService));
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  setAnswer(id: AnswerOptionId) {
    this.correctAnswers = _.xor(this.correctAnswers, [id]);

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
