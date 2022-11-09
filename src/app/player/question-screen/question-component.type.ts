import { EventEmitter } from '@angular/core';
import { AnswerOptionId, Question } from '@di-strix/quizee-types';

export declare abstract class QuestionComponent {
  question: Question;
  autofocusTimeout: number;
  answer: EventEmitter<AnswerOptionId[]>;
  commit: EventEmitter<void>;
  previewMode: boolean | null;
}
