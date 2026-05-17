import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createAuthSlice } from '../authSlice';
import { signInWithPopup, signInWithRedirect, signOut } from 'firebase/auth';

vi.mock('firebase/auth', () => ({
  signInWithPopup: vi.fn(),
  signInWithRedirect: vi.fn(),
  signOut: vi.fn(),
}));

vi.mock('../../../lib/firebase', () => ({
  auth: {},
  googleProvider: {},
}));

describe('authSlice', () => {
  let setMock: ReturnType<typeof vi.fn>;
  let getMock: ReturnType<typeof vi.fn>;
  let apiMock: ReturnType<typeof vi.fn>;
  let slice: ReturnType<typeof createAuthSlice>;

  beforeEach(() => {
    vi.clearAllMocks();
    setMock = vi.fn();
    getMock = vi.fn();
    apiMock = vi.fn();
    slice = createAuthSlice(setMock, getMock, apiMock);

    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('initializes with correct default state', () => {
    expect(slice.currentUser).toBeNull();
    expect(slice.isAuthReady).toBe(false);
    expect(slice.loginError).toBeNull();
    expect(slice.isLoggingIn).toBe(false);
  });

  it('does not include userState or setUserState (moved to bankingSlice/uiSlice)', () => {
    // PR change: userState/setUserState were removed from authSlice
    expect((slice as any).userState).toBeUndefined();
    expect((slice as any).setUserState).toBeUndefined();
  });

  describe('handleLogin — unauthorized-domain error (PR fix)', () => {
    it('sets specific loginError message for auth/unauthorized-domain', async () => {
      const domainError = new Error('Unauthorized domain');
      (domainError as any).code = 'auth/unauthorized-domain';
      vi.mocked(signInWithPopup).mockRejectedValueOnce(domainError);

      await slice.handleLogin();

      const loginErrorCall = setMock.mock.calls.find(
        (call) => call[0]?.loginError !== undefined && call[0]?.loginError !== null
      );
      expect(loginErrorCall).toBeDefined();
      expect(loginErrorCall![0].loginError).toContain('This domain is not authorized in Firebase');
      expect(loginErrorCall![0].loginError).toContain('Firebase Console');
    });

    it('calls console.error with guidance for unauthorized-domain', async () => {
      const domainError = new Error('Unauthorized domain');
      (domainError as any).code = 'auth/unauthorized-domain';
      vi.mocked(signInWithPopup).mockRejectedValueOnce(domainError);

      await slice.handleLogin();

      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('Unauthorized domain'),
        domainError
      );
    });
  });

  describe('handleLogin — isLoggingIn always reset in finally (PR fix)', () => {
    it('sets isLoggingIn to false even after successful popup', async () => {
      vi.mocked(signInWithPopup).mockResolvedValueOnce({} as never);

      await slice.handleLogin();

      expect(setMock).toHaveBeenCalledWith({ isLoggingIn: false });
    });

    it('sets isLoggingIn to false after popup-blocked redirect fallback', async () => {
      const popupError = new Error('Popup blocked');
      (popupError as any).code = 'auth/popup-blocked';
      vi.mocked(signInWithPopup).mockRejectedValueOnce(popupError);
      // signInWithRedirect returns (navigates away), so it does NOT throw
      vi.mocked(signInWithRedirect).mockResolvedValueOnce({} as never);

      // The function returns early after redirect call, but finally still runs
      await slice.handleLogin();

      // After redirect, the function returns early — isLoggingIn must NOT be set false
      // because the page navigates away. This behavior changed in the PR to always set false,
      // but the redirect path returns before finally via 'return;'.
      // The finally block runs after 'return', but for redirect path the function
      // returns early, meaning finally still runs and sets isLoggingIn: false.
      expect(setMock).toHaveBeenCalledWith({ isLoggingIn: false });
    });

    it('sets isLoggingIn to false when popup-blocked redirect also fails', async () => {
      const popupError = new Error('Popup blocked');
      (popupError as any).code = 'auth/popup-blocked';
      vi.mocked(signInWithPopup).mockRejectedValueOnce(popupError);
      vi.mocked(signInWithRedirect).mockRejectedValueOnce(new Error('Redirect failed'));

      await slice.handleLogin();

      expect(setMock).toHaveBeenCalledWith({ loginError: 'Sign-in failed. Please try again.' });
      expect(setMock).toHaveBeenCalledWith({ isLoggingIn: false });
    });

    it('sets isLoggingIn to false for unauthorized-domain error', async () => {
      const domainError = new Error('Unauthorized domain');
      (domainError as any).code = 'auth/unauthorized-domain';
      vi.mocked(signInWithPopup).mockRejectedValueOnce(domainError);

      await slice.handleLogin();

      expect(setMock).toHaveBeenCalledWith({ isLoggingIn: false });
    });

    it('sets isLoggingIn to false for generic login error', async () => {
      vi.mocked(signInWithPopup).mockRejectedValueOnce(new Error('Network error'));

      await slice.handleLogin();

      expect(setMock).toHaveBeenCalledWith({ isLoggingIn: false });
    });
  });

  describe('handleLogin — popup-closed-by-user and cancelled-popup-request also redirect', () => {
    it.each([
      'auth/popup-closed-by-user',
      'auth/cancelled-popup-request',
    ])('falls back to redirect for %s error code', async (code) => {
      const err = new Error(code);
      (err as any).code = code;
      vi.mocked(signInWithPopup).mockRejectedValueOnce(err);
      vi.mocked(signInWithRedirect).mockResolvedValueOnce({} as never);

      await slice.handleLogin();

      expect(signInWithRedirect).toHaveBeenCalled();
    });
  });

  describe('handleLogin — generic errors', () => {
    it('sets loginError with error message for unknown errors', async () => {
      vi.mocked(signInWithPopup).mockRejectedValueOnce(new Error('Some unexpected error'));

      await slice.handleLogin();

      const loginErrorCall = setMock.mock.calls.find(
        (call) => call[0]?.loginError === 'Some unexpected error'
      );
      expect(loginErrorCall).toBeDefined();
    });

    it('sets fallback error message when error has no message', async () => {
      const err: any = {};
      vi.mocked(signInWithPopup).mockRejectedValueOnce(err);

      await slice.handleLogin();

      const loginErrorCall = setMock.mock.calls.find(
        (call) => call[0]?.loginError === 'Sign-in failed. Please try again.'
      );
      expect(loginErrorCall).toBeDefined();
    });
  });

  describe('handleLogout', () => {
    it('calls signOut and resets navigation state', async () => {
      vi.mocked(signOut).mockResolvedValueOnce(undefined);

      await slice.handleLogout();

      expect(signOut).toHaveBeenCalled();
      expect(setMock).toHaveBeenCalledWith({
        activeTab: 'landing',
        selectedProject: null,
        loginError: null,
      });
    });

    it('logs error on logout failure', async () => {
      const error = new Error('Sign-out failed');
      vi.mocked(signOut).mockRejectedValueOnce(error);

      await slice.handleLogout();

      expect(console.error).toHaveBeenCalledWith('Logout failed', error);
    });
  });
});