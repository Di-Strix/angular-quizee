import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { QuestionType } from '@di-strix/quizee-types';

import { Subscription, filter } from 'rxjs';

import { QuizeeEditingService } from '../../quizee-editing.service';

@Component({
  selector: 'app-question-type',
  templateUrl: './question-type.component.html',
  styleUrls: ['./question-type.component.scss'],
})
export class QuestionTypeComponent implements OnInit, OnDestroy {
  readonly availableTypes: { title: string; value: QuestionType }[] = [
    { title: 'One true', value: 'ONE_TRUE' },
    { title: 'Several true', value: 'SEVERAL_TRUE' },
    { title: 'Write answer', value: 'WRITE_ANSWER' },
  ];

  subs = new Subscription();
  questionType = new FormControl('', [Validators.required]);

  constructor(public quizeeEditingService: QuizeeEditingService) {}

  ngOnInit(): void {
    this.subs.add(
      this.quizeeEditingService
        .getCurrentQuestion()
        .pipe(filter((questionPair) => this.questionType.value !== questionPair.question.type))
        .subscribe((pair) => {
          this.questionType.setValue(pair.question.type);
        })
    );

    this.subs.add(
      this.questionType.valueChanges.subscribe((v) =>
        this.quizeeEditingService.modifyCurrentQuestion({ question: { type: v } })
      )
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
