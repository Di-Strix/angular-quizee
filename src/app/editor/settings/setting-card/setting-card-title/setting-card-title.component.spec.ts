import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Subject } from 'rxjs';
import { EditorModule } from 'src/app/editor/editor.module';
import { QuizeeEditingService } from 'src/app/editor/quizee-editing.service';
import { QuizeeValidators } from 'src/app/editor/quizee-validators';

import { SettingCardTitleComponent } from './setting-card-title.component';

describe('SettingCardTitleComponent', () => {
  let component: SettingCardTitleComponent;
  let service: QuizeeEditingService;
  let fixture: ComponentFixture<SettingCardTitleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SettingCardTitleComponent],
      imports: [EditorModule],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SettingCardTitleComponent);
    service = TestBed.inject(QuizeeEditingService);
    component = fixture.componentInstance;
    fixture.detectChanges();

    jest.useFakeTimers();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should throw if checkErrors set ans path is not ', () => {
    component.checkErrors = 'forCurrentQuestion';

    expect(() => component.ngOnInit()).toThrow();
  });

  it('should subscribe to according validator if checkErrors and path are set', () => {
    const forQuizee = jest.fn().mockReturnValue(() => new Subject());
    const forCurrentQuestion = jest.fn().mockReturnValue(() => new Subject());

    QuizeeValidators.forQuizee = forQuizee;
    QuizeeValidators.forCurrentQuestion = forCurrentQuestion;

    component.checkErrors = 'forQuizee';
    component.path = 'path';

    component.ngOnInit();

    jest.runAllTimers();

    expect(forQuizee).toBeCalledTimes(1);
    expect(forCurrentQuestion).not.toBeCalled();

    component.checkErrors = 'forCurrentQuestion';
    component.path = 'answer.path';

    component.ngOnInit();

    jest.runAllTimers();

    expect(forQuizee).toBeCalledTimes(1);
    expect(forCurrentQuestion).toBeCalledTimes(1);
  });

  it('should call validator with path and once = false', () => {
    const forCurrentQuestion = jest.fn().mockReturnValue(() => new Subject());

    QuizeeValidators.forCurrentQuestion = forCurrentQuestion;

    component.checkErrors = 'forCurrentQuestion';
    component.path = 'answer.path';

    component.ngOnInit();

    jest.runAllTimers();

    expect(forCurrentQuestion).toBeCalledTimes(1);
    expect(forCurrentQuestion).toBeCalledWith(service, 'answer.path', false);
  });

  it('should set error depending on pushed value', () => {
    const subject = new Subject();
    const forCurrentQuestion = jest.fn().mockReturnValue(() => subject);

    QuizeeValidators.forCurrentQuestion = forCurrentQuestion;

    component.checkErrors = 'forCurrentQuestion';
    component.path = 'answer.path';

    component.ngOnInit();
    subject.next({});

    jest.runAllTimers();

    expect(component.error).toBeTruthy();

    subject.next(null);

    jest.runAllTimers();

    expect(component.error).toBeFalsy();
  });
});
