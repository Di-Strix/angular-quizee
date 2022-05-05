import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { EditorModule } from '../../editor.module';

import { QuestionCaptionComponent } from './question-caption.component';

describe('QuestionCaptionComponent', () => {
  let component: QuestionCaptionComponent;
  let fixture: ComponentFixture<QuestionCaptionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [QuestionCaptionComponent],
      imports: [BrowserAnimationsModule, EditorModule],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(QuestionCaptionComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
