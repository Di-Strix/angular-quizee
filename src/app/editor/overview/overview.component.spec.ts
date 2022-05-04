import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditorModule } from '../editor.module';
import { QuizeeEditingService } from '../quizee-editing.service';

import { OverviewComponent } from './overview.component';

describe('OverviewComponent', () => {
  let component: OverviewComponent;
  let fixture: ComponentFixture<OverviewComponent>;
  let quizeeEditingService: QuizeeEditingService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [OverviewComponent],
      providers: [],
      imports: [EditorModule],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OverviewComponent);
    component = fixture.componentInstance;
    quizeeEditingService = TestBed.inject(QuizeeEditingService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
