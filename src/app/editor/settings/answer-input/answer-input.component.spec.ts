import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditorModule } from '../../editor.module';

import { AnswerInputComponent } from './answer-input.component';

describe('AnswerInputComponent', () => {
  let component: AnswerInputComponent;
  let fixture: ComponentFixture<AnswerInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AnswerInputComponent],
      imports: [EditorModule],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AnswerInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
