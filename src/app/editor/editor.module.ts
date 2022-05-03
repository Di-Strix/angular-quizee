import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatToolbarModule } from '@angular/material/toolbar';

import { SharedModule } from '../shared/shared.module';

import { EditorRoutingModule } from './editor-routing.module';
import { EditorComponent } from './editor.component';
import { OverviewComponent } from './overview/overview.component';
import { QuizeeEditingService } from './quizee-editing.service';

@NgModule({
  declarations: [EditorComponent, OverviewComponent],
  imports: [
    CommonModule,
    SharedModule,
    EditorRoutingModule,
    provideFirestore(() => getFirestore()),
    FlexLayoutModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatCardModule,
    MatInputModule,
    MatProgressSpinnerModule,
    ReactiveFormsModule,
  ],
  providers: [QuizeeEditingService],
})
export class EditorModule {}
