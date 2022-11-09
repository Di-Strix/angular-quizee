import { Component, EventEmitter, Inject, Input, OnInit, Optional, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { AnswerOptionId, Question } from '@di-strix/quizee-types';

import * as _ from 'lodash';

import { PREVIEW_MODE } from '../../InjectionTokens';
import { QuestionComponent } from '../question-component.type';

@Component({
  selector: 'app-several-true',
  templateUrl: './several-true.component.html',
  styleUrls: ['./several-true.component.scss'],
})
export class SeveralTrueComponent implements QuestionComponent, OnInit {
  @Input() question!: Question;
  @Input() autofocusTimeout: number = 0;
  @Output() answer = new EventEmitter<AnswerOptionId[]>();
  @Output() commit = new EventEmitter<void>();

  control = new FormControl<AnswerOptionId[]>([], { nonNullable: true });

  constructor(
    @Inject(PREVIEW_MODE)
    @Optional()
    public previewMode: boolean | null
  ) {}

  ngOnInit(): void {
    this.control.valueChanges.subscribe((answer) => {
      this.answer.emit(answer);
    });
  }

  toggleAnswer(id: AnswerOptionId) {
    this.control.setValue(_.xor(this.control.value, [id]));
  }
}
