import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingCardComponent } from './setting-card.component';

describe('SettingCardComponent', () => {
  let component: SettingCardComponent;
  let fixture: ComponentFixture<SettingCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SettingCardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SettingCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
