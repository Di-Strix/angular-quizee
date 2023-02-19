import { Observable, throwError } from 'rxjs';

/**
 * Transforms thrown errors rxjs stream using `throwError`
 */
export const ErrorAsStream = () => {
  return (
    target: any,
    propertyKey: string,
    descriptor: TypedPropertyDescriptor<(...args: any[]) => Observable<any>>
  ) => {
    const fn = descriptor.value as Function;

    descriptor.value = function (this: any, ...args: any[]) {
      try {
        return fn.apply(this, args);
      } catch (err) {
        return throwError(() => err);
      }
    };
  };
};
