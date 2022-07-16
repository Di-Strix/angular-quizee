import { animate, query, stagger, style, transition, trigger } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { QuizInfo } from '@di-strix/quizee-types';

import { Subscription } from 'rxjs';
import { QuizeeService } from 'src/app/shared/services/quizee.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  animations: [
    trigger('card-reveal', [
      transition(':enter', [
        query('.mat-card:nth-child(-n+15)', [
          style({
            transform: 'translateY(10%)',
            opacity: 0,
          }),
          stagger(50, [animate('.5s ease-out', style({ transform: 'translateY(0)', opacity: 1 }))]),
        ]),
      ]),
    ]),
    trigger('loader', [
      transition(':enter', [
        style({
          opacity: 0,
        }),
        query(':self', [animate('.3s ease-out', style({ opacity: 1 }))], { delay: 500 }),
      ]),
      transition(':leave', [
        style({
          opacity: 1,
        }),
        animate('.3s ease-in', style({ opacity: 0 })),
      ]),
    ]),
  ],
})
export class HomeComponent implements OnInit {
  quizees: QuizInfo[] = [];

  constructor(public quizeeService: QuizeeService) {}

  ngOnInit(): void {
    this.quizeeService.getQuizeeList().subscribe((v) => (this.quizees = v));
  }
}
