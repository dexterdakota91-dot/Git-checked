import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createBankingSlice } from '../bankingSlice';

vi.mock('../../../lib/firebase', () => ({
  db: {},
  OperationType: {
    CREATE: 'create',
    UPDATE: 'update',
    DELETE: 'delete',
    LIST: 'list',
    GET: 'get',
    WRITE: 'write',
  },
  handleFirestoreError: vi.fn(),
}));

const mockUpdateDoc = vi.fn();
vi.mock('firebase/firestore', () => ({
  doc: vi.fn(() => ({ id: 'mock-doc-ref' })),
  updateDoc: (...args: any[]) => mockUpdateDoc(...args),
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
    slice = createBankingSlice(setMock, getMock, apiMock as any);
  });

  describe('initial state', () => {
    it('initializes userState as empty string', () => {
      expect(slice.userState).toBe('');
    });

    it('initializes isBankLinked as false', () => {
      expect(slice.isBankLinked).toBe(false);
    });

    it('initializes plaidToken as null', () => {
      expect(slice.plaidToken).toBeNull();
    });

    it('initializes plaidError as null', () => {
      expect(slice.plaidError).toBeNull();
    });
  });

  describe('setUserState', () => {
    it('calls set with the provided state string', () => {
      slice.setUserState('CA');
      expect(setMock).toHaveBeenCalledWith({ userState: 'CA' });
    });

    it('calls set with an empty string to clear state', () => {
      slice.setUserState('');
      expect(setMock).toHaveBeenCalledWith({ userState: '' });
    });

    it('calls set with any US state abbreviation', () => {
      slice.setUserState('NY');
      expect(setMock).toHaveBeenCalledWith({ userState: 'NY' });
    });

    it('calls set with a full state name', () => {
      slice.setUserState('California');
      expect(setMock).toHaveBeenCalledWith({ userState: 'California' });
    });
  });

  describe('setIsBankLinked', () => {
    it('calls set with true when bank is linked', () => {
      slice.setIsBankLinked(true);
      expect(setMock).toHaveBeenCalledWith({ isBankLinked: true });
    });

    it('calls set with false when bank is unlinked', () => {
      slice.setIsBankLinked(false);
      expect(setMock).toHaveBeenCalledWith({ isBankLinked: false });
    });
  });

  describe('setPlaidToken', () => {
    it('calls set with a token string', () => {
      slice.setPlaidToken('access-token-123');
      expect(setMock).toHaveBeenCalledWith({ plaidToken: 'access-token-123' });
    });

    it('calls set with null to clear the token', () => {
      slice.setPlaidToken(null);
      expect(setMock).toHaveBeenCalledWith({ plaidToken: null });
    });
  });

  describe('setPlaidError', () => {
    it('calls set with an error message', () => {
      slice.setPlaidError('Connection failed');
      expect(setMock).toHaveBeenCalledWith({ plaidError: 'Connection failed' });
    });

    it('calls set with null to clear the error', () => {
      slice.setPlaidError(null);
      expect(setMock).toHaveBeenCalledWith({ plaidError: null });
    });
  });

  describe('addStripeIntegration', () => {
    it('calls updateDoc with stripeEnabled:true for the given projectId', async () => {
      mockUpdateDoc.mockResolvedValueOnce(undefined);

      await slice.addStripeIntegration('project-abc');

      expect(mockUpdateDoc).toHaveBeenCalledTimes(1);
      const [, updateData] = mockUpdateDoc.mock.calls[0];
      expect(updateData.stripeEnabled).toBe(true);
      expect(updateData.updatedAt).toBeDefined();
    });

    it('handles updateDoc errors via handleFirestoreError', async () => {
      const { handleFirestoreError } = await import('../../../lib/firebase');
      const firestoreError = new Error('Write failed');
      mockUpdateDoc.mockRejectedValueOnce(firestoreError);

      await slice.addStripeIntegration('project-xyz');

      expect(handleFirestoreError).toHaveBeenCalledWith(
        firestoreError,
        expect.any(String),
        'projects/project-xyz'
      );
    });
  });
});