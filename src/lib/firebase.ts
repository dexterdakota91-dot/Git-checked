/* eslint-disable @typescript-eslint/no-unused-vars */
import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  onSnapshot,
  getDocFromServer
} from 'firebase/firestore';

import firebaseAppletConfig from '../../firebase-applet-config.json' with { type: 'json' };
const envFirebaseConfig = {
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const placeholders = ['dummy', '12345', 'ABCDEF'];
const isPlaceholder = (val: string | undefined) => !val || placeholders.some(p => val.includes(p));

if (
  isPlaceholder(firebaseAppletConfig.projectId) ||
  isPlaceholder(firebaseAppletConfig.apiKey) ||
  isPlaceholder(firebaseAppletConfig.appId)
) {
  console.error("CRITICAL ERROR: Firebase configuration contains placeholder values.");
  console.error("Found placeholders in firebase-applet-config.json:");
  console.error(JSON.stringify(firebaseAppletConfig, null, 2));
  throw new Error("Invalid Firebase Configuration: Placeholder values detected.");
}

const hasValidEnvConfig =
  !isPlaceholder(envFirebaseConfig.projectId) &&
  !isPlaceholder(envFirebaseConfig.apiKey) &&
  !isPlaceholder(envFirebaseConfig.appId);

const hasValidAppletConfig =
  !isPlaceholder(firebaseAppletConfig.projectId) &&
  !isPlaceholder(firebaseAppletConfig.apiKey) &&
  !isPlaceholder(firebaseAppletConfig.appId);

const firebaseConfig = hasValidEnvConfig
  ? envFirebaseConfig
  : hasValidAppletConfig
    ? firebaseAppletConfig
    : envFirebaseConfig;

if (!hasValidEnvConfig && !hasValidAppletConfig && import.meta.env.MODE !== 'test') {
  console.error('Firebase configuration appears incomplete. Provide VITE_FIREBASE_* env vars or valid firebase-applet-config.json values.');
}

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app, (firebaseAppletConfig as any).firestoreDatabaseId || "(default)");
export const googleProvider = new GoogleAuthProvider();

export { getRedirectResult };

async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      if (import.meta.env.MODE !== "test") console.error("Please check your Firebase configuration. The client is offline.");
    }
  }
}
testConnection();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    isAnonymous: boolean | undefined;
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  console.error(`Firestore Error [${operationType}] at ${path}:`, error);

  let errorMessage = 'Unknown error';
  if (typeof error === 'string') {
    errorMessage = error;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  } else if (typeof error === 'object' && error !== null) {
    if ('message' in error && typeof (error as any).message === 'string') {
      errorMessage = (error as any).message;
    } else {
      try {
        errorMessage = JSON.stringify(error);
      } catch (e: any) {

        errorMessage = "Un-stringifiable error object";
      }
    }
  } else {
    try {
      errorMessage = Object.prototype.toString.call(error);
    } catch (e: any) {
      errorMessage = "Un-stringifiable error primitive";
    }
  }

  const errInfo: FirestoreErrorInfo = {
    error: errorMessage,
    authInfo: {
      userId: auth.currentUser?.uid,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  };
  console.error('Firestore Error Info: ', JSON.stringify(errInfo, null, 2));
  throw new Error(JSON.stringify(errInfo));
}
