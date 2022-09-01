import { EventEmitter } from '@angular/core';
import { AnswerOptionId, Question } from '@di-strix/quizee-types';

export abstract class QuestionComponent {
  question!: Question;
  answer!: EventEmitter<AnswerOptionId[]>;
  commit!: EventEmitter<void>;
}
