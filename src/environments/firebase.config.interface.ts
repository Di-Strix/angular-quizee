export type EmulatorType = 'functions' | 'auth' | 'database' | 'firestore';

export interface FirebaseConfig {
  projectId: string;
  appId: string;
  storageBucket: string;
  apiKey: string;
  authDomain: string;
  messagingSenderId: string;
  measurementId: string;
  reCAPTCHAv3Token: string;
  useEmulator?: { [key in EmulatorType]?: [host: string, port: number] };
}
