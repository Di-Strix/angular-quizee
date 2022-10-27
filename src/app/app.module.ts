import { NgModule } from '@angular/core';
import { ScreenTrackingService, UserTrackingService, getAnalytics, provideAnalytics } from '@angular/fire/analytics';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { ReCaptchaV3Provider, initializeAppCheck, provideAppCheck } from '@angular/fire/app-check';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { FIREBASE_OPTIONS } from '@angular/fire/compat';
import { USE_EMULATOR as USE_AUTH_EMULATOR } from '@angular/fire/compat/auth';
import { USE_EMULATOR as USE_DATABASE_EMULATOR } from '@angular/fire/compat/database';
import { USE_EMULATOR as USE_FIRESTORE_EMULATOR } from '@angular/fire/compat/firestore';
import { USE_EMULATOR as USE_FUNCTIONS_EMULATOR } from '@angular/fire/compat/functions';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getFunctions, provideFunctions } from '@angular/fire/functions';
import { MatDialogModule } from '@angular/material/dialog';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { environment } from '../environments/environment';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAnalytics(() => getAnalytics()),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideFunctions(() => getFunctions()),
    provideAppCheck(() => {
      const provider = new ReCaptchaV3Provider(environment.firebase.reCAPTCHAv3Token);
      return initializeAppCheck(undefined, {
        provider,
        isTokenAutoRefreshEnabled: true,
      });
    }),
    BrowserAnimationsModule,
    MatDialogModule,
  ],
  providers: [
    ScreenTrackingService,
    UserTrackingService,
    { provide: FIREBASE_OPTIONS, useValue: environment.firebase },
    {
      provide: USE_AUTH_EMULATOR,
      useValue: (() => {
        const auth = environment.firebase.useEmulator?.auth;
        if (!auth) return undefined;
        return [`http://${auth[0]}:${auth[1]}`];
      })(),
    },
    {
      provide: USE_FIRESTORE_EMULATOR,
      useValue: environment.firebase.useEmulator?.firestore,
    },
    {
      provide: USE_DATABASE_EMULATOR,
      useValue: environment.firebase.useEmulator?.database,
    },
    {
      provide: USE_FUNCTIONS_EMULATOR,
      useValue: environment.firebase.useEmulator?.functions,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
