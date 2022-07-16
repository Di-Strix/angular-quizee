import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonHarness } from '@angular/material/button/testing';

import { AuthService } from '../../services/auth.service';
import { SharedModule } from '../../shared.module';

import { AuthDialogComponent } from './auth-dialog.component';

jest.mock('../../services/auth.service');

describe('AuthDialogComponent', () => {
  let component: AuthDialogComponent;
  let fixture: ComponentFixture<AuthDialogComponent>;
  let loader: HarnessLoader;
  let authService: AuthService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AuthDialogComponent],
      imports: [SharedModule],
      providers: [AuthService],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    loader = TestbedHarnessEnvironment.loader(fixture);
    authService = TestBed.inject(AuthService) as any;
  });

  it('should have correct layout', () => {
    expect(fixture.nativeElement).toMatchSnapshot();
  });

  it('should call login function in auth service on login click', async () => {
    const LoginButton = await loader.getHarness(MatButtonHarness.with({ selector: 'button[color="primary"]' }));

    await LoginButton.click();

    expect(authService.logIn).toBeCalledTimes(1);
  });
});
