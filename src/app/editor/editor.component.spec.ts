import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { Quiz } from '@di-strix/quizee-types';

import { Observable, of } from 'rxjs';

import { QuizeeService } from '../shared/services/quizee.service';

import { EditorComponent } from './editor.component';
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
      imports: [],
      providers: [
        {
          provide: QuizeeService,
          useValue: new QuizeeServiceMock(),
        },
        {
          provide: ActivatedRoute,
          useValue: new ActivatedRouteMock(),
        },
        {
          provide: QuizeeEditingService,
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
});
