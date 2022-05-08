import { QuestionType } from '@di-strix/quizee-types';

import { AnswerInputComponent } from './answer-input/answer-input.component';
import { OneTrueComponent } from './answer-options/one-true/one-true.component';
import { SeveralTrueComponent } from './answer-options/several-true/several-true.component';
import { QuestionCaptionComponent } from './question-caption/question-caption.component';
import { QuestionTypeComponent } from './question-type/question-type.component';

export type SettingsComponentTypes =
  | typeof QuestionCaptionComponent
  | typeof QuestionTypeComponent
  | typeof OneTrueComponent
  | typeof SeveralTrueComponent
  | typeof AnswerInputComponent;

export type SettingsConfig = {
  [T in QuestionType]: Array<SettingsComponentTypes>;
};
