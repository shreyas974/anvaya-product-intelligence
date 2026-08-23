import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
}

const getEnvVar = (key: string, defaultValue = ''): string => {
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key] !== undefined) {
    return String(import.meta.env[key]);
  }
  return defaultValue;
};

export const firebaseConfig: FirebaseConfig = {
  apiKey: getEnvVar('VITE_FIREBASE_API_KEY'),
  authDomain: getEnvVar('VITE_FIREBASE_AUTH_DOMAIN', `${getEnvVar('VITE_FIREBASE_PROJECT_ID', 'anvaya-ai')}.firebaseapp.com`),
  projectId: getEnvVar('VITE_FIREBASE_PROJECT_ID', 'anvaya-ai'),
  storageBucket: getEnvVar('VITE_FIREBASE_STORAGE_BUCKET', `${getEnvVar('VITE_FIREBASE_PROJECT_ID', 'anvaya-ai')}.appspot.com`),
  messagingSenderId: getEnvVar('VITE_FIREBASE_MESSAGING_SENDER_ID'),
  appId: getEnvVar('VITE_FIREBASE_APP_ID'),
  measurementId: getEnvVar('VITE_FIREBASE_MEASUREMENT_ID'),
};

/**
 * Returns true if real Firebase API credentials have been configured.
 */
export const isFirebaseConfigured = (): boolean => {
  return Boolean(
    firebaseConfig.apiKey &&
    firebaseConfig.apiKey.length > 5 &&
    !firebaseConfig.apiKey.includes('YOUR_') &&
    firebaseConfig.projectId
  );
};

let appInstance: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let firestoreInstance: Firestore | null = null;
let storageInstance: FirebaseStorage | null = null;

export function getFirebaseApp(): FirebaseApp | null {
  if (typeof window === 'undefined') return null;
  if (!isFirebaseConfigured()) return null;

  try {
    if (!appInstance) {
      const existingApps = getApps();
      if (existingApps.length > 0) {
        appInstance = existingApps[0];
      } else {
        appInstance = initializeApp(firebaseConfig);
      }
    }
    return appInstance;
  } catch (err) {
    console.warn('[ANVAYA Firebase] Initialization note:', err);
    return null;
  }
}

export function getFirebaseAuth(): Auth | null {
  if (authInstance) return authInstance;
  const app = getFirebaseApp();
  if (app) {
    try {
      authInstance = getAuth(app);
      return authInstance;
    } catch (e) {
      console.warn('[ANVAYA Firebase Auth] Auth initialization fallback:', e);
    }
  }
  return null;
}

export function getFirebaseFirestore(): Firestore | null {
  if (firestoreInstance) return firestoreInstance;
  const app = getFirebaseApp();
  if (app) {
    try {
      firestoreInstance = getFirestore(app);
      return firestoreInstance;
    } catch (e) {
      console.warn('[ANVAYA Firebase Firestore] Firestore initialization fallback:', e);
    }
  }
  return null;
}

export function getFirebaseStorage(): FirebaseStorage | null {
  if (storageInstance) return storageInstance;
  const app = getFirebaseApp();
  if (app) {
    try {
      storageInstance = getStorage(app);
      return storageInstance;
    } catch (e) {
      console.warn('[ANVAYA Firebase Storage] Storage initialization fallback:', e);
    }
  }
  return null;
}
