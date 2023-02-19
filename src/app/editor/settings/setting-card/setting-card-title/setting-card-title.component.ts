import { animate, style, transition, trigger } from '@angular/animations';
import { Component, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';

import * as _ from 'lodash';
import { Subscription, from } from 'rxjs';
import { QuizeeEditingService } from 'src/app/editor/quizee-editing.service';
import { QuizeeValidators } from 'src/app/editor/quizee-validators';

@Component({
  selector: 'app-setting-card-title',
  templateUrl: './setting-card-title.component.html',
  styleUrls: ['./setting-card-title.component.scss'],
  animations: [
    trigger('errorBadge', [
      transition(':enter', [style({ transform: 'scale(0)' }), animate('.1s', style({ transform: 'scale(1)' }))]),
      transition(':leave', [animate('.1s', style({ transform: 'scale(0)' }))]),
    ]),
  ],
})
export class SettingCardTitleComponent implements OnDestroy, OnChanges {
  @Input() title: string = '';
  @Input() checkErrors!: 'forQuizee' | 'forQuestion';
  @Input() questionIndex: number = -1;
  @Input() path!: string;

  subs = new Subscription();
  error: boolean = false;

  constructor(private quizeeEditingService: QuizeeEditingService) {}

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.updateValidators();
  }

  updateValidators() {
    this.subs.unsubscribe();
    this.subs = new Subscription();

    if (this.checkErrors) {
      if (!this.path) throw new Error('Path must be specified once checkErrors is set');

      let validator;
      if (this.checkErrors === 'forQuestion' && this.questionIndex >= 0)
        validator = QuizeeValidators.forQuestion(this.quizeeEditingService, this.questionIndex, this.path, false);
      else if (this.checkErrors === 'forQuestion')
        validator = QuizeeValidators.forCurrentQuestion(this.quizeeEditingService, this.path, false);
      else validator = QuizeeValidators[this.checkErrors](this.quizeeEditingService, this.path, false);

      this.subs.add(from(validator(null as any) as any).subscribe((errors) => (this.error = !!errors)));
    }
  }
}
