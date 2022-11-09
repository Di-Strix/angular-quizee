import { SeveralTrueComponent } from './several-true.component';

describe('SeveralTrueComponent', () => {
  let component: SeveralTrueComponent;

  beforeEach(async () => {
    component = new SeveralTrueComponent(null);

    jest.useFakeTimers();
  });

  describe('onInit', () => {
    it('should subscribe to control value changes', async () => {
      const sub = jest.spyOn(component.control.valueChanges, 'subscribe');

      component.ngOnInit();

      expect(sub).toBeCalledTimes(1);
    });

    it('should emit answer on control value change', async () => {
      const emit = jest.spyOn(component.answer, 'emit');

      component.ngOnInit();
      component.control.setValue(['1']);
      component.control.setValue(['2']);

      await jest.runAllTimers();

      expect(emit).toBeCalledTimes(2);
      expect(emit).toHaveBeenNthCalledWith(1, ['1']);
      expect(emit).toHaveBeenNthCalledWith(2, ['2']);
    });
  });

  describe('toggleAnswer', () => {
    it('should toggle answer', async () => {
      expect(component.control.value).toEqual([]);

      component.toggleAnswer('1');
      expect(component.control.value).toEqual(['1']);

      component.toggleAnswer('1');
      expect(component.control.value).toEqual([]);

      component.toggleAnswer('1');
      component.toggleAnswer('2');
      expect(component.control.value).toEqual(['1', '2']);

      component.toggleAnswer('1');
      expect(component.control.value).toEqual(['2']);
    });
  });
});
