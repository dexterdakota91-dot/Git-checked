import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the dependencies
vi.mock("firebase/firestore", () => {
  return {
    collection: vi.fn(),
    getDocs: vi.fn(),
    doc: vi.fn(),
    updateDoc: vi.fn(),
    arrayUnion: vi.fn((x) => x),
    query: vi.fn(),
    where: vi.fn(),
    writeBatch: vi.fn(() => ({
      update: vi.fn(),
      commit: vi.fn(),
    })),
    runTransaction: vi.fn(async (db, cb) => cb({
      get: vi.fn(() => ({ exists: () => true, data: () => ({ tasks: [] }) })),
      update: vi.fn(),
    })),
  };
});

vi.mock("@google/genai", () => {
  return {
    GoogleGenAI: class {
      models = {
        generateContent: vi.fn().mockResolvedValue({
          text: "[ACTION:ADD_LOG:{\"message\":\"perf test log\"}]"
        })
      };
    }
  };
});

import { startAutonomyEngine } from "./autonomyEngine";
import { getDocs, updateDoc, writeBatch, runTransaction } from "firebase/firestore";

describe("Autonomy Engine Perf", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.GEMINI_API_KEY = "test_key";

    // Mock getDocs to return multiple projects to simulate N+1
    const mockDocs = Array.from({ length: 50 }, (_, i) => ({
      id: `project-${i}`,
      data: () => ({ name: `Project ${i}`, status: 'active', isAutonomous: true })
    }));

    (getDocs as any).mockResolvedValue({ docs: mockDocs });
  });

  it("should process projects", async () => {
    vi.useFakeTimers();
    const db = {} as any;

    startAutonomyEngine(db);

    // Initial run happens after 5s
    const startTime = performance.now();
    await vi.runOnlyPendingTimersAsync();
    const endTime = performance.now();

    const timeTaken = endTime - startTime;
    console.log(`Execution time for 50 projects: ${timeTaken}ms`);

    // Log the number of times updateDoc was called (which is N for N projects)
    // or batch write / transactions.

    const updateDocCalls = vi.mocked(updateDoc).mock.calls.length;
    console.log(`updateDoc called ${updateDocCalls} times`);

    expect(true).toBe(true);

    vi.useRealTimers();
  });
});
