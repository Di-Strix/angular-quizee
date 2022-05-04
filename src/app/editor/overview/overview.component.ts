import { Component } from '@angular/core';

import { QuizeeEditingService } from '../quizee-editing.service';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss'],
})
export class OverviewComponent {
  constructor(public quizeeEditingService: QuizeeEditingService) {}
}
