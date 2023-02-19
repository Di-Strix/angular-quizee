import { Observable, of } from 'rxjs';

import { ErrorAsStream } from './ErrorAsStream';

class TestClass {
  testValue: string = '';

  @ErrorAsStream()
  test(throwError: boolean): Observable<string> {
    if (throwError) throw new Error('Some error');

    return of('No error');
  }

  @ErrorAsStream()
  testContext(): Observable<string> {
    return of(this.testValue);
  }

  @ErrorAsStream()
  testArgs(...args: any[]): Observable<any> {
    return of([...args]);
  }
}

describe('ExceptionAsStream', () => {
  let testClass: TestClass;

  beforeEach(() => {
    testClass = new TestClass();

    jest.useFakeTimers();
  });

  it('should catch thrown exception', async () => {
    expect(() => testClass.test(true)).not.toThrow();
  });

  it('should transform thrown error to rxjs stream', async () => {
    const next = jest.fn();
    const error = jest.fn();

    testClass.test(true).subscribe({ next, error });

    await jest.runAllTimers();

    expect(next).not.toBeCalled();
    expect(error).toBeCalled();
  });

  it('should return original value if no error', async () => {
    const next = jest.fn();
    const error = jest.fn();

    testClass.test(false).subscribe({ next, error });

    await jest.runAllTimers();

    expect(error).not.toBeCalled();
    expect(next).toBeCalledWith('No error');
  });

  it('should call target function within its context', async () => {
    const next = jest.fn();
    const error = jest.fn();

    testClass.testValue = '123';
    testClass.testContext().subscribe({ next, error });

    await jest.runAllTimers();

    expect(error).not.toBeCalled();
    expect(next).toBeCalledWith('123');
  });

  it('should call target function with provided args', async () => {
    const next = jest.fn();
    const error = jest.fn();

    testClass.testArgs(1, 2, 3).subscribe({ next, error });

    await jest.runAllTimers();

    expect(error).not.toBeCalled();
    expect(next).toBeCalledWith([1, 2, 3]);
  });
});
