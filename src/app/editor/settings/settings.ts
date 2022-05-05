import { QuestionType } from '@di-strix/quizee-types';

import { AnswerInputComponent } from './answer-input/answer-input.component';
import { AnswerOptionsComponent } from './answer-options/answer-options.component';
import { QuestionCaptionComponent } from './question-caption/question-caption.component';
import { QuestionTypeComponent } from './question-type/question-type.component';

export type SettingsComponentTypes =
  | typeof QuestionCaptionComponent
  | typeof QuestionTypeComponent
  | typeof AnswerOptionsComponent
  | typeof AnswerInputComponent;

export type SettingsConfig = {
  [T in QuestionType]: Array<SettingsComponentTypes>;
};
