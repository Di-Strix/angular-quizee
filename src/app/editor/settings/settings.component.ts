import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';

import { Subscription, distinctUntilKeyChanged, tap } from 'rxjs';

import { QuestionPair, QuizeeEditingService } from '../quizee-editing.service';

import { AnswerInputComponent } from './answer-input/answer-input.component';
import { AnswerOptionsComponent } from './answer-options/answer-options.component';
import { QuestionCaptionComponent } from './question-caption/question-caption.component';
import { QuestionTypeComponent } from './question-type/question-type.component';
import { RenderSettingsComponentsDirective } from './render-settings-components.directive';
import { SettingsComponentTypes, SettingsConfig } from './settings';

export const settingsConfig: SettingsConfig = {
  ONE_TRUE: [QuestionCaptionComponent, QuestionTypeComponent, AnswerOptionsComponent],
  SEVERAL_TRUE: [QuestionCaptionComponent, QuestionTypeComponent, AnswerOptionsComponent],
  WRITE_ANSWER: [QuestionCaptionComponent, QuestionTypeComponent, AnswerInputComponent],
};

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit, OnDestroy {
  subs: Subscription = new Subscription();
  questionPair!: QuestionPair;
  currentSettings!: SettingsComponentTypes[];

  @ViewChild(RenderSettingsComponentsDirective, { static: true }) container!: RenderSettingsComponentsDirective;

  constructor(public quizeeEditingService: QuizeeEditingService) {}

  ngOnInit(): void {
    this.subs.add(
      this.quizeeEditingService
        .getCurrentQuestion()
        .pipe(
          distinctUntilKeyChanged(
            'question',
            (previous, current) => previous.id === current.id && previous.type === current.type
          )
        )
        .subscribe((q: QuestionPair) => {
          const containerRef = this.container.viewContainerRef;
          containerRef.clear();

          settingsConfig[q.question.type].forEach((c) => {
            containerRef.createComponent(c);
          });
        })
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
