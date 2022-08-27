import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-results-screen[score]',
  templateUrl: './results-screen.component.html',
  styleUrls: ['./results-screen.component.scss'],
})
export class ResultsScreenComponent {
  @Input() score!: number;
  @Output() retry = new EventEmitter<void>();

  constructor() {}
}
