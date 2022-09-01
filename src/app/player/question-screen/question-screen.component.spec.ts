import { AnimationBuilder, AnimationFactory, AnimationPlayer } from '@angular/animations';
import { ElementRef, ViewContainerRef } from '@angular/core';
import { Question } from '@di-strix/quizee-types';

import { Subject, of } from 'rxjs';
import { ContainerRefDirective } from 'src/app/shared/directives/container-ref.directive';

import { ViewEnterAnimation, ViewLeaveAnimation } from '../animations';
import { PlayerService } from '../player.service';

import { OneTrueComponent } from './one-true/one-true.component';
import { QuestionScreenComponent } from './question-screen.component';
import { SeveralTrueComponent } from './several-true/several-true.component';
import { WriteAnswerComponent } from './write-answer/write-answer.component';

class AnimationBuilderMock implements AnimationBuilder {
  build = jest.fn();
}

class AnimationFactoryMock implements AnimationFactory {
  create = jest.fn();
}

class AnimationPlayerMock implements AnimationPlayer {
  parentPlayer!: AnimationPlayer | null;
  totalTime!: number;
  beforeDestroy?: (() => any) | undefined;

  onDone = jest.fn();
  onStart = jest.fn();
  onDestroy = jest.fn();
  init = jest.fn();
  hasStarted = jest.fn();
  play = jest.fn();
  pause = jest.fn();
  restart = jest.fn();
  finish = jest.fn();
  destroy = jest.fn();
  reset = jest.fn();
  setPosition = jest.fn();
  getPosition = jest.fn();
}

class ViewContainerRefMock implements Omit<ViewContainerRef, 'injector' | 'parentInjector' | 'length'> {
  elementRef!: ElementRef;

  get element(): ElementRef<any> {
    return this.elementRef;
  }

  clear = jest.fn();
  get = jest.fn();
  createEmbeddedView = jest.fn();
  createComponent = jest.fn();
  insert = jest.fn();
  move = jest.fn();
  indexOf = jest.fn();
  remove = jest.fn();
  detach = jest.fn();
}

jest.mock('../player.service');
jest.mock('../player.service');

