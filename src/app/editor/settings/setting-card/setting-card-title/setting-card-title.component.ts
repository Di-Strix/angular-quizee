import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-setting-card-title',
  templateUrl: './setting-card-title.component.html',
  styleUrls: ['./setting-card-title.component.scss'],
})
export class SettingCardTitleComponent {
  @Input() title: string = '';

  constructor() {}
}
