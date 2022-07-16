import { ViewContainerRef } from '@angular/core';

import { RenderSettingsComponentsDirective } from './render-settings-components.directive';

describe('RenderSettingComponentsDirective', () => {
  it('should create an instance', () => {
    const directive = new RenderSettingsComponentsDirective({} as any as ViewContainerRef);
    expect(directive).toBeTruthy();
  });
});
