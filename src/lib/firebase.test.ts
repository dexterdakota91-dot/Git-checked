import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(),
}));

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({
    currentUser: {
      uid: 'test-uid',
      email: 'test@example.com',
      emailVerified: true,
      isAnonymous: false,
      tenantId: 'tenant-1',
      providerData: [
        {
          providerId: 'google.com',
          displayName: 'Test User',
          email: 'test@example.com',
          photoURL: 'https://example.com/photo.png'
        }
      ]
    }
  })),
  GoogleAuthProvider: vi.fn(),
}));

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(),
  doc: vi.fn(),
  getDocFromServer: vi.fn().mockRejectedValue(new Error('the client is offline')),
}));

import { handleFirestoreError, OperationType } from './firebase';

describe('handleFirestoreError', () => {
  const originalConsoleError = console.error;

  beforeEach(() => {
    console.error = vi.fn();
  });

  afterEach(() => {
    console.error = originalConsoleError;
  });

  it('should normalize and throw a string error', () => {
    const errorString = "This is a test error";
    let caughtError: Error | undefined;

    try {
      handleFirestoreError(errorString, OperationType.GET, 'test/path');
    } catch (e: any) {
      caughtError = e;
    }

    expect(caughtError).toBeInstanceOf(Error);
    const parsed = JSON.parse(caughtError!.message);
    expect(parsed.error).toBe(errorString);
    expect(parsed.operationType).toBe(OperationType.GET);
    expect(parsed.path).toBe('test/path');
    expect(parsed.authInfo.userId).toBe('test-uid');
  });

  it('should normalize and throw an Error instance', () => {
    const errorInstance = new Error("This is an Error instance");
    let caughtError: Error | undefined;

    try {
      handleFirestoreError(errorInstance, OperationType.UPDATE, 'test/path/2');
    } catch (e: any) {
      caughtError = e;
    }

    expect(caughtError).toBeInstanceOf(Error);
    const parsed = JSON.parse(caughtError!.message);
    expect(parsed.error).toBe("This is an Error instance");
    expect(parsed.operationType).toBe(OperationType.UPDATE);
    expect(parsed.path).toBe('test/path/2');
  });

  it('should normalize and throw an object with a message property', () => {
    const errorObj = { message: "This is an object error" };
    let caughtError: Error | undefined;

    try {
      handleFirestoreError(errorObj, OperationType.DELETE, 'test/path/3');
    } catch (e: any) {
      caughtError = e;
    }

    expect(caughtError).toBeInstanceOf(Error);
    const parsed = JSON.parse(caughtError!.message);
    expect(parsed.error).toBe("This is an object error");
    expect(parsed.operationType).toBe(OperationType.DELETE);
  });

  it('should stringify a plain object without a message property', () => {
    const errorObj = { code: 500, details: "Server failure" };
    let caughtError: Error | undefined;

    try {
      handleFirestoreError(errorObj, OperationType.LIST, 'test/path/4');
    } catch (e: any) {
      caughtError = e;
    }

    expect(caughtError).toBeInstanceOf(Error);
    const parsed = JSON.parse(caughtError!.message);
    expect(parsed.error).toBe(JSON.stringify(errorObj));
  });

  it('should handle un-stringifiable objects gracefully', () => {
    const circularObj: any = {};
    circularObj.self = circularObj;
    let caughtError: Error | undefined;

    try {
      handleFirestoreError(circularObj, OperationType.CREATE, 'test/path/5');
    } catch (e: any) {
      caughtError = e;
    }

    expect(caughtError).toBeInstanceOf(Error);
    const parsed = JSON.parse(caughtError!.message);
    expect(parsed.error).toBe("Un-stringifiable error object");
  });

  it('should handle primitive types other than string', () => {
    const primitiveError = 12345;
    let caughtError: Error | undefined;

    try {
      handleFirestoreError(primitiveError, OperationType.WRITE, 'test/path/6');
    } catch (e: any) {
      caughtError = e;
    }

    expect(caughtError).toBeInstanceOf(Error);
    const parsed = JSON.parse(caughtError!.message);
    expect(parsed.error).toBe("[object Number]");
  });

  it('should handle primitives that fail Object.prototype.toString gracefully', () => {
    const originalToString = Object.prototype.toString;
    // Force toString to fail to trigger the inner catch block
    Object.prototype.toString = function() {
        throw new Error('Fake toString Error');
    };

    let caughtError: Error | undefined;

    try {
      handleFirestoreError(12345, OperationType.WRITE, 'test/path/7');
    } catch (e: any) {
      caughtError = e;
    } finally {
        Object.prototype.toString = originalToString;
    }

    expect(caughtError).toBeInstanceOf(Error);
    const parsed = JSON.parse(caughtError!.message);
    expect(parsed.error).toBe("Un-stringifiable error primitive");
  });
});
