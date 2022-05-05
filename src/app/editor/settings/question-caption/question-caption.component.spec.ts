import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditorModule } from '../../editor.module';

import { QuestionCaptionComponent } from './question-caption.component';

describe('QuestionCaptionComponent', () => {
  let component: QuestionCaptionComponent;
  let fixture: ComponentFixture<QuestionCaptionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [QuestionCaptionComponent],
      imports: [EditorModule],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(QuestionCaptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
