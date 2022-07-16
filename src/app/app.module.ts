import { NgModule } from '@angular/core';
import { ScreenTrackingService, UserTrackingService, getAnalytics, provideAnalytics } from '@angular/fire/analytics';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { ReCaptchaV3Provider, initializeAppCheck, provideAppCheck } from '@angular/fire/app-check';
import { connectAuthEmulator, getAuth, provideAuth } from '@angular/fire/auth';
import { FIREBASE_OPTIONS } from '@angular/fire/compat';
import { connectDatabaseEmulator, getDatabase, provideDatabase } from '@angular/fire/database';
import { connectFirestoreEmulator, getFirestore, provideFirestore } from '@angular/fire/firestore';
import { connectFunctionsEmulator, getFunctions, provideFunctions } from '@angular/fire/functions';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { environment } from '../environments/environment';
import { EmulatorConfig, EmulatorType } from '../environments/firebase.config.interface';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

const withEmulator = <ProviderType>(
  getProvider: () => ProviderType,
  emulatorName: EmulatorType,
  connectEmulator: (...rest: any) => any,
  paramMapper: (provider: ProviderType, host: string, port: number, options: object) => any[] = (...params) => params
): (() => ProviderType) => {
  return () => {
    const provider = getProvider();

    if (environment.firebase.useEmulator?.[emulatorName]) {
      const {
        host = 'http://localhost',
        port,
        options = {},
      } = environment.firebase.useEmulator[emulatorName] as EmulatorConfig;
      connectEmulator(...paramMapper(provider, host, port, options));
    }

    return provider;
  };
};

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAnalytics(() => getAnalytics()),
    provideAuth(
      withEmulator(getAuth, 'auth', connectAuthEmulator, (auth, host, port, options) => [
        auth,
        `${host}:${port}`,
        options,
      ])
    ),
    provideFirestore(withEmulator(getFirestore, 'firestore', connectFirestoreEmulator)),
    provideDatabase(withEmulator(getDatabase, 'database', connectDatabaseEmulator)),
    provideFunctions(withEmulator(getFunctions, 'functions', connectFunctionsEmulator)),
    provideAppCheck(() => {
      const provider = new ReCaptchaV3Provider(environment.firebase.reCAPTCHAv3Token);
      return initializeAppCheck(undefined, {
        provider,
        isTokenAutoRefreshEnabled: true,
      });
    }),
    BrowserAnimationsModule,
  ],
  providers: [
    ScreenTrackingService,
    UserTrackingService,
    { provide: FIREBASE_OPTIONS, useValue: environment.firebase },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
