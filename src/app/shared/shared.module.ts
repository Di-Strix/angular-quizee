import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';

import { AuthDialogComponent } from './components/auth-dialog/auth-dialog.component';
import { ClassWhenLoadedDirective } from './directives/class-when-loaded.directive';
import { ContainerRefDirective } from './directives/container-ref.directive';

@NgModule({
  declarations: [AuthDialogComponent, ClassWhenLoadedDirective, ContainerRefDirective],
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  exports: [AuthDialogComponent, ClassWhenLoadedDirective, ContainerRefDirective],
})
export class SharedModule {}
