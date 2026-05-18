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


import firebaseConfig from '../../firebase-applet-config.json' with { type: 'json' };

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || "(default)");
export const googleProvider = new GoogleAuthProvider();

// FIX: Export getRedirectResult so useFirebaseListeners can handle redirect sign-ins
export { getRedirectResult };

/**
 * Verifies Firestore connectivity by attempting to read a known test document.
 *
 * If the client is offline (error message includes "the client is offline"), logs a message advising to check Firebase configuration.
 */
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

/**
 * Normalize a Firestore-related error into structured diagnostic information and rethrow it as a JSON-encoded Error.
 *
 * Logs the original error and the constructed diagnostic object for debugging.
 *
 * @param error - The caught error value to normalize.
 * @param operationType - The Firestore operation being performed when the error occurred.
 * @param path - The Firestore document or collection path related to the operation, or `null` if not applicable.
 * @throws An `Error` whose message is the JSON serialization of the constructed `FirestoreErrorInfo` object.
 */
export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  console.error(`Firestore Error [${operationType}] at ${path}:`, error);
  
  let errorMessage = "Unknown error";
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
      } catch (e) {
        errorMessage = "Un-stringifiable error object";
      }
    }
  } else {
    try {
      errorMessage = Object.prototype.toString.call(error);
    } catch (e) {
      errorMessage = "Un-stringifiable error primitive";
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
