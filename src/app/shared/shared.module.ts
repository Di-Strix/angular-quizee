import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';

import { AuthDialogComponent } from './components/auth-dialog/auth-dialog.component';
import { ClassWhenLoadedDirective } from './directives/class-when-loaded.directive';
import { ContainerRefDirective } from './directives/container-ref.directive';

@NgModule({
  declarations: [AuthDialogComponent, ClassWhenLoadedDirective, ContainerRefDirective],
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  exports: [AuthDialogComponent, ClassWhenLoadedDirective, ContainerRefDirective],
})
export class SharedModule {}
