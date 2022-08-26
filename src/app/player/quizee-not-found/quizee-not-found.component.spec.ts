import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuizeeNotFoundComponent } from './quizee-not-found.component';

describe('QuizeeNotFoundComponent', () => {
  let component: QuizeeNotFoundComponent;
  let fixture: ComponentFixture<QuizeeNotFoundComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [QuizeeNotFoundComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(QuizeeNotFoundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
