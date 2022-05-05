import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';

import { Subscription, distinctUntilChanged, first, startWith } from 'rxjs';

import { QuizeeEditingService } from '../../quizee-editing.service';

@Component({
  selector: 'app-question-caption',
  templateUrl: './question-caption.component.html',
  styleUrls: ['./question-caption.component.scss'],
})
export class QuestionCaptionComponent implements OnInit, OnDestroy {
  subs: Subscription = new Subscription();
  questionCaption = new FormControl('', [Validators.required]);

  constructor(public quizeeEditingService: QuizeeEditingService) {}

  ngOnInit(): void {
    this.quizeeEditingService
      .getCurrentQuestion()
      .pipe(first())
      .subscribe((questionPair) => this.questionCaption.setValue(questionPair.question.caption));

    this.subs.add(
      this.questionCaption.valueChanges
        .pipe(distinctUntilChanged())
        .subscribe((current) => this.quizeeEditingService.modifyCurrentQuestion({ question: { caption: current } }))
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
