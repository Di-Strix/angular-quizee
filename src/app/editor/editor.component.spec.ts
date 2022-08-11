import { Location } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';

import { Subject, of, throwError } from 'rxjs';

import { QuizeeService } from '../shared/services/quizee.service';

import { EditorComponent } from './editor.component';
import { QuizeeEditingService } from './quizee-editing.service';

class ActivatedRouteMock {
  paramMapValues: { [key: string]: any } = {};

  paramMap = of({ get: (key: string) => this.paramMapValues[key] });
}

jest.mock('../shared/services/quizee.service');
jest.mock('./quizee-editing.service');
jest.mock('@angular/router');
jest.mock('@angular/common');
jest.mock('@angular/material/dialog');

describe('EditorComponent', () => {
  let component: EditorComponent;
  let quizeeService: jest.MockedClass<typeof QuizeeService>['prototype'];
  let activatedRoute: ActivatedRouteMock;
  let quizeeEditingService: jest.MockedClass<typeof QuizeeEditingService>['prototype'];
  let location: Location;
  let router: Router;
  let dialog: jest.MockedClass<typeof MatDialog>['prototype'];

  beforeEach(() => {
    quizeeService = new (QuizeeService as any)();
    activatedRoute = new ActivatedRouteMock() as any;
    location = new (Location as any)();
    dialog = new (MatDialog as any)();
    router = new (Router as any)();
    quizeeEditingService = new QuizeeEditingService() as any;

    quizeeEditingService.get.mockReturnValue(of());
    quizeeEditingService.getQuizeeErrors.mockReturnValue(of([]));

    component = new EditorComponent(
      activatedRoute as any,
      quizeeService,
      quizeeEditingService,
      router,
      location,
      dialog
    );

    jest.useFakeTimers();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('onInit', () => {
    it('should fetch quizee with id from url', () => {
      const idVal = 'mockValue';
      activatedRoute.paramMapValues = {
        id: idVal,
      };

      const quizObj = { [Symbol()]: 1 };
      jest.spyOn(quizeeService, 'getQuizee').mockReturnValue(of(quizObj) as any);

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
      jest.spyOn(quizeeService, 'getQuizee').mockReturnValue(of(quizObj) as any);

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

    describe('Validation error', () => {
      it('should subscribe to quizee errors', async () => {
        component.ngOnInit();

        await jest.runAllTimers();

        expect(quizeeEditingService.getQuizeeErrors).toBeCalled();
      });

      it('should set validation error if any', async () => {
        const subject = new Subject();
        quizeeEditingService.getQuizeeErrors.mockReturnValue(subject as any);

        component.ngOnInit();
        subject.next([{ path: ['questions', 0] }] as any);

        await jest.runAllTimers();

        expect(component.validationError).toMatch(/^Question \d/);

        subject.next([{ path: ['answers', 0] }] as any);

        await jest.runAllTimers();

        expect(component.validationError).toMatch(/^Question \d/);

        subject.next([{ path: ['info'] }] as any);

        await jest.runAllTimers();

        expect(component.validationError).toMatch(/^Quiz contains /);
      });

      it('should clear validation error if no errors', async () => {
        const subject = new Subject();
        quizeeEditingService.getQuizeeErrors.mockReturnValue(subject as any);

        component.ngOnInit();
        subject.next([{ path: ['questions', 0] }] as any);

        await jest.runAllTimers();

        subject.next([] as any);

        await jest.runAllTimers();

        expect(component.validationError).toEqual('');
      });
    });
  });

  describe('onDestroy', () => {
    it('should unsubscribe', async () => {
      const subject = new Subject();

      quizeeEditingService.get.mockReturnValue(subject as any);
      activatedRoute.paramMap = subject as any;
      (component.quizeeName as any).valueChanges = subject as any;

      component.ngOnInit();

      await jest.runAllTimers();

      component.ngOnDestroy();

      await jest.runAllTimers();

      expect(subject.observed).toBeFalsy();
    });
  });

  describe('Quizee get error', () => {
    it('should prompt to create new quizee if quizee with provided id not found', () => {
      activatedRoute.paramMapValues = {
        id: 'someId',
      };

      jest.spyOn(quizeeService, 'getQuizee').mockReturnValue(throwError(() => new Error()));
      const openDialog = jest.spyOn(dialog, 'open');

      component.ngOnInit();

      expect(quizeeService.getQuizee).toBeCalledTimes(1);
      expect(openDialog).toBeCalledTimes(1);
    });

    it('should redirect to blank editor if creation approved', () => {
      activatedRoute.paramMapValues = {
        id: 'someId',
      };

      jest.spyOn(quizeeService, 'getQuizee').mockReturnValue(throwError(() => new Error()));
      const openDialog = jest.spyOn(dialog, 'open').mockReturnValue({ afterClosed: () => of(true) } as any);
      const routerNavigate = jest.spyOn(router, 'navigate');

      component.ngOnInit();

      expect(quizeeService.getQuizee).toBeCalledTimes(1);
      expect(openDialog).toBeCalledTimes(1);
      expect(routerNavigate).toBeCalledTimes(1);
      expect(routerNavigate).toBeCalledWith(['../'], { relativeTo: (component as any).route });
    });

    it('should redirect to home if creation discarded', () => {
      activatedRoute.paramMapValues = {
        id: 'someId',
      };

      jest.spyOn(quizeeService, 'getQuizee').mockReturnValue(throwError(() => new Error()));
      const openDialog = jest.spyOn(dialog, 'open').mockReturnValue({ afterClosed: () => of(false) } as any);
      const routerNavigate = jest.spyOn(router, 'navigate');

      component.ngOnInit();

      expect(quizeeService.getQuizee).toBeCalledTimes(1);
      expect(openDialog).toBeCalledTimes(1);
      expect(routerNavigate).toBeCalledTimes(1);
      expect(routerNavigate).toBeCalledWith(['']);
    });
  });

  describe('handleQuestionCreation', () => {
    it('should create question', () => {
      const createQuestion = jest.spyOn(quizeeEditingService, 'createQuestion');
      component.handleQuestionCreation();

      expect(createQuestion).toHaveBeenCalledTimes(1);
    });

    it('should scroll container', async () => {
      jest.useFakeTimers();

      component.questionsContainer = {
        nativeElement: { scrollTo: jest.fn() } as any,
      };

      const scrollTo = jest.spyOn(component.questionsContainer.nativeElement, 'scrollTo');
      component.handleQuestionCreation();

      await jest.runAllTimers();

      expect(scrollTo).toHaveBeenCalledTimes(1);
    });
  });

  describe('quizee name', () => {
    describe('quizee caption value change', () => {
      it('should update quizee on input value change', async () => {
        quizeeEditingService.getCurrentQuestion.mockReturnValue(of({ info: { caption: 'abc' } } as any));

        component.ngOnInit();
        component.quizeeName.setValue('abc123');

        await jest.runAllTimers();

        expect(quizeeEditingService.modify).toHaveBeenCalledTimes(1);
        expect(quizeeEditingService.modify).toHaveBeenCalledWith({ info: { caption: 'abc123' } });
      });
    });

    describe('question type value change', () => {
      it('should update input value if its value differs', async () => {
        const subject = new Subject();
        const getCurrentQuestion = jest.spyOn(quizeeEditingService, 'get');
        getCurrentQuestion.mockReturnValue(subject as any);

        const setValue = jest.spyOn(component.quizeeName, 'setValue');

        component.ngOnInit();
        subject.next({ info: { caption: 'abc' } });

        await jest.runAllTimers();

        subject.next({ info: { caption: 'abc123' } });

        expect(setValue).toBeCalledTimes(2);
        expect(setValue.mock.calls[0][0]).toBe('abc');
        expect(setValue.mock.calls[1][0]).toBe('abc123');
      });

      it('should not update input value if it is the same', async () => {
        const subject = new Subject();
        const getCurrentQuestion = jest.spyOn(quizeeEditingService, 'get');
        getCurrentQuestion.mockReturnValue(subject as any);

        const setValue = jest.spyOn(component.quizeeName, 'setValue');

        component.ngOnInit();
        subject.next({ info: { caption: 'abc' } });

        await jest.runAllTimers();

        subject.next({ info: { caption: 'abc' } });

        expect(setValue).toBeCalledTimes(1);
        expect(setValue.mock.calls[0][0]).toBe('abc');
      });
    });
  });

  describe('publish', () => {
    let beforeClosed: jest.Mock;

    beforeEach(() => {
      beforeClosed = jest.fn().mockReturnValue(of());

      dialog.open.mockReturnValue({ beforeClosed } as any);
    });

    it('should save subscription', async () => {
      const addSub = jest.spyOn(component.subs, 'add');

      component.publish();

      await jest.runAllTimers();

      expect(addSub).toBeCalledTimes(1);
    });

    it('should open dialog', async () => {
      component.publish();

      await jest.runAllTimers();

      expect(dialog.open).toBeCalledTimes(1);
    });

    it('should reopen dialog if retry: true is returned', async () => {
      beforeClosed.mockReturnValueOnce(of({ retry: true }));

      component.publish();

      await jest.runAllTimers();

      expect(dialog.open).toBeCalledTimes(2);
    });

    it('should not reopen dialog id retry is false or undefined', async () => {
      beforeClosed.mockReturnValueOnce(of({ retry: false }));
      beforeClosed.mockReturnValueOnce(of(null));

      component.publish();

      await jest.runAllTimers();

      expect(dialog.open).toBeCalledTimes(1);

      component.publish();

      await jest.runAllTimers();

      expect(dialog.open).toBeCalledTimes(2);
    });
  });
});
