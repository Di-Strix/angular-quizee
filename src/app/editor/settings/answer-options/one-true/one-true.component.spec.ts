import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OneTrueComponent } from './one-true.component';

describe('OneTrueComponent', () => {
  let component: OneTrueComponent;
  let fixture: ComponentFixture<OneTrueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OneTrueComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OneTrueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
