import { Observable, of } from 'rxjs';

import { AutoDispatchEvent, RegisterDispatcher } from './AutoDispatchEvent';

class TestClass {
  @AutoDispatchEvent(['dispatcher'])
  someFunction(): Observable<any> {
    return of();
  }

  @AutoDispatchEvent(['dispatcher'])
  someNestedFunction(): Observable<any> {
    return of();
  }

  @AutoDispatchEvent(['dispatcher'])
  callNested(): Observable<any> {
    return this.someNestedFunction();
  }

  @RegisterDispatcher()
  dispatcher() {}

  @AutoDispatchEvent(['dispatcher'])
  throwError(): Observable<any> {
    throw new Error();

    return of();
  }

  @AutoDispatchEvent(['dispatcher'])
  throwNestedError(): Observable<any> {
    return this.throwError();
  }

  @AutoDispatchEvent(['abc'])
  invalidDispatcher(): Observable<any> {
    return of();
  }
}

describe('AutoDispatchEvent', () => {
  let testClass: TestClass;

  beforeEach(() => {
    testClass = new TestClass();
  });

  it('should call original function', () => {
    const someFunction = jest.spyOn(testClass, 'someFunction');

    testClass.someFunction();

    expect(someFunction).toBeCalledTimes(1);
  });

  it('should call function withing its original context', () => {
    const someFunction = jest.spyOn(testClass, 'someFunction').mockReturnThis();

    testClass.someFunction();

    expect(someFunction).toBeCalledTimes(1);
    expect(someFunction).toReturnWith(testClass);
  });

  it('should call dispatcher', () => {
    const dispatcher = jest.spyOn(testClass, 'dispatcher');

    testClass.someFunction();

    expect(dispatcher).toBeCalledTimes(1);
  });

  it('should call dispatcher within its original context', () => {
    const dispatcher = jest.spyOn(testClass, 'dispatcher').mockReturnThis();

    testClass.someFunction();

    expect(dispatcher).toBeCalledTimes(1);
    expect(dispatcher).toReturnWith(testClass);
  });

  it('should call dispatcher only once even if nested functions are registered for auto dispatch', () => {
    const dispatcher = jest.spyOn(testClass, 'dispatcher');
    const someNestedFunction = jest.spyOn(testClass, 'someNestedFunction');
    const callNested = jest.spyOn(testClass, 'callNested');

    testClass.callNested();

    expect(dispatcher).toBeCalledTimes(1);
    expect(callNested).toBeCalledTimes(1);
    expect(someNestedFunction).toBeCalledTimes(1);
  });

  it('should not call dispatcher if error was thrown', () => {
    const dispatcher = jest.spyOn(testClass, 'dispatcher');

    try {
      testClass.throwError();
    } catch (err) {}

    expect(dispatcher).not.toBeCalled();
  });

  it('should not call dispatcher if error was thrown in nested function', () => {
    const dispatcher = jest.spyOn(testClass, 'dispatcher');

    try {
      testClass.throwNestedError();
    } catch (err) {}

    expect(dispatcher).not.toBeCalled();
  });

  it('should re-throw error', () => {
    expect(() => testClass.throwNestedError()).toThrow();
    expect(() => testClass.throwError()).toThrow();
  });

  it('should throw an error if dispatcher was not found', () => {
    expect(() => testClass.invalidDispatcher()).toThrow();
  });
});
