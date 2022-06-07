import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';

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
  questionCaption = new FormControl(
    '',
    null,
    QuizeeValidators.forCurrentQuestion(this.quizeeEditingService, 'question', 'caption')
  );

  constructor(public quizeeEditingService: QuizeeEditingService) {}

  ngOnInit(): void {
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
