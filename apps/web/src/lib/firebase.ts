import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { GoogleAuthProvider, getAuth, onAuthStateChanged, signInWithPopup, signOut, type User } from 'firebase/auth';

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const firebaseEnabled = Boolean(config.apiKey && config.projectId);

let app: FirebaseApp | null = null;
function getApp(): FirebaseApp | null {
  if (!firebaseEnabled) return null;
  if (!app) app = getApps()[0] ?? initializeApp(config);
  return app;
}

export function firebaseAuth() {
  const a = getApp();
  return a ? getAuth(a) : null;
}

export async function signInWithGoogle(): Promise<User> {
  const auth = firebaseAuth();
  if (!auth) throw new Error('Firebase chưa được cấu hình (VITE_FIREBASE_*)');
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  const res = await signInWithPopup(auth, provider);
  return res.user;
}

export async function firebaseSignOut() {
  const auth = firebaseAuth();
  if (auth) await signOut(auth);
}

/** Chờ Firebase khôi phục phiên (lần đầu load). */
export function waitForFirebaseUser(): Promise<User | null> {
  const auth = firebaseAuth();
  if (!auth) return Promise.resolve(null);
  return new Promise((resolve) => {
    const unsub = onAuthStateChanged(auth, (u) => {
      unsub();
      resolve(u);
    });
  });
}

export async function getFirebaseIdToken(): Promise<string | null> {
  const auth = firebaseAuth();
  const u = auth?.currentUser;
  return u ? u.getIdToken() : null;
}
