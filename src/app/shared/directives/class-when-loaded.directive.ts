import { Directive, ElementRef, Input, TemplateRef } from '@angular/core';

@Directive({
  selector: 'img[appClassWhenLoaded]',
})
export class ClassWhenLoadedDirective {
  @Input() appClassWhenLoaded!: string;
  @Input() appApplyClassTo!: HTMLElement;

  constructor(public el: ElementRef) {
    el.nativeElement.addEventListener('load', this.addClass.bind(this));
  }

  addClass() {
    (this.appApplyClassTo || this.el.nativeElement).classList.add(this.appClassWhenLoaded || 'img-loaded');
  }
}
