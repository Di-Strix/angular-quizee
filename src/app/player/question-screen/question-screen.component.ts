import { AnimationBuilder } from '@angular/animations';
import { Component, OnDestroy, OnInit, Type, ViewChild } from '@angular/core';
import { QuestionType } from '@di-strix/quizee-types';

import { Subscription, delay, first } from 'rxjs';
import { ContainerRefDirective } from 'src/app/shared/directives/container-ref.directive';

import { ViewEnterAnimation, ViewLeaveAnimation } from '../animations';
import { PlayerService } from '../player.service';

import { OneTrueComponent } from './one-true/one-true.component';
import { QuestionComponent } from './question-component.type';
import { SeveralTrueComponent } from './several-true/several-true.component';
import { WriteAnswerComponent } from './write-answer/write-answer.component';

@Component({
  selector: 'app-question-screen',
  templateUrl: './question-screen.component.html',
  styleUrls: ['./question-screen.component.scss'],
})
export class QuestionScreenComponent implements OnInit, OnDestroy {
  @ViewChild(ContainerRefDirective) container!: ContainerRefDirective;

  subs = new Subscription();

  constructor(public playerService: PlayerService, public animationBuilder: AnimationBuilder) {}

  ngOnInit(): void {
    this.subs.add(
      this.playerService
        .getCurrentQuestion()
        .pipe(delay(10))
        .subscribe((question) => {
          const outAnimation = this.animationBuilder.build(ViewLeaveAnimation);
          const inAnimation = this.animationBuilder.build(ViewEnterAnimation);

          const prevComponentRef = this.container.containerRef.get(0);

          const componentTypes: { [k in QuestionType]: Type<QuestionComponent> } = {
            ONE_TRUE: OneTrueComponent,
            SEVERAL_TRUE: SeveralTrueComponent,
            WRITE_ANSWER: WriteAnswerComponent,
          };

          const component = this.container.containerRef.createComponent(componentTypes[question.type]);
          component.instance.question = question;
          component.instance.answer.pipe(first()).subscribe((answer) => {
            this.playerService.saveAnswer(answer);
            this.playerService.commitAnswer().subscribe();
          });

          if (prevComponentRef) {
            const prevNativeComponent: HTMLElement =
              this.container.containerRef.element.nativeElement.parentNode.children[1];

            const prevPlayer = outAnimation.create(prevNativeComponent);
            prevPlayer.onDone(() => {
              this.container.containerRef.remove(0);
            });
            prevPlayer.play();

            const currentPlayer = inAnimation.create(component.location.nativeElement);
            currentPlayer.play();
          }
        })
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
