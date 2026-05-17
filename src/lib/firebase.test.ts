import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { handleFirestoreError, OperationType, auth } from './firebase';

// Mock Firebase dependencies
vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(),
}));

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({
    currentUser: {
      uid: 'test-user-id',
      email: 'test@example.com',
      emailVerified: true,
      isAnonymous: false,
      tenantId: 'test-tenant',
      providerData: [
        {
          providerId: 'google.com',
          displayName: 'Test User',
          email: 'test@example.com',
          photoURL: 'https://example.com/photo.jpg',
        },
      ],
    },
  })),
  GoogleAuthProvider: vi.fn(),
  getRedirectResult: vi.fn(),
  onAuthStateChanged: vi.fn(),
  signInWithPopup: vi.fn(),
  signInWithRedirect: vi.fn(),
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
  getDocFromServer: vi.fn().mockRejectedValue(new Error('the client is offline')), // mock connection failure to avoid hanging
}));

describe('handleFirestoreError', () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    // Suppress console.error during tests
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    vi.clearAllMocks();
  });

  it('normalizes a string error', () => {
    const errorString = 'A string error occurred';

    expect(() => handleFirestoreError(errorString, OperationType.GET, 'test/path'))
      .toThrowError(new RegExp(`"error":"${errorString}"`));

    // To perform more detailed assertions on the JSON, we catch it explicitly
    try {
      handleFirestoreError(errorString, OperationType.GET, 'test/path');
      expect.fail('Expected to throw');
    } catch (error: any) {
      if (error.message === 'Expected to throw') throw error;
      const errorInfo = JSON.parse(error.message);
      expect(errorInfo.error).toBe(errorString);
      expect(errorInfo.operationType).toBe(OperationType.GET);
      expect(errorInfo.path).toBe('test/path');
      expect(errorInfo.authInfo.userId).toBe('test-user-id');
      expect(errorInfo.authInfo.providerInfo[0].providerId).toBe('google.com');
    }
  });

  it('normalizes an Error instance', () => {
    const errorInstance = new Error('An error instance occurred');

    try {
      handleFirestoreError(errorInstance, OperationType.CREATE, 'test/doc');
      expect.fail('Expected to throw');
    } catch (error: any) {
      if (error.message === 'Expected to throw') throw error;
      const errorInfo = JSON.parse(error.message);
      expect(errorInfo.error).toBe('An error instance occurred');
      expect(errorInfo.operationType).toBe(OperationType.CREATE);
    }
  });

  it('normalizes an object with a message property', () => {
    const errorObj = { message: 'Object with message', code: 500 };

    try {
      handleFirestoreError(errorObj, OperationType.UPDATE, null);
      expect.fail('Expected to throw');
    } catch (error: any) {
      if (error.message === 'Expected to throw') throw error;
      const errorInfo = JSON.parse(error.message);
      expect(errorInfo.error).toBe('Object with message');
      expect(errorInfo.path).toBeNull();
    }
  });

  it('normalizes a plain object without a message property', () => {
    const errorObj = { code: 'not-found', details: 'Item not found' };

    try {
      handleFirestoreError(errorObj, OperationType.DELETE, 'path/123');
      expect.fail('Expected to throw');
    } catch (error: any) {
      if (error.message === 'Expected to throw') throw error;
      const errorInfo = JSON.parse(error.message);
      expect(errorInfo.error).toBe(JSON.stringify(errorObj));
    }
  });

  it('normalizes an un-stringifiable object', () => {
    const circularObj: any = { name: 'circular' };
    circularObj.self = circularObj; // Circular reference prevents stringification

    try {
      handleFirestoreError(circularObj, OperationType.LIST, 'collection');
      expect.fail('Expected to throw');
    } catch (error: any) {
      if (error.message === 'Expected to throw') throw error;
      const errorInfo = JSON.parse(error.message);
      expect(errorInfo.error).toBe('Un-stringifiable error object');
    }
  });

  it('normalizes an un-stringifiable primitive', () => {
    const sym = Symbol('test symbol');

    try {
      handleFirestoreError(sym, OperationType.WRITE, 'write/path');
      expect.fail('Expected to throw');
    } catch (error: any) {
      if (error.message === 'Expected to throw') throw error;
      const errorInfo = JSON.parse(error.message);
      expect(errorInfo.error).toBe('[object Symbol]');
    }
  });

  it('handles unauthenticated users gracefully', () => {
    const authMock = auth as any;
    const originalCurrentUser = authMock.currentUser;
    authMock.currentUser = null;

    try {
      handleFirestoreError('test error', OperationType.GET, 'test');
      expect.fail('Expected to throw');
    } catch (error: any) {
      if (error.message === 'Expected to throw') throw error;
      const errorInfo = JSON.parse(error.message);
      expect(errorInfo.authInfo.userId).toBeUndefined();
      expect(errorInfo.authInfo.email).toBeUndefined();
      expect(errorInfo.authInfo.providerInfo).toEqual([]);
    } finally {
      authMock.currentUser = originalCurrentUser;
    }
  });
});
