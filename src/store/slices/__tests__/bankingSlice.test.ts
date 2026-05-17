import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createBankingSlice } from '../bankingSlice';

vi.mock('../../../lib/firebase', () => ({
  db: {},
  OperationType: { UPDATE: 'update' },
  handleFirestoreError: vi.fn(),
}));

vi.mock('firebase/firestore', () => ({
  doc: vi.fn(() => ({})),
  updateDoc: vi.fn(() => Promise.resolve()),
}));

describe('bankingSlice', () => {
  let setMock: ReturnType<typeof vi.fn>;
  let getMock: ReturnType<typeof vi.fn>;
  let apiMock: ReturnType<typeof vi.fn>;
  let slice: ReturnType<typeof createBankingSlice>;

  beforeEach(() => {
    vi.clearAllMocks();
    setMock = vi.fn();
    getMock = vi.fn();
    apiMock = vi.fn();
    slice = createBankingSlice(setMock, getMock, apiMock);
  });

  describe('userState (moved here from authSlice in this PR)', () => {
    it('initializes userState to empty string', () => {
      expect(slice.userState).toBe('');
    });

    it('setUserState calls set with the provided state value', () => {
      slice.setUserState('California');
      expect(setMock).toHaveBeenCalledWith({ userState: 'California' });
    });

    it('setUserState can set userState to an empty string', () => {
      slice.setUserState('');
      expect(setMock).toHaveBeenCalledWith({ userState: '' });
    });

    it('setUserState handles any string value', () => {
      slice.setUserState('New York');
      expect(setMock).toHaveBeenCalledWith({ userState: 'New York' });
    });
  });

  describe('pre-existing banking state initialization', () => {
    it('initializes isBankLinked to false', () => {
      expect(slice.isBankLinked).toBe(false);
    });

    it('initializes plaidToken to null', () => {
      expect(slice.plaidToken).toBeNull();
    });

    it('initializes plaidError to null', () => {
      expect(slice.plaidError).toBeNull();
    });
  });
});