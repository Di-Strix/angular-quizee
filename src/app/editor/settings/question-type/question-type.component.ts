import { Component, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { QuestionType } from '@di-strix/quizee-types';

import { Subscription, filter } from 'rxjs';

import { QuizeeEditingService } from '../../quizee-editing.service';

@Component({
  selector: 'app-question-type',
  templateUrl: './question-type.component.html',
  styleUrls: ['./question-type.component.scss'],
})
export class QuestionTypeComponent implements OnDestroy, OnChanges {
  readonly availableTypes: { title: string; value: QuestionType }[] = [
    { title: 'One true', value: 'ONE_TRUE' },
    { title: 'Several true', value: 'SEVERAL_TRUE' },
    { title: 'Write answer', value: 'WRITE_ANSWER' },
  ];

  @Input() questionIndex: number = -1;

  subs = new Subscription();
  questionType = new FormControl<QuestionType>('ONE_TRUE', { nonNullable: true, validators: [Validators.required] });

  constructor(public quizeeEditingService: QuizeeEditingService) {}

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  ngOnChanges(changes: SimpleChanges) {
    this.updateSubscriptions();
  }

  updateSubscriptions() {
    this.subs.unsubscribe();
    this.subs = new Subscription();

    if (this.questionIndex < 0) return;

    this.subs.add(
      this.quizeeEditingService
        .getQuestion(this.questionIndex)
        .pipe(filter((questionPair) => this.questionType.value !== questionPair.question.type))
        .subscribe((pair) => {
          this.questionType.setValue(pair.question.type);
        })
    );

    this.subs.add(
      this.questionType.valueChanges.subscribe((v) => {
        this.quizeeEditingService.setQuestionType(this.questionIndex, v);
      })
    );
  }
}
