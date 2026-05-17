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

  it('normalizes a null error value', () => {
    try {
      handleFirestoreError(null, OperationType.GET, 'test/path');
      expect.fail('Expected to throw');
    } catch (error: any) {
      if (error.message === 'Expected to throw') throw error;
      const errorInfo = JSON.parse(error.message);
      // null is typeof 'object' but fails the `error !== null` guard, so falls to Object.prototype.toString
      expect(errorInfo.error).toBe('[object Null]');
    }
  });

  it('normalizes an undefined error value', () => {
    try {
      handleFirestoreError(undefined, OperationType.LIST, 'test/path');
      expect.fail('Expected to throw');
    } catch (error: any) {
      if (error.message === 'Expected to throw') throw error;
      const errorInfo = JSON.parse(error.message);
      expect(errorInfo.error).toBe('[object Undefined]');
    }
  });

  it('normalizes a number error value', () => {
    try {
      handleFirestoreError(42, OperationType.WRITE, 'test/path');
      expect.fail('Expected to throw');
    } catch (error: any) {
      if (error.message === 'Expected to throw') throw error;
      const errorInfo = JSON.parse(error.message);
      expect(errorInfo.error).toBe('[object Number]');
    }
  });

  it('normalizes a boolean error value', () => {
    try {
      handleFirestoreError(false, OperationType.DELETE, 'test/path');
      expect.fail('Expected to throw');
    } catch (error: any) {
      if (error.message === 'Expected to throw') throw error;
      const errorInfo = JSON.parse(error.message);
      expect(errorInfo.error).toBe('[object Boolean]');
    }
  });

  it('normalizes an empty string error', () => {
    try {
      handleFirestoreError('', OperationType.GET, 'test/path');
      expect.fail('Expected to throw');
    } catch (error: any) {
      if (error.message === 'Expected to throw') throw error;
      const errorInfo = JSON.parse(error.message);
      expect(errorInfo.error).toBe('');
    }
  });

  it('normalizes an Error instance with an empty message', () => {
    try {
      handleFirestoreError(new Error(''), OperationType.UPDATE, 'test/path');
      expect.fail('Expected to throw');
    } catch (error: any) {
      if (error.message === 'Expected to throw') throw error;
      const errorInfo = JSON.parse(error.message);
      expect(errorInfo.error).toBe('');
    }
  });

  it('normalizes an object whose message property is not a string', () => {
    // message is a number, not a string — should fall through to JSON.stringify
    const errorObj = { message: 404, code: 'not-found' };

    try {
      handleFirestoreError(errorObj, OperationType.GET, 'resources/404');
      expect.fail('Expected to throw');
    } catch (error: any) {
      if (error.message === 'Expected to throw') throw error;
      const errorInfo = JSON.parse(error.message);
      expect(errorInfo.error).toBe(JSON.stringify(errorObj));
    }
  });

  it('throws an Error instance (not just any throwable)', () => {
    let thrown: unknown;
    try {
      handleFirestoreError('boom', OperationType.CREATE, 'col/doc');
    } catch (e) {
      thrown = e;
    }
    expect(thrown).toBeInstanceOf(Error);
  });

  it('produces a thrown message that is valid JSON', () => {
    let thrown: Error | undefined;
    try {
      handleFirestoreError('json check', OperationType.UPDATE, 'col/doc');
    } catch (e: any) {
      thrown = e;
    }
    expect(() => JSON.parse(thrown!.message)).not.toThrow();
  });

  it('includes all authInfo fields from the authenticated user', () => {
    try {
      handleFirestoreError('auth fields test', OperationType.GET, 'col/doc');
      expect.fail('Expected to throw');
    } catch (error: any) {
      if (error.message === 'Expected to throw') throw error;
      const errorInfo = JSON.parse(error.message);
      const { authInfo } = errorInfo;
      expect(authInfo.userId).toBe('test-user-id');
      expect(authInfo.email).toBe('test@example.com');
      expect(authInfo.emailVerified).toBe(true);
      expect(authInfo.isAnonymous).toBe(false);
      expect(authInfo.tenantId).toBe('test-tenant');
    }
  });

  it('maps provider photoURL to photoUrl in providerInfo', () => {
    try {
      handleFirestoreError('photo url mapping', OperationType.GET, 'col/doc');
      expect.fail('Expected to throw');
    } catch (error: any) {
      if (error.message === 'Expected to throw') throw error;
      const errorInfo = JSON.parse(error.message);
      const provider = errorInfo.authInfo.providerInfo[0];
      // Firebase uses photoURL; FirestoreErrorInfo maps it to photoUrl
      expect(provider.photoUrl).toBe('https://example.com/photo.jpg');
      expect(provider.displayName).toBe('Test User');
      expect(provider.email).toBe('test@example.com');
    }
  });

  it('maps all providers when user has multiple provider entries', () => {
    const authMock = auth as any;
    const originalCurrentUser = authMock.currentUser;
    authMock.currentUser = {
      ...originalCurrentUser,
      providerData: [
        { providerId: 'google.com', displayName: 'Google User', email: 'g@example.com', photoURL: 'https://g.com/photo.jpg' },
        { providerId: 'password', displayName: null, email: 'p@example.com', photoURL: null },
      ],
    };

    try {
      handleFirestoreError('multi-provider', OperationType.LIST, 'col');
      expect.fail('Expected to throw');
    } catch (error: any) {
      if (error.message === 'Expected to throw') throw error;
      const errorInfo = JSON.parse(error.message);
      expect(errorInfo.authInfo.providerInfo).toHaveLength(2);
      expect(errorInfo.authInfo.providerInfo[0].providerId).toBe('google.com');
      expect(errorInfo.authInfo.providerInfo[1].providerId).toBe('password');
      expect(errorInfo.authInfo.providerInfo[1].photoUrl).toBeNull();
      expect(errorInfo.authInfo.providerInfo[1].displayName).toBeNull();
    } finally {
      authMock.currentUser = originalCurrentUser;
    }
  });

  it('calls console.error twice per invocation', () => {
    try {
      handleFirestoreError('log count', OperationType.WRITE, 'write/path');
    } catch {
      // expected
    }
    expect(consoleErrorSpy).toHaveBeenCalledTimes(2);
  });

  it('includes the operationType and path in the first console.error call', () => {
    try {
      handleFirestoreError('log args check', OperationType.DELETE, 'some/path');
    } catch {
      // expected
    }
    const firstCall = consoleErrorSpy.mock.calls[0];
    expect(firstCall[0]).toContain(OperationType.DELETE);
    expect(firstCall[0]).toContain('some/path');
  });

  it('includes all OperationType enum values', () => {
    const allTypes = [
      OperationType.CREATE,
      OperationType.UPDATE,
      OperationType.DELETE,
      OperationType.LIST,
      OperationType.GET,
      OperationType.WRITE,
    ];
    expect(allTypes).toEqual(['create', 'update', 'delete', 'list', 'get', 'write']);
  });

  it('preserves the operationType value in the thrown error for every OperationType', () => {
    for (const opType of [OperationType.CREATE, OperationType.UPDATE, OperationType.DELETE, OperationType.LIST, OperationType.GET, OperationType.WRITE]) {
      try {
        handleFirestoreError('op type check', opType, 'path');
        expect.fail('Expected to throw');
      } catch (error: any) {
        if (error.message === 'Expected to throw') throw error;
        const errorInfo = JSON.parse(error.message);
        expect(errorInfo.operationType).toBe(opType);
      }
    }
  });
});
