import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';

import { AuthDialogComponent } from './components/auth-dialog/auth-dialog.component';
import { ClassWhenLoadedDirective } from './directives/class-when-loaded.directive';

@NgModule({
  declarations: [AuthDialogComponent, ClassWhenLoadedDirective],
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  exports: [AuthDialogComponent, ClassWhenLoadedDirective],
})
export class SharedModule {}
