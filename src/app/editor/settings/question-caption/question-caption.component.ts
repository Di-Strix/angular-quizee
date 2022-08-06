import { Component, OnDestroy, OnInit } from '@angular/core';
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
export class QuestionCaptionComponent implements OnInit, OnDestroy {
  subs: Subscription = new Subscription();
  questionCaption = new FormControl<Question['caption']>('', {
    nonNullable: true,
    asyncValidators: [QuizeeValidators.forCurrentQuestion(this.quizeeEditingService, 'question.caption')],
  });

  constructor(public quizeeEditingService: QuizeeEditingService) {}

  ngOnInit(): void {
    this.questionCaption.markAsTouched();

    this.subs.add(
      this.quizeeEditingService
        .getCurrentQuestion()
        .pipe(filter((questionPair) => this.questionCaption.value !== questionPair.question.caption))
        .subscribe((pair) => {
          this.questionCaption.setValue(pair.question.caption);
        })
    );

    this.subs.add(
      this.questionCaption.valueChanges.subscribe((v) =>
        this.quizeeEditingService.modifyCurrentQuestion({ question: { caption: v } })
      )
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
