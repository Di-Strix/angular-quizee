import { doSwitch, switchCase } from './switchCase';

describe('switchCase', () => {
  it('should work when switching from specified type to specified type', () => {
    const doNotCall = jest.fn();
    const call = jest.fn();

    doSwitch('ONE_TRUE', 'SEVERAL_TRUE', [
      switchCase('SEVERAL_TRUE', 'ONE_TRUE', doNotCall),
      switchCase('ONE_TRUE', 'SEVERAL_TRUE', call),
    ]);

    doSwitch('ONE_TRUE', 'SEVERAL_TRUE', [
      switchCase('SEVERAL_TRUE', 'ONE_TRUE', doNotCall),
      switchCase('WRITE_ANSWER', 'SEVERAL_TRUE', doNotCall),
      switchCase('ONE_TRUE', 'SEVERAL_TRUE', call),
    ]);

    expect(doNotCall).not.toHaveBeenCalled();
    expect(call).toHaveBeenCalledTimes(2);
  });

  it('should work when switching from any to specified type', () => {
    const doNotCall = jest.fn();
    const call = jest.fn();

    doSwitch('ONE_TRUE', 'SEVERAL_TRUE', [
      switchCase('*', 'ONE_TRUE', doNotCall),
      switchCase('*', 'SEVERAL_TRUE', call),
    ]);

    doSwitch('ONE_TRUE', 'SEVERAL_TRUE', [
      switchCase('WRITE_ANSWER', 'SEVERAL_TRUE', doNotCall),
      switchCase('*', 'SEVERAL_TRUE', call),
    ]);

    expect(doNotCall).not.toHaveBeenCalled();
    expect(call).toHaveBeenCalledTimes(2);
  });

  it('should work when switching form any to any type', () => {
    const doNotCall = jest.fn();
    const call = jest.fn();

    doSwitch('ONE_TRUE', 'SEVERAL_TRUE', [switchCase('*', 'ONE_TRUE', doNotCall), switchCase('*', '*', call)]);

    doSwitch('ONE_TRUE', 'WRITE_ANSWER', [switchCase('*', '*', call), switchCase('*', 'SEVERAL_TRUE', doNotCall)]);

    expect(doNotCall).not.toHaveBeenCalled();
    expect(call).toHaveBeenCalledTimes(2);
  });
});
