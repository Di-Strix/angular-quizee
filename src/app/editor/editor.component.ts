import { animate, style, transition, trigger } from '@angular/animations';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { Subscription, filter, first, map, pairwise, startWith } from 'rxjs';

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
  subs: Subscription = new Subscription();
  quizeeName = new FormControl('', [Validators.required]);

  constructor(
    private route: ActivatedRoute,
    private quizeeService: QuizeeService,
    public quizeeEditingService: QuizeeEditingService
  ) {}

  ngOnInit(): void {
    this.quizeeEditingService
      .get()
      .pipe(first())
      .subscribe((quiz) => this.quizeeName.setValue(quiz.info.caption));

    this.subs.add(
      this.quizeeName.valueChanges
        .pipe(
          startWith(''),
          pairwise(),
          filter(([previous, current]) => previous !== current),
          map(([_, current]) => current)
        )
        .subscribe((current) => this.quizeeEditingService.modify({ info: { caption: current.trimStart() } }))
    );

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