describe('QuestionScreenComponent', () => {
  let playerService: jest.MockedClass<typeof PlayerService>['prototype'];
  let viewContainerRef: jest.MockedClass<typeof ViewContainerRefMock>['prototype'];
  let container: ContainerRefDirective;
  let component: QuestionScreenComponent;

  let animationBuilder: jest.MockedClass<typeof AnimationBuilderMock>['prototype'];

  beforeEach(async () => {
    playerService = new (PlayerService as any)();
    animationBuilder = new AnimationBuilderMock() as any;

    viewContainerRef = new ViewContainerRefMock();
    container = new ContainerRefDirective(viewContainerRef as any);

    component = new QuestionScreenComponent(playerService, animationBuilder);
    component.container = container;

    jest.useFakeTimers();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('onInit', () => {
    it('should subscribe to current question', async () => {
      const subject = new Subject<Question>();
      playerService.getCurrentQuestion.mockReturnValue(subject);

      component.ngOnInit();

      await jest.runAllTimers();

      expect(subject.observed).toBeTruthy();
    });

    describe('component creation', () => {
      describe('OneTrue', () => {
        describe('creation', () => {
          it('should create OneTrueComponent if question type is ONE_TRUE', async () => {
            const question: Question = {
              answerOptions: [],
              caption: '',
              id: '',
              type: 'ONE_TRUE',
            };

            playerService.getCurrentQuestion.mockReturnValue(of(question));
            viewContainerRef.createComponent.mockReturnValue({ instance: new OneTrueComponent() });

            component.ngOnInit();

            await jest.runAllTimers();

            expect(viewContainerRef.createComponent).toBeCalledTimes(1);
            expect(viewContainerRef.createComponent).toBeCalledWith(OneTrueComponent);
          });
        });

        describe('initialization', () => {
          it('should set current question', async () => {
            const question: Question = {
              answerOptions: [],
              caption: '',
              id: '',
              type: 'ONE_TRUE',
            };

            const oneTrueComponent = new OneTrueComponent();

            playerService.getCurrentQuestion.mockReturnValue(of(question));
            viewContainerRef.createComponent.mockReturnValue({ instance: oneTrueComponent });

            component.ngOnInit();

            await jest.runAllTimers();

            expect(oneTrueComponent.question).toEqual(question);
          });

          it('should subscribe to answer and commit events', async () => {
            const question: Question = {
              answerOptions: [],
              caption: '',
              id: '',
              type: 'ONE_TRUE',
            };

            const oneTrueComponent = new OneTrueComponent();

            playerService.getCurrentQuestion.mockReturnValue(of(question));
            viewContainerRef.createComponent.mockReturnValue({ instance: oneTrueComponent });

            component.ngOnInit();

            await jest.runAllTimers();

            expect(oneTrueComponent.answer.observed).toBeTruthy();
            expect(oneTrueComponent.commit.observed).toBeTruthy();
          });
        });
      });

      describe('SeveralTrue', () => {
        describe('creation', () => {
          it('should create SeveralTrueComponent if question type is SEVERAL_TRUE', async () => {
            const question: Question = {
              answerOptions: [],
              caption: '',
              id: '',
              type: 'SEVERAL_TRUE',
            };

            playerService.getCurrentQuestion.mockReturnValue(of(question));
            viewContainerRef.createComponent.mockReturnValue({ instance: new OneTrueComponent() });

            component.ngOnInit();

            await jest.runAllTimers();

            expect(viewContainerRef.createComponent).toBeCalledTimes(1);
            expect(viewContainerRef.createComponent).toBeCalledWith(SeveralTrueComponent);
          });
        });

        describe('initialization', () => {
          it('should set current question', async () => {
            const question: Question = {
              answerOptions: [],
              caption: '',
              id: '',
              type: 'SEVERAL_TRUE',
            };

            const oneTrueComponent = new SeveralTrueComponent();

            playerService.getCurrentQuestion.mockReturnValue(of(question));
            viewContainerRef.createComponent.mockReturnValue({ instance: oneTrueComponent });

            component.ngOnInit();

            await jest.runAllTimers();

            expect(oneTrueComponent.question).toEqual(question);
          });

          it('should subscribe to answer and commit events', async () => {
            const question: Question = {
              answerOptions: [],
              caption: '',
              id: '',
              type: 'SEVERAL_TRUE',
            };

            const oneTrueComponent = new SeveralTrueComponent();

            playerService.getCurrentQuestion.mockReturnValue(of(question));
            viewContainerRef.createComponent.mockReturnValue({ instance: oneTrueComponent });

            component.ngOnInit();

            await jest.runAllTimers();

            expect(oneTrueComponent.answer.observed).toBeTruthy();
            expect(oneTrueComponent.commit.observed).toBeTruthy();
          });
        });
      });

      describe('WriteAnswer', () => {
        describe('creation', () => {
          it('should create WriteAnswerComponent if question type is WRITE_ANSWER', async () => {
            const question: Question = {
              answerOptions: [],
              caption: '',
              id: '',
              type: 'WRITE_ANSWER',
            };

            playerService.getCurrentQuestion.mockReturnValue(of(question));
            viewContainerRef.createComponent.mockReturnValue({ instance: new OneTrueComponent() });

            component.ngOnInit();

            await jest.runAllTimers();

            expect(viewContainerRef.createComponent).toBeCalledTimes(1);
            expect(viewContainerRef.createComponent).toBeCalledWith(WriteAnswerComponent);
          });
        });

        describe('initialization', () => {
          it('should set current question', async () => {
            const question: Question = {
              answerOptions: [],
              caption: '',
              id: '',
              type: 'WRITE_ANSWER',
            };

            const oneTrueComponent = new WriteAnswerComponent();

            playerService.getCurrentQuestion.mockReturnValue(of(question));
            viewContainerRef.createComponent.mockReturnValue({ instance: oneTrueComponent });

            component.ngOnInit();

            await jest.runAllTimers();

            expect(oneTrueComponent.question).toEqual(question);
          });

          it('should subscribe to answer and commit events', async () => {
            const question: Question = {
              answerOptions: [],
              caption: '',
              id: '',
              type: 'WRITE_ANSWER',
            };

            const oneTrueComponent = new WriteAnswerComponent();

            playerService.getCurrentQuestion.mockReturnValue(of(question));
            viewContainerRef.createComponent.mockReturnValue({ instance: oneTrueComponent });

            component.ngOnInit();

            await jest.runAllTimers();

            expect(oneTrueComponent.answer.observed).toBeTruthy();
            expect(oneTrueComponent.commit.observed).toBeTruthy();
          });
        });
      });
    });

    describe('answer handling', () => {
      it('should save answer', async () => {
        playerService.commitAnswer.mockReturnValue(of());

        const question: Question = {
          answerOptions: [],
          caption: '',
          id: '',
          type: 'ONE_TRUE',
        };

        const oneTrueComponent = new OneTrueComponent();

        playerService.getCurrentQuestion.mockReturnValue(of(question));
        viewContainerRef.createComponent.mockReturnValue({ instance: oneTrueComponent });

        component.ngOnInit();

        await jest.runAllTimers();

        oneTrueComponent.answer.emit(['1']);

        await jest.runAllTimers();

        expect(playerService.commitAnswer).not.toBeCalled();
        expect(playerService.saveAnswer).toBeCalledTimes(1);
        expect(playerService.saveAnswer).toBeCalledWith(['1']);
      });

      it('should commit answer', async () => {
        playerService.commitAnswer.mockReturnValue(of());

        const question: Question = {
          answerOptions: [],
          caption: '',
          id: '',
          type: 'ONE_TRUE',
        };

        const oneTrueComponent = new OneTrueComponent();

        playerService.getCurrentQuestion.mockReturnValue(of(question));
        viewContainerRef.createComponent.mockReturnValue({ instance: oneTrueComponent });

        component.ngOnInit();

        await jest.runAllTimers();

        oneTrueComponent.answer.emit(['1']);
        oneTrueComponent.commit.emit();

        await jest.runAllTimers();

        expect(playerService.commitAnswer).toBeCalledTimes(1);
      });
    });

    describe('animation', () => {
      let oneTrueComponent: OneTrueComponent;
      let container: HTMLElement;
      let question: Question;
      let questionSubject: Subject<Question>;

      let animationInFactory: jest.MockedClass<typeof AnimationFactoryMock>['prototype'];
      let animationOutFactory: jest.MockedClass<typeof AnimationFactoryMock>['prototype'];
      let animationInPlayer: jest.MockedClass<typeof AnimationPlayerMock>['prototype'];
      let animationOutPlayer: jest.MockedClass<typeof AnimationPlayerMock>['prototype'];

      beforeEach(async () => {
        question = {
          answerOptions: [],
          caption: '',
          id: '',
          type: 'ONE_TRUE',
        };
        questionSubject = new Subject();
        animationInFactory = new AnimationFactoryMock() as any;
        animationOutFactory = new AnimationFactoryMock() as any;
        animationInPlayer = new AnimationPlayerMock() as any;
        animationOutPlayer = new AnimationPlayerMock() as any;

        container = document.createElement('div');

        const componentEl = document.createElement('div');
        componentEl.textContent = 'Component itself';
        container.appendChild(componentEl);

        const prevQuestionComponent = document.createElement('div');
        prevQuestionComponent.textContent = 'Previous question';
        container.appendChild(prevQuestionComponent);

        const currentQuestionComponent = document.createElement('div');
        currentQuestionComponent.textContent = 'Current question';
        container.appendChild(currentQuestionComponent);

        viewContainerRef.elementRef = new ElementRef(componentEl);

        oneTrueComponent = new OneTrueComponent();

        animationBuilder.build.mockImplementation((animation) => {
          if (animation === ViewLeaveAnimation) return animationOutFactory;
          else if (animation === ViewEnterAnimation) return animationInFactory;

          throw new Error('Provided unknown animation');
        });

        animationInFactory.create.mockReturnValue(animationInPlayer);
        animationOutFactory.create.mockReturnValue(animationOutPlayer);

        playerService.getCurrentQuestion.mockReturnValue(questionSubject);
        viewContainerRef.createComponent.mockReturnValue({
          instance: oneTrueComponent,
          location: new ElementRef(currentQuestionComponent),
        });

        component.ngOnInit();

        await jest.runAllTimers();
      });

      it('should animate previous component if any', async () => {
        viewContainerRef.get.mockReturnValue(container.firstChild);

        questionSubject.next(question);

        await jest.runAllTimers();

        expect(animationOutFactory.create).toBeCalledTimes(1);
        expect(animationOutFactory.create).toBeCalledWith(container.children[1]);
        expect(animationOutPlayer.play).toBeCalledTimes(1);
      });

      it('should remove previous component after animation if any', async () => {
        let callback = () => {};
        viewContainerRef.get.mockReturnValue(container.firstChild);
        animationOutPlayer.onDone.mockImplementation((cb) => {
          callback = cb;
        });

        questionSubject.next(question);

        await jest.runAllTimers();

        callback();

        await jest.runAllTimers();

        expect(viewContainerRef.remove).toBeCalledTimes(1);
        expect(viewContainerRef.remove).toBeCalledWith(0);
      });

      it('should animate new component', async () => {
        viewContainerRef.get.mockReturnValue(container.firstChild);

        questionSubject.next(question);

        await jest.runAllTimers();

        expect(animationInFactory.create).toBeCalledTimes(1);
        expect(animationInFactory.create).toBeCalledWith(container.children[2]);
        expect(animationOutPlayer.play).toBeCalledTimes(1);
      });
    });
  });

  describe('onDestroy', () => {
    it('should cancel all subscriptions', async () => {
      const subject = new Subject<Question>();
      playerService.getCurrentQuestion.mockReturnValue(subject);

      component.ngOnInit();

      await jest.runAllTimers();

      component.ngOnDestroy();

      await jest.runAllTimers();

      expect(subject.observed).toBeFalsy();
    });
  });
});
