import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditorModule } from '../../editor.module';

import { SettingCardComponent } from './setting-card.component';

describe('SettingCardComponent', () => {
  let component: SettingCardComponent;
  let fixture: ComponentFixture<SettingCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SettingCardComponent],
      imports: [EditorModule],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SettingCardComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
