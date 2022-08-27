import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuestionScreenComponent } from './question-screen.component';

describe('QuestionScreenComponent', () => {
  let component: QuestionScreenComponent;
  let fixture: ComponentFixture<QuestionScreenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [QuestionScreenComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(QuestionScreenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
