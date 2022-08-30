import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AnswerOptionId, Question } from '@di-strix/quizee-types';

import { QuestionComponent } from '../question-component.type';

@Component({
  selector: 'app-several-true',
  templateUrl: './several-true.component.html',
  styleUrls: ['./several-true.component.scss'],
})
export class SeveralTrueComponent implements QuestionComponent {
  @Input() question!: Question;
  @Output() answer = new EventEmitter<AnswerOptionId[]>();

  constructor() {}
}
