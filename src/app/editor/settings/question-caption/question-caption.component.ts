import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Question } from '@di-strix/quizee-types';

import { Subscription, filter } from 'rxjs';

import { QuizeeEditingService } from '../../quizee-editing.service';
import { QuizeeValidators } from '../../quizee-validators';

@Component({
  selector: 'app-question-caption',
  templateUrl: './question-caption.component.html',
  styleUrls: ['./question-caption.component.scss'],
})
export class QuestionCaptionComponent implements OnInit, OnDestroy, OnChanges {
  @Input() questionIndex: number = -1;

  subs: Subscription = new Subscription();
  questionCaption = new FormControl<Question['caption']>('', {
    nonNullable: true,
  });

  constructor(public quizeeEditingService: QuizeeEditingService) {}

  ngOnInit(): void {
    this.questionCaption.markAsTouched();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.updateSubscriptions();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  updateSubscriptions() {
    this.subs.unsubscribe();
    this.subs = new Subscription();
    this.questionCaption.clearAsyncValidators();

    if (this.questionIndex < 0) return;

    this.subs.add(
      this.quizeeEditingService
        .getQuestion(this.questionIndex)
        .pipe(filter((questionPair) => this.questionCaption.value !== questionPair.question.caption))
        .subscribe((pair) => {
          this.questionCaption.setValue(pair.question.caption);
        })
    );

    this.subs.add(
      this.questionCaption.valueChanges.subscribe((v) => {
        this.quizeeEditingService.modifyQuestion(this.questionIndex, { question: { caption: v } });
      })
    );

    this.questionCaption.setAsyncValidators([
      QuizeeValidators.forQuestion(this.quizeeEditingService, this.questionIndex, 'question.caption'),
    ]);
    this.questionCaption.updateValueAndValidity({ emitEvent: false });
  }
}
