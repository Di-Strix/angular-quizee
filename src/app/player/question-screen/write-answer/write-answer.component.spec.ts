import { WriteAnswerComponent } from './write-answer.component';

describe('WriteAnswerComponent', () => {
  let component: WriteAnswerComponent;

  beforeEach(async () => {
    component = new WriteAnswerComponent();

    jest.useFakeTimers();
  });

  describe('onInit', () => {
    beforeEach(() => {
      const focus = jest.fn();
      component.answerInputRef = { nativeElement: { focus } };
    });

    it('should subscribe to control value changes', async () => {
      const sub = jest.spyOn(component.control.valueChanges, 'subscribe');

      component.ngOnInit();

      expect(sub).toBeCalledTimes(1);
    });

    it('should emit answer on value change', async () => {
      const emit = jest.spyOn(component.answer, 'emit');

      component.ngOnInit();
      component.control.setValue('1');
      component.control.setValue('2');

      await jest.runAllTimers();

      expect(emit).toBeCalledTimes(2);
      expect(emit).toHaveBeenNthCalledWith(1, ['1']);
      expect(emit).toHaveBeenNthCalledWith(2, ['2']);
    });

    it('should focus on field with timeout', async () => {
      const focus = jest.fn();
      component.answerInputRef = { nativeElement: { focus } };

      component.ngOnInit();

      expect(focus).not.toBeCalled();

      await jest.runAllTimers();

      expect(focus).toBeCalledTimes(1);
    });
  });
});
