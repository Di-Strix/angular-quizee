import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexModule } from '@angular/flex-layout';
import { ReactiveFormsModule } from '@angular/forms';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyProgressSpinnerModule as MatProgressSpinnerModule } from '@angular/material/legacy-progress-spinner';
import { MatToolbarModule } from '@angular/material/toolbar';

import { SharedModule } from '../shared/shared.module';

import { PlayerRoutingModule } from './player-routing.module';
import { PlayerComponent } from './player.component';
import { PlayerService } from './player.service';
import { QuestionFooterComponent } from './question-footer/question-footer.component';
import { OneTrueComponent } from './question-screen/one-true/one-true.component';
import { QuestionScreenComponent } from './question-screen/question-screen.component';
import { SeveralTrueComponent } from './question-screen/several-true/several-true.component';
import { WriteAnswerComponent } from './question-screen/write-answer/write-answer.component';
import { QuizeeLoaderComponent } from './quizee-loader/quizee-loader.component';
import { QuizeeNotFoundComponent } from './quizee-not-found/quizee-not-found.component';
import { ResultsLoaderComponent } from './results-loader/results-loader.component';
import { ResultsScreenComponent } from './results-screen/results-screen.component';

@NgModule({
  declarations: [
    PlayerComponent,
    QuizeeNotFoundComponent,
    QuestionScreenComponent,
    QuizeeLoaderComponent,
    ResultsLoaderComponent,
    ResultsScreenComponent,
    OneTrueComponent,
    SeveralTrueComponent,
    WriteAnswerComponent,
    QuestionFooterComponent,
  ],
  imports: [
    CommonModule,
    PlayerRoutingModule,
    SharedModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatToolbarModule,
    FlexModule,
  ],
  providers: [PlayerService],
  exports: [QuestionScreenComponent],
})
export class PlayerModule {}
