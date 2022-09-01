import { OneTrueComponent } from './one-true.component';

describe('OneTrueComponent', () => {
  let component: OneTrueComponent;
  let next: jest.Mock;
  let error: jest.Mock;

  beforeEach(async () => {
    component = new OneTrueComponent();

    next = jest.fn();
    error = jest.fn();

    jest.useFakeTimers();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('performCommit', () => {
    it('should emit provided answer', async () => {
      component.answer.subscribe({ next, error });
      component.commit.subscribe({ next, error });

      component.performCommit(['1']);

      await jest.runAllTimers();

      expect(error).not.toBeCalled();
      expect(next).toBeCalledTimes(2);
      expect(next).toHaveBeenNthCalledWith(1, ['1']);
      expect(next).toHaveBeenNthCalledWith(2, undefined);
    });
  });
});
