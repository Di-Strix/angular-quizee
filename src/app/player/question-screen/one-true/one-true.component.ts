import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AnswerOptionId, Question } from '@di-strix/quizee-types';

import { QuestionComponent } from '../question-component.type';

@Component({
  selector: 'app-one-true',
  templateUrl: './one-true.component.html',
  styleUrls: ['./one-true.component.scss'],
})
export class OneTrueComponent implements QuestionComponent {
  @Input() question!: Question;
  @Output() answer = new EventEmitter<AnswerOptionId[]>();
  @Output() commit = new EventEmitter<void>();

  constructor() {}

  performCommit(answerOption: AnswerOptionId[]) {
    this.answer.emit(answerOption);
    this.commit.emit();
  }
}
