import { animate, style, transition, trigger } from '@angular/animations';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { Subscription, filter } from 'rxjs';

import { QuizeeService } from '../shared/services/quizee.service';

import { OverviewComponent } from './overview/overview.component';
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
  @ViewChild(OverviewComponent, { read: ElementRef }) questionsContainer!: ElementRef<HTMLElement>;

  subs: Subscription = new Subscription();
  quizeeName = new FormControl('', [Validators.required]);

  constructor(
    private route: ActivatedRoute,
    private quizeeService: QuizeeService,
    public quizeeEditingService: QuizeeEditingService
  ) {}

  ngOnInit(): void {
    this.subs.add(
      this.quizeeEditingService
        .get()
        .pipe(filter((quizee) => this.quizeeName.value !== quizee.info.caption))
        .subscribe((quizee) => {
          this.quizeeName.setValue(quizee.info.caption);
        })
    );

    this.subs.add(
      this.quizeeName.valueChanges.subscribe((v) => this.quizeeEditingService.modify({ info: { caption: v } }))
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

  handleQuestionCreation() {
    this.quizeeEditingService.createQuestion();

    setTimeout(() => {
      this.questionsContainer.nativeElement.scrollTo({
        behavior: 'smooth',
        top: this.questionsContainer.nativeElement.scrollHeight,
      });
    }, 0);
  }
}
