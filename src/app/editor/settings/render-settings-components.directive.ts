import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[appRenderSettingComponents]',
})
export class RenderSettingsComponentsDirective {
  constructor(public viewContainerRef: ViewContainerRef) {}
}
