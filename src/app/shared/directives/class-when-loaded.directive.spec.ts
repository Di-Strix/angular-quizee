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
});
