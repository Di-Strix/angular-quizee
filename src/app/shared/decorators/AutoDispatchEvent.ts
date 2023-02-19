import { Observable, throwError } from 'rxjs';

const configKey = '__autoDispatchEventConfig';

const checkConfig = (target: any) =>
  target[configKey] ? target[configKey] : (target[configKey] = { entry: null, dispatchers: {} });
const getDispatcherKey = (target: any, name: string): string => target[configKey].dispatchers[name] || '';
const setDispatcherKey = (target: any, name: string, dispatcherKey: string) =>
  (target[configKey].dispatchers[name] = dispatcherKey);
const isEntrySet = (target: any) => !!target[configKey].entry;
const isEntry = (target: any, key: string) => target[configKey].entry === key;
const clearEntry = (target: any) => (target[configKey].entry = null);
const setEntry = (target: any, key: string) => (target[configKey].entry = key);

/**
 * Calls provided dispatchers after function execution.
 *
 * #### To prevent dispatchers from being invoked, simply throw an exception
 *
 * ---
 *
 * Nested functions wrapped with this decorator may be safely called. Dispatcher will be called only once
 *
 * @param callDispatchers list of dispatcher names to be invoked
 */
export const AutoDispatchEvent = (callDispatchers: string[]) => {
  return (
    target: any,
    propertyKey: string,
    descriptor: TypedPropertyDescriptor<(...args: any[]) => Observable<any>>
  ) => {
    const fn = descriptor.value as Function;

    descriptor.value = function (this: any, ...args: any[]) {
      let wrapper: Function = (fn: Function) => fn();

      checkConfig(target);

      if (!isEntrySet(target)) {
        setEntry(target, propertyKey);
        wrapper = (fn: Function) => {
          try {
            return fn();
          } catch (err) {
            clearEntry(target);

            throw err;
          }
        };
      }

      return wrapper(() => {
        const result = fn.apply(this, args);

        if (isEntry(target, propertyKey)) clearEntry(target);

        if (!isEntrySet(target)) {
          callDispatchers.forEach((name) => {
            (
              this[getDispatcherKey(target, name)] ||
              function () {
                throw new Error(`Dispatcher with name ${name} wasn't found`);
              }
            ).call(this);
          });
        }

        return result;
      });
    };
  };
};

/**
 * Registers dispatcher for current class.
 *
 * #### Function should take no arguments
 * @param name custom dispatcher name. By default function name used
 */
export const RegisterDispatcher = (name?: string) => {
  return (target: any, propertyKey: string, descriptor: TypedPropertyDescriptor<() => any>) => {
    checkConfig(target);

    setDispatcherKey(target, name || propertyKey, propertyKey);
  };
};
