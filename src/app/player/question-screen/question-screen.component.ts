import { AnimationBuilder } from '@angular/animations';
import { Component, Inject, OnDestroy, OnInit, Type, ViewChild } from '@angular/core';
import { QuestionType } from '@di-strix/quizee-types';

import { Subscription, delay } from 'rxjs';
import { ContainerRefDirective } from 'src/app/shared/directives/container-ref.directive';

import { QUESTION_CHANGE_ANIMATION } from '../InjectionTokens';
import { ViewAnimationDuration, ViewEnterAnimation, ViewLeaveAnimation } from '../animations';
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

  constructor(
    public playerService: PlayerService,
    public animationBuilder: AnimationBuilder,

    @Inject(QUESTION_CHANGE_ANIMATION)
    public animate: boolean
  ) {}

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
          component.instance.autofocusTimeout = ViewAnimationDuration;
          component.instance.answer.subscribe((answer) => {
            this.playerService.saveAnswer(answer);
          });
          component.instance.commit.subscribe(() => {
            this.playerService.commitAnswer();
          });

          if (prevComponentRef) {
            if (this.animate) {
              const prevNativeComponent: HTMLElement =
                this.container.containerRef.element.nativeElement.parentNode.children[1];

              const prevPlayer = outAnimation.create(prevNativeComponent);
              prevPlayer.onDone(() => {
                this.container.containerRef.remove(0);
              });
              prevPlayer.play();

              const currentPlayer = inAnimation.create(component.location.nativeElement);
              currentPlayer.play();
            } else {
              this.container.containerRef.remove(0);
            }
          }
        })
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
