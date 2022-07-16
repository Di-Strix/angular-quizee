import { ClassWhenLoadedDirective } from './class-when-loaded.directive';

describe('ClassWhenLoadedDirective', () => {
  let el: HTMLElement;
  let directive: ClassWhenLoadedDirective;

  beforeEach(() => {
    el = document.createElement('div');
    directive = new ClassWhenLoadedDirective({ nativeElement: el });
  });

  it('should add default class name, if not provided, when load event fired', () => {
    el.dispatchEvent(new Event('load'));

    expect(el.classList.length).toEqual(1);
  });

  it('should add custom class name, if provided, when load event fired', () => {
    directive.appClassWhenLoaded = 'customClassName';
    el.dispatchEvent(new Event('load'));

    expect(el.classList.length).toEqual(1);
    expect(el.classList.item(0)).toEqual('customClassName');
  });

  it('should add default class name to the provided element, if not provided, when load event fired', () => {
    const customEl = document.createElement('div');
    directive.appApplyClassTo = customEl;

    el.dispatchEvent(new Event('load'));

    expect(customEl.classList.length).toEqual(1);
  });

  it('should add custom class name to the provided element, if provided, when load event fired', () => {
    const customEl = document.createElement('div');
    directive.appApplyClassTo = customEl;

    directive.appClassWhenLoaded = 'customClassName';
    el.dispatchEvent(new Event('load'));

    expect(customEl.classList.length).toEqual(1);
    expect(customEl.classList.item(0)).toEqual('customClassName');
  });
});
