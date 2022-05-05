import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';

import { Subscription } from 'rxjs';
import { bindToQuizee } from 'src/app/shared/helpers/BindToQuizee';

import { QuizeeEditingService } from '../../quizee-editing.service';

@Component({
  selector: 'app-question-caption',
  templateUrl: './question-caption.component.html',
  styleUrls: ['./question-caption.component.scss'],
})
export class QuestionCaptionComponent implements OnInit, OnDestroy {
  subs: Subscription = new Subscription();
  questionCaption = new FormControl('', [Validators.required]);

  constructor(public quizeeEditingService: QuizeeEditingService) {}

  ngOnInit(): void {
    this.subs.add(
      bindToQuizee(this.questionCaption, {
        getter: () => this.quizeeEditingService.getCurrentQuestion(),
        setter: (v) => this.quizeeEditingService.modifyCurrentQuestion(v),
        quizeeModifier: (value) => ({ question: { caption: value } }),
        dataParser: (questionPair) => questionPair.question.caption,
      })
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
