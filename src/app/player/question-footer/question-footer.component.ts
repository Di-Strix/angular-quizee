import { Component, OnInit } from '@angular/core';

import { PlayerService } from '../player.service';

@Component({
  selector: 'app-question-footer',
  templateUrl: './question-footer.component.html',
  styleUrls: ['./question-footer.component.scss'],
})
export class QuestionFooterComponent {
  constructor(public playerService: PlayerService) {}
}
