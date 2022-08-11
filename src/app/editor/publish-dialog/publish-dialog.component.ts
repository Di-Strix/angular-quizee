import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatStepper } from '@angular/material/stepper';
import { QuizId } from '@di-strix/quizee-types';

import { catchError, delay, first, switchMap, tap, throwError } from 'rxjs';
import { QuizeeService } from 'src/app/shared/services/quizee.service';

import { QuizeeEditingService } from '../quizee-editing.service';

@Component({
  selector: 'app-publish-dialog',
  templateUrl: './publish-dialog.component.html',
  styleUrls: ['./publish-dialog.component.scss'],
})
export class PublishDialogComponent implements OnInit {
  stepperState = {
    validation: {
      error: false,
      done: false,
    },
    publish: {
      error: false,
      done: false,
    },
  };
  quizeeId: QuizId = '';

  @ViewChild('stepper') stepper!: MatStepper;

  constructor(public quizeeService: QuizeeService, public quizeeEditingService: QuizeeEditingService) {}

  ngOnInit(): void {
    this.quizeeEditingService
      .getQuizeeErrors()
      .pipe(
        switchMap((errors) => {
          if (errors.length) {
            this.stepperState.validation.error = true;
            return throwError(() => new Error('Quizee is invalid'));
          }

          this.stepperState.validation.done = true;

          return this.quizeeEditingService.get();
        }),
        delay(750),
        tap(() => this.switchStepper()),
        switchMap((quizee) =>
          this.quizeeService
            .publishQuizee(quizee)
            .pipe(catchError((err) => ((this.stepperState.publish.error = true), throwError(() => err))))
        ),
        tap(() => {
          this.stepperState.publish.done = true;
          this.switchStepper();
        }),
        first()
      )
      .subscribe({
        next: (result) => {
          this.quizeeId = result.quizId;
        },
        error: (err) => {
          console.error(err);
          this.switchStepper(2);
        },
      });
  }

  switchStepper(index?: number) {
    setTimeout(() => {
      this.stepper.linear = false;

      if (index !== undefined) this.stepper.selectedIndex = index;
      else this.stepper.next();

      this.stepper.linear = true;
    }, 0);
  }
}
