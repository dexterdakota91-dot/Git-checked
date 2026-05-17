import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createUISlice } from '../uiSlice';

describe('uiSlice', () => {
  let setMock: ReturnType<typeof vi.fn>;
  let getMock: ReturnType<typeof vi.fn>;
  let apiMock: ReturnType<typeof vi.fn>;
  let slice: ReturnType<typeof createUISlice>;

  beforeEach(() => {
    vi.clearAllMocks();
    setMock = vi.fn();
    getMock = vi.fn();
    apiMock = vi.fn();
    slice = createUISlice(setMock, getMock, apiMock);
  });

  describe('userState (added in this PR — was never defined in any slice before)', () => {
    it('initializes userState to empty string', () => {
      expect(slice.userState).toBe('');
    });

    it('setUserState calls set with the provided value', () => {
      slice.setUserState('Texas');
      expect(setMock).toHaveBeenCalledWith({ userState: 'Texas' });
    });

    it('setUserState can reset userState to an empty string', () => {
      slice.setUserState('');
      expect(setMock).toHaveBeenCalledWith({ userState: '' });
    });

    it('setUserState handles US state names with spaces', () => {
      slice.setUserState('New Mexico');
      expect(setMock).toHaveBeenCalledWith({ userState: 'New Mexico' });
    });

    it('setUserState is called only once per invocation', () => {
      slice.setUserState('Florida');
      expect(setMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('pre-existing UI state initialization', () => {
    it('initializes activeTab to landing', () => {
      expect(slice.activeTab).toBe('landing');
    });

    it('initializes showOnboarding to false', () => {
      expect(slice.showOnboarding).toBe(false);
    });

    it('initializes isVentureSettingsOpen to false', () => {
      expect(slice.isVentureSettingsOpen).toBe(false);
    });

    it('initializes isUserSettingsOpen to false', () => {
      expect(slice.isUserSettingsOpen).toBe(false);
    });

    it('initializes isResetConfirmOpen to false', () => {
      expect(slice.isResetConfirmOpen).toBe(false);
    });
  });
});
