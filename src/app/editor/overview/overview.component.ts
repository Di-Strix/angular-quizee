import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Quiz } from '@di-strix/quizee-types';

import { Subscription } from 'rxjs';

import { QuizeeEditingService } from '../quizee-editing.service';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss'],
})
export class OverviewComponent implements OnInit, OnDestroy {
  quiz?: Quiz;
  subs: Subscription = new Subscription();

  constructor(private quizeeEditingService: QuizeeEditingService) {}

  ngOnInit(): void {
    this.subs.add(this.quizeeEditingService.get().subscribe((quiz) => (this.quiz = quiz)));
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
