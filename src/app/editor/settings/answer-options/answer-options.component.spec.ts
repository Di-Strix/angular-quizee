import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditorModule } from '../../editor.module';

import { AnswerOptionsComponent } from './answer-options.component';

describe('AnswerOptionsComponent', () => {
  let component: AnswerOptionsComponent;
  let fixture: ComponentFixture<AnswerOptionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AnswerOptionsComponent],
      imports: [EditorModule],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AnswerOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
