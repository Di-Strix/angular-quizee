import { Directive, ElementRef, Input } from '@angular/core';

@Directive({
  selector: 'img[appClassWhenLoaded]',
})
export class ClassWhenLoadedDirective {
  @Input() appClassWhenLoaded!: string;

  constructor(public el: ElementRef) {
    el.nativeElement.addEventListener('load', this.addClass.bind(this));
  }

  addClass() {
    this.el.nativeElement.classList.add(this.appClassWhenLoaded || 'img-loaded');
  }
}
