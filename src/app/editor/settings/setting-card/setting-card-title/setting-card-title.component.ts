import { animate, style, transition, trigger } from '@angular/animations';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';

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
export class SettingCardTitleComponent implements OnInit, OnDestroy {
  @Input() title: string = '';
  @Input() checkErrors!: 'forQuizee' | 'forCurrentQuestion';
  @Input() path!: string;

  subs = new Subscription();
  error: boolean = false;

  constructor(private quizeeEditingService: QuizeeEditingService) {}

  ngOnInit(): void {
    if (this.checkErrors) {
      if (!this.path) throw new Error('Path must be specified once checkErrors is set');
      this.subs.add(
        from(QuizeeValidators[this.checkErrors](this.quizeeEditingService, this.path, false)(null as any)).subscribe(
          (errors) => (this.error = !!errors)
        )
      );
    }
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
