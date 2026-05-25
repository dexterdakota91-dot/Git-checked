/* eslint-disable @typescript-eslint/no-unused-vars */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('../../firebase-applet-config.json', () => ({
  default: {
    projectId: "real-project-id",
    appId: "real-app-id",
    apiKey: "real-api-key",
    authDomain: "real-auth-domain",
    firestoreDatabaseId: "(default)",
    storageBucket: "real-storage-bucket",
    messagingSenderId: "real-messaging-sender",
    measurementId: "real-measurement-id"
  }
}));

vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(),
  getApps: vi.fn(() => []),
  getApp: vi.fn(),
}));

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({ currentUser: null })),
  GoogleAuthProvider: vi.fn(),
  signInWithPopup: vi.fn(),
  signInWithRedirect: vi.fn(),
  getRedirectResult: vi.fn(),
  onAuthStateChanged: vi.fn(),
}));

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(),
  doc: vi.fn(),
  getDoc: vi.fn(),
  setDoc: vi.fn(),
  collection: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  onSnapshot: vi.fn(),
  getDocFromServer: vi.fn().mockRejectedValue(new Error('the client is offline')),
}));

import { handleFirestoreError, OperationType } from './firebase';

describe('handleFirestoreError', () => {
  it('should handle string errors', () => {
    expect(() => handleFirestoreError('String error', OperationType.GET, 'path'))
      .toThrow(/String error/);
  });

  it('should handle Error instances', () => {
    expect(() => handleFirestoreError(new Error('Instance error'), OperationType.GET, 'path'))
      .toThrow(/Instance error/);
  });

  it('should handle objects with message property', () => {
    expect(() => handleFirestoreError({ message: 'Object error' }, OperationType.GET, 'path'))
      .toThrow(/Object error/);
  });

  it('should handle JSON-stringifiable objects', () => {
    expect(() => handleFirestoreError({ custom: 'error' }, OperationType.GET, 'path'))
      .toThrow(new RegExp(".*custom.*error.*"));
  });

  it('should handle un-stringifiable objects gracefully', () => {
    const circularObj: any = {};
    circularObj.self = circularObj;
    expect(() => handleFirestoreError(circularObj, OperationType.GET, 'path'))
      .toThrow(/Un-stringifiable error object/);
  });

  it('should handle arbitrary primitives', () => {
    expect(() => handleFirestoreError(42, OperationType.GET, 'path'))
      .toThrow(/\[object Number\]/);
  });

  it('should include correct operation info', () => {
    expect.assertions(2);
    try {
      handleFirestoreError('test', OperationType.CREATE, 'users/123');
    } catch (e: any) {
      const parsed = JSON.parse(e.message);
      expect(parsed.operationType).toBe('create');
      expect(parsed.path).toBe('users/123');
    }
  });
});
