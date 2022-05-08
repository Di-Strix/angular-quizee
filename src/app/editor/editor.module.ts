import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';

import { SharedModule } from '../shared/shared.module';

import { EditorRoutingModule } from './editor-routing.module';
import { EditorComponent } from './editor.component';
import { OverviewComponent } from './overview/overview.component';
import { QuizeeEditingService } from './quizee-editing.service';
import { AnswerInputComponent } from './settings/answer-input/answer-input.component';
import { OneTrueComponent } from './settings/answer-options/one-true/one-true.component';
import { SeveralTrueComponent } from './settings/answer-options/several-true/several-true.component';
import { QuestionCaptionComponent } from './settings/question-caption/question-caption.component';
import { QuestionTypeComponent } from './settings/question-type/question-type.component';
import { RenderSettingsComponentsDirective } from './settings/render-settings-components.directive';
import { SettingCardComponent } from './settings/setting-card/setting-card.component';
import { SettingsComponent } from './settings/settings.component';

@NgModule({
  declarations: [
    EditorComponent,
    OverviewComponent,
    SettingsComponent,
    SettingCardComponent,
    QuestionCaptionComponent,
    QuestionTypeComponent,
    AnswerInputComponent,
    RenderSettingsComponentsDirective,
    OneTrueComponent,
    SeveralTrueComponent,
  ],
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
    MatSelectModule,
    MatCheckboxModule,
    MatTooltipModule,
    MatRadioModule,
  ],
  providers: [QuizeeEditingService],
})
export class EditorModule {}
