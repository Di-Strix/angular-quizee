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

  @RegisterDispatcher()
  dispatcher() {}
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
    const someFunction = jest.spyOn(testClass, 'someFunction').mockImplementation(() => testClass.someNestedFunction());

    testClass.someFunction();

    expect(dispatcher).toBeCalledTimes(1);
    expect(someFunction).toBeCalledTimes(1);
    expect(someNestedFunction).toBeCalledTimes(1);
  });

  it('should emit an error if dispatcher was not found', () => {
    class AnotherTestClass {
      @AutoDispatchEvent(['abc'])
      fn(): Observable<any> {
        return of();
      }
    }

    const testClass = new AnotherTestClass();
    const next = jest.fn();
    const error = jest.fn();

    testClass.fn().subscribe({ next, error });

    expect(next).not.toBeCalled();
    expect(error).toBeCalled();
  });
});
