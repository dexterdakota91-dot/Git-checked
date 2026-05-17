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
    slice = createAuthSlice(setMock, getMock, apiMock as any);
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('initial state', () => {
    it('initializes with correct default values', () => {
      expect(slice.currentUser).toBeNull();
      expect(slice.isAuthReady).toBe(false);
      expect(slice.loginError).toBeNull();
      expect(slice.isLoggingIn).toBe(false);
    });

    it('does NOT expose userState (moved to bankingSlice/uiSlice)', () => {
      expect((slice as any).userState).toBeUndefined();
      expect((slice as any).setUserState).toBeUndefined();
    });
  });

  describe('setters', () => {
    it('setCurrentUser calls set with provided user', () => {
      const mockUser = { uid: 'abc', email: 'user@test.com' } as any;
      slice.setCurrentUser(mockUser);
      expect(setMock).toHaveBeenCalledWith({ currentUser: mockUser });
    });

    it('setCurrentUser accepts null', () => {
      slice.setCurrentUser(null);
      expect(setMock).toHaveBeenCalledWith({ currentUser: null });
    });

    it('setIsAuthReady calls set with true', () => {
      slice.setIsAuthReady(true);
      expect(setMock).toHaveBeenCalledWith({ isAuthReady: true });
    });

    it('setIsAuthReady calls set with false', () => {
      slice.setIsAuthReady(false);
      expect(setMock).toHaveBeenCalledWith({ isAuthReady: false });
    });

    it('setLoginError calls set with error string', () => {
      slice.setLoginError('Some error');
      expect(setMock).toHaveBeenCalledWith({ loginError: 'Some error' });
    });

    it('setLoginError calls set with null to clear the error', () => {
      slice.setLoginError(null);
      expect(setMock).toHaveBeenCalledWith({ loginError: null });
    });

    it('setIsLoggingIn calls set with true', () => {
      slice.setIsLoggingIn(true);
      expect(setMock).toHaveBeenCalledWith({ isLoggingIn: true });
    });

    it('setIsLoggingIn calls set with false', () => {
      slice.setIsLoggingIn(false);
      expect(setMock).toHaveBeenCalledWith({ isLoggingIn: false });
    });
  });

  describe('handleLogin', () => {
    it('sets loginError:null and isLoggingIn:true before attempting sign-in', async () => {
      vi.mocked(signInWithPopup).mockResolvedValueOnce({} as never);

      await slice.handleLogin();

      expect(setMock).toHaveBeenCalledWith({ loginError: null, isLoggingIn: true });
    });

    it('always sets isLoggingIn:false in the finally block after success', async () => {
      vi.mocked(signInWithPopup).mockResolvedValueOnce({} as never);

      await slice.handleLogin();

      const calls = setMock.mock.calls.map(c => c[0]);
      expect(calls).toContainEqual({ isLoggingIn: false });
    });

    it('always sets isLoggingIn:false in the finally block after failure', async () => {
      vi.mocked(signInWithPopup).mockRejectedValueOnce(new Error('Some error'));

      await slice.handleLogin();

      const calls = setMock.mock.calls.map(c => c[0]);
      expect(calls).toContainEqual({ isLoggingIn: false });
    });

    it('calls signInWithPopup on login', async () => {
      vi.mocked(signInWithPopup).mockResolvedValueOnce({} as never);

      await slice.handleLogin();

      expect(signInWithPopup).toHaveBeenCalledTimes(1);
    });

    it('falls back to signInWithRedirect when popup is blocked', async () => {
      const popupError = Object.assign(new Error('Popup blocked'), { code: 'auth/popup-blocked' });
      vi.mocked(signInWithPopup).mockRejectedValueOnce(popupError);
      vi.mocked(signInWithRedirect).mockResolvedValueOnce(undefined as never);

      await slice.handleLogin();

      expect(signInWithRedirect).toHaveBeenCalledTimes(1);
    });

    it('falls back to redirect when popup is closed by user', async () => {
      const popupError = Object.assign(new Error('Popup closed'), { code: 'auth/popup-closed-by-user' });
      vi.mocked(signInWithPopup).mockRejectedValueOnce(popupError);
      vi.mocked(signInWithRedirect).mockResolvedValueOnce(undefined as never);

      await slice.handleLogin();

      expect(signInWithRedirect).toHaveBeenCalledTimes(1);
    });

    it('falls back to redirect when popup request is cancelled', async () => {
      const popupError = Object.assign(new Error('Cancelled'), { code: 'auth/cancelled-popup-request' });
      vi.mocked(signInWithPopup).mockRejectedValueOnce(popupError);
      vi.mocked(signInWithRedirect).mockResolvedValueOnce(undefined as never);

      await slice.handleLogin();

      expect(signInWithRedirect).toHaveBeenCalledTimes(1);
    });

    it('sets loginError when redirect also fails after popup blocked', async () => {
      const popupError = Object.assign(new Error('Popup blocked'), { code: 'auth/popup-blocked' });
      vi.mocked(signInWithPopup).mockRejectedValueOnce(popupError);
      vi.mocked(signInWithRedirect).mockRejectedValueOnce(new Error('Redirect failed'));

      await slice.handleLogin();

      const calls = setMock.mock.calls.map(c => c[0]);
      expect(calls).toContainEqual({ loginError: 'Sign-in failed. Please try again.' });
    });

    it('sets loginError with domain authorization message for auth/unauthorized-domain', async () => {
      const domainError = Object.assign(new Error('Unauthorized domain'), { code: 'auth/unauthorized-domain' });
      vi.mocked(signInWithPopup).mockRejectedValueOnce(domainError);

      await slice.handleLogin();

      const calls = setMock.mock.calls.map(c => c[0]);
      const errorCall = calls.find(c => c.loginError !== undefined && c.loginError !== null);
      expect(errorCall).toBeDefined();
      expect(errorCall!.loginError).toContain('This domain is not authorized in Firebase');
      expect(errorCall!.loginError).toContain('Firebase Console');
    });

    it('does NOT fall back to redirect for auth/unauthorized-domain', async () => {
      const domainError = Object.assign(new Error('Unauthorized domain'), { code: 'auth/unauthorized-domain' });
      vi.mocked(signInWithPopup).mockRejectedValueOnce(domainError);

      await slice.handleLogin();

      expect(signInWithRedirect).not.toHaveBeenCalled();
    });

    it('sets isLoggingIn:false after unauthorized-domain error', async () => {
      const domainError = Object.assign(new Error('Unauthorized domain'), { code: 'auth/unauthorized-domain' });
      vi.mocked(signInWithPopup).mockRejectedValueOnce(domainError);

      await slice.handleLogin();

      const calls = setMock.mock.calls.map(c => c[0]);
      expect(calls).toContainEqual({ isLoggingIn: false });
    });

    it('sets loginError using error message for generic errors', async () => {
      const genericError = new Error('Network connection failed');
      vi.mocked(signInWithPopup).mockRejectedValueOnce(genericError);

      await slice.handleLogin();

      const calls = setMock.mock.calls.map(c => c[0]);
      expect(calls).toContainEqual({ loginError: 'Network connection failed' });
    });

    it('sets fallback error message when generic error has no message', async () => {
      const errorWithNoMessage = Object.assign(new Error(''), { code: 'auth/unknown', message: '' });
      vi.mocked(signInWithPopup).mockRejectedValueOnce(errorWithNoMessage);

      await slice.handleLogin();

      const calls = setMock.mock.calls.map(c => c[0]);
      const errorCall = calls.find(c => c.loginError !== undefined);
      expect(errorCall!.loginError).toBe('Sign-in failed. Please try again.');
    });

    it('sets isLoggingIn:false after redirect succeeds (finally always runs)', async () => {
      const popupError = Object.assign(new Error('Popup blocked'), { code: 'auth/popup-blocked' });
      vi.mocked(signInWithPopup).mockRejectedValueOnce(popupError);
      vi.mocked(signInWithRedirect).mockResolvedValueOnce(undefined as never);

      await slice.handleLogin();

      // After return from redirect success, finally still runs
      const calls = setMock.mock.calls.map(c => c[0]);
      expect(calls).toContainEqual({ isLoggingIn: false });
    });
  });

  describe('handleLogout', () => {
    it('calls signOut', async () => {
      vi.mocked(signOut).mockResolvedValueOnce(undefined);

      await slice.handleLogout();

      expect(signOut).toHaveBeenCalledTimes(1);
    });

    it('resets navigation and project state after logout', async () => {
      vi.mocked(signOut).mockResolvedValueOnce(undefined);

      await slice.handleLogout();

      expect(setMock).toHaveBeenCalledWith({
        activeTab: 'landing',
        selectedProject: null,
        loginError: null,
      });
    });

    it('logs error but does not throw when signOut fails', async () => {
      const logoutError = new Error('Logout failed');
      vi.mocked(signOut).mockRejectedValueOnce(logoutError);

      await expect(slice.handleLogout()).resolves.toBeUndefined();
      expect(console.error).toHaveBeenCalledWith('Logout failed', logoutError);
    });
  });
});