import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild } from '@angular/core';

import { Observable, Subscription, distinctUntilKeyChanged } from 'rxjs';

import { QuestionPair, QuizeeEditingService } from '../quizee-editing.service';

import { AnswerInputComponent } from './answer-input/answer-input.component';
import { OneTrueComponent } from './answer-options/one-true/one-true.component';
import { SeveralTrueComponent } from './answer-options/several-true/several-true.component';
import { QuestionCaptionComponent } from './question-caption/question-caption.component';
import { QuestionTypeComponent } from './question-type/question-type.component';
import { RenderSettingsComponentsDirective } from './render-settings-components.directive';
import { SettingsConfig } from './settings';

export const settingsConfig: SettingsConfig = {
  ONE_TRUE: [QuestionCaptionComponent, QuestionTypeComponent, OneTrueComponent],
  SEVERAL_TRUE: [QuestionCaptionComponent, QuestionTypeComponent, SeveralTrueComponent],
  WRITE_ANSWER: [QuestionCaptionComponent, QuestionTypeComponent, AnswerInputComponent],
};

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit, OnDestroy, OnChanges {
  time = new Date();

  @Input() questionIndex: number = -1;

  questionSub: Subscription = new Subscription();

  @ViewChild(RenderSettingsComponentsDirective, { static: true }) container!: RenderSettingsComponentsDirective;

  constructor(public quizeeEditingService: QuizeeEditingService) {}

  ngOnInit(): void {
    this.updateQuestion();
  }

  ngOnDestroy(): void {
    this.questionSub.unsubscribe();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ('questionIndex' in changes) this.updateQuestion();
  }

  updateQuestion() {
    if (this.questionIndex < 0) this.loadQuestion(this.quizeeEditingService.getCurrentQuestion());
    else this.loadQuestion(this.quizeeEditingService.getQuestion(this.questionIndex));
  }

  loadQuestion(questionStream: Observable<QuestionPair>): void {
    this.questionSub.unsubscribe();

    this.questionSub = questionStream
      .pipe(
        distinctUntilKeyChanged('question', (previous, current) => {
          return previous.id === current.id && previous.type === current.type;
        })
      )
      .subscribe((q: QuestionPair) => {
        const containerRef = this.container.viewContainerRef;
        containerRef.clear();

        settingsConfig[q.question.type].forEach((c) => {
          const component = containerRef.createComponent(c);
          component.setInput('questionIndex', q.index);
        });
      });
  }
}
