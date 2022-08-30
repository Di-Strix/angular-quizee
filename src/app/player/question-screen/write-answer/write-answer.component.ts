import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AnswerOptionId, Question } from '@di-strix/quizee-types';

import { QuestionComponent } from '../question-component.type';

@Component({
  selector: 'app-write-answer',
  templateUrl: './write-answer.component.html',
  styleUrls: ['./write-answer.component.scss'],
})
export class WriteAnswerComponent implements QuestionComponent {
  @Input() question!: Question;
  @Output() answer = new EventEmitter<AnswerOptionId[]>();

  constructor() {}
}
