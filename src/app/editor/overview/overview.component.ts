import { animate, style, transition, trigger } from '@angular/animations';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Question } from '@di-strix/quizee-types';
import { VerificationErrors } from '@di-strix/quizee-verification-functions';

import { Subscription } from 'rxjs';

import { QuizeeEditingService } from '../quizee-editing.service';
import { QuizeeValidators } from '../quizee-validators';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss'],
  animations: [
    trigger('card', [
      transition(':enter', [
        style({ transform: 'scale(0)' }),
        animate('.25s ease-out', style({ transform: 'scale(1)' })),
      ]),
      transition(':leave', animate('.25s ease-in', style({ transform: 'scale(0)' }))),
    ]),
    trigger('errorBadge', [
      transition(':enter', [style({ transform: 'scale(0)' }), animate('.1s', style({ transform: 'scale(1)' }))]),
      transition(':leave', [animate('.1s', style({ transform: 'scale(0)' }))]),
    ]),
  ],
})
export class OverviewComponent implements OnInit, OnDestroy {
  errors: VerificationErrors = [];

  subs = new Subscription();

  constructor(public quizeeEditingService: QuizeeEditingService) {}

  ngOnInit() {
    this.subs.add(this.quizeeEditingService.getQuizeeErrors().subscribe((errors) => (this.errors = errors)));
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  trackBy(_: number, item: Question) {
    return item.id;
  }

  hasError(index: number): boolean {
    return !!Object.keys({
      ...QuizeeValidators.filterErrors(this.errors, `answers[${index}]`),
      ...QuizeeValidators.filterErrors(this.errors, `questions[${index}]`),
    }).length;
  }
}
