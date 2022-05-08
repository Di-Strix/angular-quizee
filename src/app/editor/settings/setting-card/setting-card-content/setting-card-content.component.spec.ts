import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingCardContentComponent } from './setting-card-content.component';

describe('SettingCardContentComponent', () => {
  let component: SettingCardContentComponent;
  let fixture: ComponentFixture<SettingCardContentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SettingCardContentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SettingCardContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
