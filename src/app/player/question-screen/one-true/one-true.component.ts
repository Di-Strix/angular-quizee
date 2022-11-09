import { Component, EventEmitter, Inject, Input, Optional, Output } from '@angular/core';
import { AnswerOptionId, Question } from '@di-strix/quizee-types';

import { PREVIEW_MODE } from '../../InjectionTokens';
import { QuestionComponent } from '../question-component.type';

@Component({
  selector: 'app-one-true',
  templateUrl: './one-true.component.html',
  styleUrls: ['./one-true.component.scss'],
})
export class OneTrueComponent implements QuestionComponent {
  @Input() question!: Question;
  @Input() autofocusTimeout: number = 0;
  @Output() answer = new EventEmitter<AnswerOptionId[]>();
  @Output() commit = new EventEmitter<void>();

  constructor(
    @Inject(PREVIEW_MODE)
    @Optional()
    public previewMode: boolean | null
  ) {}

  performCommit(answerOption: AnswerOptionId[]) {
    this.answer.emit(answerOption);
    this.commit.emit();
  }
}
