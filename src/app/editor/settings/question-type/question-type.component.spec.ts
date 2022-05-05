import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { EditorModule } from '../../editor.module';

import { QuestionTypeComponent } from './question-type.component';

describe('QuestionTypeComponent', () => {
  let component: QuestionTypeComponent;
  let fixture: ComponentFixture<QuestionTypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [QuestionTypeComponent],
      imports: [BrowserAnimationsModule, EditorModule],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(QuestionTypeComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
