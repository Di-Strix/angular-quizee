import { Component, ElementRef, EventEmitter, Inject, Input, OnInit, Optional, Output, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { AnswerOptionId, Question } from '@di-strix/quizee-types';

import { PREVIEW_MODE } from '../../InjectionTokens';
import { QuestionComponent } from '../question-component.type';

@Component({
  selector: 'app-write-answer',
  templateUrl: './write-answer.component.html',
  styleUrls: ['./write-answer.component.scss'],
})
export class WriteAnswerComponent implements QuestionComponent, OnInit {
  @Input() question!: Question;
  @Input() autofocusTimeout: number = 0;
  @Output() answer = new EventEmitter<AnswerOptionId[]>();
  @Output() commit = new EventEmitter<void>();

  @ViewChild('answerInput') answerInputRef!: ElementRef;

  control = new FormControl<string>('', { nonNullable: true });

  constructor(
    @Inject(PREVIEW_MODE)
    @Optional()
    public previewMode: boolean | null
  ) {}

  ngOnInit(): void {
    this.control.valueChanges.subscribe((value) => {
      this.answer.emit([value]);
    });

    if (!this.previewMode)
      setTimeout(() => {
        const el = this.answerInputRef.nativeElement as HTMLElement;
        el.focus();
      }, this.autofocusTimeout);
  }
}
