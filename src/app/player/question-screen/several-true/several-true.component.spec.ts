import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeveralTrueComponent } from './several-true.component';

describe('SeveralTrueComponent', () => {
  let component: SeveralTrueComponent;
  let fixture: ComponentFixture<SeveralTrueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SeveralTrueComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SeveralTrueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
