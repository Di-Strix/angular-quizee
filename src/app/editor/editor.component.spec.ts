import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';

import { Observable, Subject, of } from 'rxjs';

import { QuizeeService } from '../shared/services/quizee.service';

import { EditorComponent } from './editor.component';
import { EditorModule } from './editor.module';
import { QuizeeEditingService } from './quizee-editing.service';

class ActivatedRouteMock {
  paramMapValues: { [key: string]: any } = {};

  paramMap = of({ get: (key: string) => this.paramMapValues[key] });
}

class QuizeeServiceMock {
  response: Observable<any> = of(undefined);

  getQuizee = jest.fn(() => this.response);
}

describe('EditorComponent', () => {
  let component: EditorComponent;
  let fixture: ComponentFixture<EditorComponent>;
  let quizeeService: QuizeeServiceMock;
  let activatedRoute: ActivatedRouteMock;
  let quizeeEditingService: QuizeeEditingService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EditorComponent],
      imports: [EditorModule],
      providers: [
        {
          provide: QuizeeService,
          useValue: new QuizeeServiceMock(),
        },
        {
          provide: ActivatedRoute,
          useValue: new ActivatedRouteMock(),
        },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditorComponent);
    component = fixture.componentInstance;
    quizeeService = TestBed.inject(QuizeeService) as any;
    activatedRoute = TestBed.inject(ActivatedRoute) as any;
    quizeeEditingService = TestBed.inject(QuizeeEditingService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch quizee with id from url', () => {
    const idVal = 'mockValue';
    activatedRoute.paramMapValues = {
      id: idVal,
    };

    const quizObj = { [Symbol()]: 1 };
    quizeeService.response = of(quizObj);

    component.ngOnInit();

    expect(quizeeService.getQuizee).toBeCalledTimes(1);
    expect(quizeeService.getQuizee).toBeCalledWith(idVal, true);
  });

  it('should push fetched quizee to quizeeEditingService', () => {
    const idVal = 'mockValue';
    activatedRoute.paramMapValues = {
      id: idVal,
    };

    const load = jest.spyOn(quizeeEditingService, 'load');

    const quizObj = { [Symbol()]: 1 };
    quizeeService.response = of(quizObj);

    component.ngOnInit();

    expect(load).toHaveBeenCalledTimes(1);
    expect(load).toHaveBeenCalledWith(quizObj);
  });

  it('should init new quizee if id is empty', () => {
    activatedRoute.paramMapValues = {
      id: null,
    };
    const create = jest.spyOn(quizeeEditingService, 'create');

    component.ngOnInit();

    expect(quizeeService.getQuizee).not.toBeCalled();
    expect(create).toHaveBeenCalledTimes(1);
  });

  describe('handleQuestionCreation', () => {
    it('should create question', () => {
      const createQuestion = jest.spyOn(quizeeEditingService, 'createQuestion');
      component.handleQuestionCreation();

      expect(createQuestion).toHaveBeenCalledTimes(1);
    });

    it('should scroll container', () => {
      jest.useFakeTimers();

      component.questionsContainer = {
        nativeElement: { scrollTo: jest.fn() } as any,
      };

      const scrollTo = jest.spyOn(component.questionsContainer.nativeElement, 'scrollTo');
      component.handleQuestionCreation();

      jest.runAllTimers();

      expect(scrollTo).toHaveBeenCalledTimes(1);
    });
  });

  describe('quizee name', () => {
    describe('quizee caption value change', () => {
      it('should update quizee on input value change', () => {
        const getCurrentQuestion = jest.spyOn(quizeeEditingService, 'get');
        getCurrentQuestion.mockReturnValue(of({ info: { caption: 'abc' } } as any));

        const modifyCurrentQuestion = jest.spyOn(quizeeEditingService, 'modify');

        component.ngOnInit();
        component.quizeeName.setValue('abc123');

        jest.runAllTimers();

        expect(modifyCurrentQuestion).toHaveBeenCalledTimes(1);
        expect(modifyCurrentQuestion).toHaveBeenCalledWith({ info: { caption: 'abc123' } });
      });
    });

    describe('question type value change', () => {
      it('should update input value if its value differs', () => {
        const subject = new Subject();
        const getCurrentQuestion = jest.spyOn(quizeeEditingService, 'get');
        getCurrentQuestion.mockReturnValue(subject as any);

        const setValue = jest.spyOn(component.quizeeName, 'setValue');

        component.ngOnInit();
        subject.next({ info: { caption: 'abc' } });

        jest.runAllTimers();

        subject.next({ info: { caption: 'abc123' } });

        expect(setValue).toBeCalledTimes(2);
        expect(setValue.mock.calls[0][0]).toBe('abc');
        expect(setValue.mock.calls[1][0]).toBe('abc123');
      });

      it('should not update input value if it is the same', () => {
        const subject = new Subject();
        const getCurrentQuestion = jest.spyOn(quizeeEditingService, 'get');
        getCurrentQuestion.mockReturnValue(subject as any);

        const setValue = jest.spyOn(component.quizeeName, 'setValue');

        component.ngOnInit();
        subject.next({ info: { caption: 'abc' } });

        jest.runAllTimers();

        subject.next({ info: { caption: 'abc' } });

        expect(setValue).toBeCalledTimes(1);
        expect(setValue.mock.calls[0][0]).toBe('abc');
      });
    });
  });
});
