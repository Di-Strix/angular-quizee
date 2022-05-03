import { animate, style, transition, trigger } from '@angular/animations';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Quiz } from '@di-strix/quizee-types';

import { Subscription } from 'rxjs';

import { QuizeeService } from '../shared/services/quizee.service';

import { QuizeeEditingService } from './quizee-editing.service';

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss'],
  animations: [
    trigger('loader', [
      transition(':enter', [style({ opacity: '0' }), animate('.2s', style({ opacity: '1' }))]),
      transition(':leave', animate('.2s', style({ opacity: '0' }))),
    ]),
  ],
})
export class EditorComponent implements OnInit, OnDestroy {
  quiz?: Quiz;
  subs: Subscription = new Subscription();
  quizeeName = new FormControl('', [Validators.required]);

  constructor(
    private route: ActivatedRoute,
    public quizeeService: QuizeeService,
    private quizeeEditingService: QuizeeEditingService
  ) {}

  ngOnInit(): void {
    this.subs.add(
      this.quizeeEditingService.get().subscribe((quiz) => {
        this.quiz = quiz;
        this.quizeeName.setValue(quiz.info.caption);
      })
    );

    this.quizeeName.valueChanges.subscribe((value) => {
      if (this.quiz?.info.caption === value) return;

      this.quizeeEditingService.modify({ info: { caption: value.trimStart() } });
    });

    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');

      if (id?.trim()) {
        this.quizeeService.getQuizee(id, true).subscribe({
          next: (value) => {
            this.quizeeEditingService.load(value);
          },
          error: (_) => {
            // TODO: Show dialog prompting to create a new quizee
            this.quizeeEditingService.create();
          },
        });
      } else {
        this.quizeeEditingService.create();
      }
    });
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
