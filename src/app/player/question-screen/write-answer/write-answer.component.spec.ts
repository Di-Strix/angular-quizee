import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WriteAnswerComponent } from './write-answer.component';

describe('WriteAnswerComponent', () => {
  let component: WriteAnswerComponent;
  let fixture: ComponentFixture<WriteAnswerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [WriteAnswerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WriteAnswerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
