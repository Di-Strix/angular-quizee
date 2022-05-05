import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { QuestionType } from '@di-strix/quizee-types';

import { Subscription } from 'rxjs';
import { bindToQuizee } from 'src/app/shared/helpers/BindToQuizee';

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
      bindToQuizee(this.questionType, {
        getter: () => this.quizeeEditingService.getCurrentQuestion(),
        setter: (v) => this.quizeeEditingService.modifyCurrentQuestion(v),
        dataParser: (data) => data.question.type,
        quizeeModifier: (v) => ({ question: { type: v as QuestionType } }),
      })
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
