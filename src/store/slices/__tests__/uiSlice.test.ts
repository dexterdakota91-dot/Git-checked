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
    slice = createUISlice(setMock, getMock, apiMock as any);
  });

  describe('initial state', () => {
    it('initializes activeTab as landing', () => {
      expect(slice.activeTab).toBe('landing');
    });

    it('initializes showOnboarding as false', () => {
      expect(slice.showOnboarding).toBe(false);
    });

    it('initializes isVentureSettingsOpen as false', () => {
      expect(slice.isVentureSettingsOpen).toBe(false);
    });

    it('initializes isUserSettingsOpen as false', () => {
      expect(slice.isUserSettingsOpen).toBe(false);
    });

    it('initializes isResetConfirmOpen as false', () => {
      expect(slice.isResetConfirmOpen).toBe(false);
    });

    it('initializes userState as empty string', () => {
      expect(slice.userState).toBe('');
    });
  });

  describe('setUserState', () => {
    it('calls set with the provided state value', () => {
      slice.setUserState('TX');
      expect(setMock).toHaveBeenCalledWith({ userState: 'TX' });
    });

    it('calls set with an empty string to clear state', () => {
      slice.setUserState('');
      expect(setMock).toHaveBeenCalledWith({ userState: '' });
    });

    it('calls set with a full state name', () => {
      slice.setUserState('Florida');
      expect(setMock).toHaveBeenCalledWith({ userState: 'Florida' });
    });

    it('calls set with any string value', () => {
      const states = ['CA', 'NY', 'WA', 'OR'];
      states.forEach(state => {
        slice.setUserState(state);
        expect(setMock).toHaveBeenCalledWith({ userState: state });
      });
    });
  });

  describe('setActiveTab', () => {
    it('calls set with the provided tab', () => {
      slice.setActiveTab('dashboard');
      expect(setMock).toHaveBeenCalledWith({ activeTab: 'dashboard' });
    });
  });

  describe('setShowOnboarding', () => {
    it('calls set with true', () => {
      slice.setShowOnboarding(true);
      expect(setMock).toHaveBeenCalledWith({ showOnboarding: true });
    });

    it('calls set with false', () => {
      slice.setShowOnboarding(false);
      expect(setMock).toHaveBeenCalledWith({ showOnboarding: false });
    });
  });

  describe('setIsVentureSettingsOpen', () => {
    it('calls set with true', () => {
      slice.setIsVentureSettingsOpen(true);
      expect(setMock).toHaveBeenCalledWith({ isVentureSettingsOpen: true });
    });

    it('calls set with false', () => {
      slice.setIsVentureSettingsOpen(false);
      expect(setMock).toHaveBeenCalledWith({ isVentureSettingsOpen: false });
    });
  });

  describe('setIsUserSettingsOpen', () => {
    it('calls set with true', () => {
      slice.setIsUserSettingsOpen(true);
      expect(setMock).toHaveBeenCalledWith({ isUserSettingsOpen: true });
    });

    it('calls set with false', () => {
      slice.setIsUserSettingsOpen(false);
      expect(setMock).toHaveBeenCalledWith({ isUserSettingsOpen: false });
    });
  });

  describe('setIsResetConfirmOpen', () => {
    it('calls set with true', () => {
      slice.setIsResetConfirmOpen(true);
      expect(setMock).toHaveBeenCalledWith({ isResetConfirmOpen: true });
    });

    it('calls set with false', () => {
      slice.setIsResetConfirmOpen(false);
      expect(setMock).toHaveBeenCalledWith({ isResetConfirmOpen: false });
    });
  });
});
