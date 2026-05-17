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
  let setMock: any;
  let getMock: any;
  let apiMock: any;
  let slice: any;

  beforeEach(() => {
    vi.clearAllMocks();
    setMock = vi.fn();
    getMock = vi.fn();
    apiMock = vi.fn();
    slice = createAuthSlice(setMock, getMock, apiMock);

    // Suppress console.error in tests
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('initializes with correct default state', () => {
    expect(slice.currentUser).toBeNull();
    expect(slice.isAuthReady).toBe(false);
    expect(slice.loginError).toBeNull();
    expect(slice.isLoggingIn).toBe(false);
  });

  it('setCurrentUser updates the current user', () => {
    const mockUser = { uid: '123', email: 'test@example.com' };
    slice.setCurrentUser(mockUser);
    expect(setMock).toHaveBeenCalledWith({ currentUser: mockUser });
  });

  it('setIsAuthReady updates isAuthReady', () => {
    slice.setIsAuthReady(true);
    expect(setMock).toHaveBeenCalledWith({ isAuthReady: true });
  });

  it('setLoginError updates loginError', () => {
    slice.setLoginError('Error occurred');
    expect(setMock).toHaveBeenCalledWith({ loginError: 'Error occurred' });
  });

  it('setIsLoggingIn updates isLoggingIn', () => {
    slice.setIsLoggingIn(true);
    expect(setMock).toHaveBeenCalledWith({ isLoggingIn: true });
  });

  describe('handleLogin', () => {
    it('successfully logs in with popup', async () => {
      vi.mocked(signInWithPopup).mockResolvedValueOnce({} as never);

      await slice.handleLogin();

      expect(setMock).toHaveBeenCalledWith({ loginError: null, isLoggingIn: true });
      expect(signInWithPopup).toHaveBeenCalled();
      expect(setMock).toHaveBeenCalledWith(expect.objectContaining({ isLoggingIn: false }));
    });

    it('falls back to redirect if popup is blocked', async () => {
      const popupError = new Error('Popup blocked');
      (popupError as any).code = 'auth/popup-blocked';
      vi.mocked(signInWithPopup).mockRejectedValueOnce(popupError);
      vi.mocked(signInWithRedirect).mockResolvedValueOnce({} as never);

      await slice.handleLogin();

      expect(signInWithPopup).toHaveBeenCalled();
      expect(signInWithRedirect).toHaveBeenCalled();
    });

    it('sets login error if redirect fails after popup blocked', async () => {
      const popupError = new Error('Popup blocked');
      (popupError as any).code = 'auth/popup-blocked';
      vi.mocked(signInWithPopup).mockRejectedValueOnce(popupError);

      const redirectError = new Error('Redirect failed');
      vi.mocked(signInWithRedirect).mockRejectedValueOnce(redirectError);

      await slice.handleLogin();

      expect(signInWithPopup).toHaveBeenCalled();
      expect(signInWithRedirect).toHaveBeenCalled();
      expect(setMock).toHaveBeenCalledWith({ loginError: "Sign-in failed. Please try again." });
      expect(setMock).toHaveBeenCalledWith(expect.objectContaining({ isLoggingIn: false }));
    });

    it('handles unauthorized domain error gracefully', async () => {
      const domainError = new Error('Unauthorized domain');
      (domainError as any).code = 'auth/unauthorized-domain';
      vi.mocked(signInWithPopup).mockRejectedValueOnce(domainError);

      await slice.handleLogin();

      expect(setMock).toHaveBeenCalledWith(expect.objectContaining({
        loginError: expect.stringContaining("This domain is not authorized in Firebase")
      }));
      expect(setMock).toHaveBeenCalledWith(expect.objectContaining({ isLoggingIn: false }));
    });

    it('sets generic error for other login failures', async () => {
      const genericError = new Error('Some generic error message');
      vi.mocked(signInWithPopup).mockRejectedValueOnce(genericError);

      await slice.handleLogin();

      expect(setMock).toHaveBeenCalledWith({ loginError: 'Some generic error message' });
      expect(setMock).toHaveBeenCalledWith(expect.objectContaining({ isLoggingIn: false }));
    });
  });

  describe('handleLogout', () => {
    it('successfully logs out and resets state', async () => {
      vi.mocked(signOut).mockResolvedValueOnce(undefined);

      await slice.handleLogout();

      expect(signOut).toHaveBeenCalled();
      expect(setMock).toHaveBeenCalledWith({
        activeTab: 'landing',
        selectedProject: null,
        loginError: null
      });
    });

    it('handles logout error', async () => {
      const error = new Error('Logout failed');
      vi.mocked(signOut).mockRejectedValueOnce(error);

      await slice.handleLogout();

      expect(console.error).toHaveBeenCalledWith("Logout failed", error);
    });
  });
});


describe('authSlice - setUserState', () => {
  let setMock: any;
  let getMock: any;
  let apiMock: any;
  let slice: any;

  beforeEach(() => {
    vi.clearAllMocks();
    setMock = vi.fn();
    getMock = vi.fn();
    apiMock = vi.fn();

    slice = createAuthSlice(setMock, getMock, apiMock);
  });

  it('allows setting an empty string', () => {
    slice.setUserState('');
    expect(setMock).toHaveBeenCalledWith({ userState: '' });
  });

  it('allows setting a valid US state', () => {
    slice.setUserState('California');
    expect(setMock).toHaveBeenCalledWith({ userState: 'California' });
  });

  it('sanitizes and logs warning for invalid state', () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    slice.setUserState('InvalidState');
    expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('Invalid US state provided: InvalidState'));
    expect(setMock).toHaveBeenCalledWith({ userState: '' });
    consoleWarnSpy.mockRestore();
  });
});
