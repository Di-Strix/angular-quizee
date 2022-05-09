import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditorModule } from 'src/app/editor/editor.module';

import { SettingCardTitleComponent } from './setting-card-title.component';

describe('SettingCardTitleComponent', () => {
  let component: SettingCardTitleComponent;
  let fixture: ComponentFixture<SettingCardTitleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SettingCardTitleComponent],
      imports: [EditorModule],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SettingCardTitleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
