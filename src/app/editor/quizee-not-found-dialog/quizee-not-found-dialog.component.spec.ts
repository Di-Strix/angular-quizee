import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonHarness } from '@angular/material/button/testing';
import { MatDialogRef } from '@angular/material/dialog';

import { EditorModule } from '../editor.module';

import { QuizeeNotFoundDialogComponent } from './quizee-not-found-dialog.component';

describe('QuizeeNotFoundDialogComponent', () => {
  let component: QuizeeNotFoundDialogComponent;
  let fixture: ComponentFixture<QuizeeNotFoundDialogComponent>;
  let dialogRef: MatDialogRef<QuizeeNotFoundDialogComponent>;
  let loader: HarnessLoader;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [QuizeeNotFoundDialogComponent],
      imports: [EditorModule],
      providers: [{ provide: MatDialogRef, useValue: { close: jest.fn() } }],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(QuizeeNotFoundDialogComponent);
    component = fixture.componentInstance;
    dialogRef = TestBed.inject(MatDialogRef);
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should close with false on discard', async () => {
    const noButton = await loader.getHarness(MatButtonHarness.with({ text: /^.*\bno.*$/i }));

    await noButton.click();

    expect(dialogRef.close).toBeCalledTimes(1);
    expect(dialogRef.close).toBeCalledWith(false);
  });

  it('should close with true on approve', async () => {
    const okButton = await loader.getHarness(MatButtonHarness.with({ text: /^.*\byes.*$/i }));

    await okButton.click();

    expect(dialogRef.close).toBeCalledTimes(1);
    expect(dialogRef.close).toBeCalledWith(true);
  });
});
