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

const placeholders = ['dummy', '12345', 'ABCDEF'];
const isPlaceholder = (val: string | undefined) => !val || placeholders.some(p => val.includes(p));

const envFirebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string | undefined,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string | undefined,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string | undefined,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string | undefined,
  appId: import.meta.env.VITE_FIREBASE_APP_ID as string | undefined,
  firestoreDatabaseId: import.meta.env.VITE_FIRESTORE_DATABASE_ID as string | undefined,
};

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
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || '(default)');
export const googleProvider = new GoogleAuthProvider();

export { getRedirectResult };

async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      if (import.meta.env.MODE !== 'test') console.error('Please check your Firebase configuration. The client is offline.');
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
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
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

        errorMessage = 'Un-stringifiable error object';
      }
    }
  } else {
    try {
      errorMessage = Object.prototype.toString.call(error);
    } catch (e: any) {
      errorMessage = 'Un-stringifiable error primitive';
    }
  }

  const errInfo: FirestoreErrorInfo = {
    error: errorMessage,
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error Info: ', JSON.stringify(errInfo, null, 2));
  throw new Error(JSON.stringify(errInfo));
}
