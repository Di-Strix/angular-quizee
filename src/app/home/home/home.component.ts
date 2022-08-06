import { animate, query, stagger, style, transition, trigger } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { QuizInfo } from '@di-strix/quizee-types';

import { retry, tap, timer } from 'rxjs';
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
    trigger('falloff', [
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
    trigger('opacityTransition', [
      transition(':enter', [
        style({
          opacity: 0,
        }),
        animate('.3s ease-out', style({ opacity: 1 })),
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
  manualRetryRequired: boolean = false;

  constructor(public quizeeService: QuizeeService, private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.fetchQuizees();
  }

  fetchQuizees(): void {
    this.manualRetryRequired = false;

    const fibonacci = () => {
      const sequence = [0, 1];
      return () => {
        sequence.push(sequence.reduce((acc, val) => acc + val, 0));
        sequence.shift();

        return sequence[1];
      };
    };

    const getNextFibonacciNumber = fibonacci();

    this.quizeeService
      .getQuizeeList()
      .pipe(
        retry({
          count: 5,
          delay: () => {
            const nextDelay = getNextFibonacciNumber();

            this.snackBar.open(
              `Failed to fetch... Retrying in ${nextDelay} ${nextDelay == 1 ? 'second' : 'seconds'}`,
              'Hide',
              { duration: nextDelay * 1000, horizontalPosition: 'right', verticalPosition: 'top' }
            );

            return timer(nextDelay * 1000);
          },
        }),
        tap(() => (this.manualRetryRequired = false))
      )
      .subscribe({ next: (v) => (this.quizees = v), error: () => (this.manualRetryRequired = true) });
  }
}
