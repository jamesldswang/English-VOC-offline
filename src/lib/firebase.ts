import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import rawConfig from '../../firebase-applet-config.json';

let app: FirebaseApp | null = null;
let dbInstance: Firestore | null = null;

try {
  if (rawConfig && rawConfig.projectId) {
    app = !getApps().length ? initializeApp(rawConfig) : getApp();
    dbInstance = getFirestore(
      app,
      rawConfig.firestoreDatabaseId || undefined
    );
  }
} catch (err) {
  console.warn('Firebase initialization skipped or failed:', err);
}

export const db: Firestore | null = dbInstance;
export default app;

