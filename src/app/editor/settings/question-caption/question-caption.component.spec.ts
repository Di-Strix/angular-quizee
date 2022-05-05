import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuestionCaptionComponent } from './question-caption.component';

describe('QuestionCaptionComponent', () => {
  let component: QuestionCaptionComponent;
  let fixture: ComponentFixture<QuestionCaptionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QuestionCaptionComponent ]
    })
    .compileComponents();
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
