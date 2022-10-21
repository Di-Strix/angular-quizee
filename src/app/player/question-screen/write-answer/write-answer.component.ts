import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { AnswerOptionId, Question } from '@di-strix/quizee-types';

import { QuestionComponent } from '../question-component.type';

@Component({
  selector: 'app-write-answer',
  templateUrl: './write-answer.component.html',
  styleUrls: ['./write-answer.component.scss'],
})
export class WriteAnswerComponent implements QuestionComponent, OnInit {
  @Input() question!: Question;
  @Output() answer = new EventEmitter<AnswerOptionId[]>();
  @Output() commit = new EventEmitter<void>();

  @ViewChild('answerInput') answerInputRef!: ElementRef;

  control = new FormControl<string>('', { nonNullable: true });

  constructor() {}

  ngOnInit(): void {
    this.control.valueChanges.subscribe((value) => {
      this.answer.emit([value]);
    });

    setTimeout(() => {
      const el = this.answerInputRef.nativeElement as HTMLElement;
      el.focus();
    }, 0);
  }
}
