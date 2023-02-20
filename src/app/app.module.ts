import { NgModule } from '@angular/core';
import { ScreenTrackingService, UserTrackingService, getAnalytics, provideAnalytics } from '@angular/fire/analytics';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { ReCaptchaV3Provider, initializeAppCheck, provideAppCheck } from '@angular/fire/app-check';
import { connectAuthEmulator, getAuth, provideAuth } from '@angular/fire/auth';
import { connectFirestoreEmulator, getFirestore, provideFirestore } from '@angular/fire/firestore';
import { connectFunctionsEmulator, getFunctions, provideFunctions } from '@angular/fire/functions';
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
    provideAuth(() => {
      const auth = getAuth();

      if (environment.firebase.useEmulator?.auth) {
        const [host, port] = environment.firebase.useEmulator?.auth;
        const url = `http://${host}:${port}`;
        connectAuthEmulator(auth, url, { disableWarnings: true });
      }

      return auth;
    }),
    provideFirestore(() => {
      const firestore = getFirestore();

      if (environment.firebase.useEmulator?.firestore) {
        const [host, port] = environment.firebase.useEmulator?.firestore;
        connectFirestoreEmulator(firestore, host, port);
      }

      return firestore;
    }),
    provideFunctions(() => {
      const functions = getFunctions();

      if (environment.firebase.useEmulator?.functions) {
        const [host, port] = environment.firebase.useEmulator?.functions;
        connectFunctionsEmulator(functions, host, port);
      }
      return functions;
    }),
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
  providers: [ScreenTrackingService, UserTrackingService],
  bootstrap: [AppComponent],
})
export class AppModule {}
