interface EmulatorConfig {
  host?: string,
  port?: number
}

export interface FirebaseConfig {
  projectId: string,
  appId: string,
  storageBucket: string,
  apiKey: string,
  authDomain: string,
  messagingSenderId: string,
  measurementId: string,
  reCAPTCHAv3Token: string,
  useEmulator?: {
    functions?: EmulatorConfig,
    auth?: EmulatorConfig,
    database?: EmulatorConfig,
    firestore?: EmulatorConfig,
  }
}