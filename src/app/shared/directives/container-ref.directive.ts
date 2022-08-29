import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[appContainerRef]',
})
export class ContainerRefDirective {
  constructor(public containerRef: ViewContainerRef) {}
}
