import { animate, style, transition, trigger } from '@angular/animations';
import { Component } from '@angular/core';
import { Question } from '@di-strix/quizee-types';

import { QuizeeEditingService } from '../quizee-editing.service';

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
  ],
})
export class OverviewComponent {
  constructor(public quizeeEditingService: QuizeeEditingService) {}

  trackBy(_: number, item: Question) {
    return item.id;
  }
}
