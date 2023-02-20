import { Component, OnInit } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';

@Component({
  selector: 'app-quizee-not-found-dialog',
  templateUrl: './quizee-not-found-dialog.component.html',
  styleUrls: ['./quizee-not-found-dialog.component.scss'],
})
export class QuizeeNotFoundDialogComponent {
  constructor(public dialogRef: MatDialogRef<QuizeeNotFoundDialogComponent>) {}
}
