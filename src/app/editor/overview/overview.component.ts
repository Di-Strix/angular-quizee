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
  constructor(public quizeeEditingService: QuizeeEditingService) {}

  ngOnInit(): void {}

  ngOnDestroy(): void {}
}
