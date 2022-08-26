import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { SharedModule } from '../shared/shared.module';

import { PlayerComponent } from './player.component';

@NgModule({
  declarations: [PlayerComponent],
  imports: [CommonModule, SharedModule],
})
export class PlayerModule {}
