import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { extractJson, suggestTasks } from './gemini';

const { mockGenerateContent } = vi.hoisted(() => {
  return {
    mockGenerateContent: vi.fn(),
  };
});

vi.mock('@google/genai', () => {
  return {
    GoogleGenAI: class MockGoogleGenAI {
      models: any;
      constructor() {
        this.models = {
          generateContent: mockGenerateContent
        };
      }
    }
  };
});


describe('extractJson', () => {
  it('should parse a plain JSON object string', () => {
    const raw = '{"key": "value", "number": 42}';
    expect(extractJson(raw)).toEqual({ key: 'value', number: 42 });
  });

  it('should parse a plain JSON array string', () => {
    const raw = '[1, 2, "three", {"four": 4}]';
    expect(extractJson(raw)).toEqual([1, 2, 'three', { four: 4 }]);
  });

  it('should extract JSON wrapped in ```json ... ``` markdown block', () => {
    const raw = '```json\n{"status": "ok"}\n```';
    expect(extractJson(raw)).toEqual({ status: 'ok' });
  });

  it('should extract JSON wrapped in ``` ... ``` markdown block', () => {
    const raw = '```\n[1, 2, 3]\n```';
    expect(extractJson(raw)).toEqual([1, 2, 3]);
  });

  it('should extract JSON object embedded within other text', () => {
    const raw = 'Here is your response:\n\n{"result": "success"}\n\nHave a great day!';
    expect(extractJson(raw)).toEqual({ result: 'success' });
  });

  it('should extract JSON array embedded within other text', () => {
    const raw = 'I generated some names for you: ["Alpha", "Beta"] Let me know if you need more.';
    expect(extractJson(raw)).toEqual(['Alpha', 'Beta']);
  });

  it('should throw an error if no JSON is found', () => {
    const raw = 'I could not generate any JSON for this request.';
    expect(() => extractJson(raw)).toThrow('No JSON found in AI response.');
  });

  it('should throw an error for malformed JSON after matching brackets', () => {
    const raw = 'Here is it: { "key": value }'; // missing quotes around value
    expect(() => extractJson(raw)).toThrow(/is not valid JSON|Unexpected token/);
  });

  it('should correctly parse json with newlines and white space', () => {
    const raw = "\n      ```json\n      {\n        \"a\": 1,\n        \"b\": \"text\"\n      }\n      ```\n    ";
    expect(extractJson(raw)).toEqual({ a: 1, b: "text" });
  });
});


describe('suggestTasks', () => {
  let originalEnv: string | undefined;

  beforeEach(() => {
    originalEnv = process.env.GEMINI_API_KEY;
    process.env.GEMINI_API_KEY = 'test-api-key';
    mockGenerateContent.mockClear();
  });

  afterEach(() => {
    process.env.GEMINI_API_KEY = originalEnv;
  });

  it('should return parsed tasks on successful API call', async () => {
    const mockTasks = [
      { title: "Test Task", description: "Do something", priority: "high", category: "technical", estimatedHours: 2, progress: 0 }
    ];

    mockGenerateContent.mockResolvedValueOnce({
      text: JSON.stringify(mockTasks)
    });

    const result = await suggestTasks('Test Venture', 'A great idea', 'Just started');

    expect(mockGenerateContent).toHaveBeenCalled();
    expect(result).toEqual(mockTasks);
  });

  it('should return fallback data when API key is missing', async () => {
    delete process.env.GEMINI_API_KEY;

    const result = await suggestTasks('Test Venture', 'A great idea', 'Just started');

    expect(mockGenerateContent).not.toHaveBeenCalled();
    expect(Array.isArray(result)).toBe(true);
    expect(result[0]).toHaveProperty('title', 'Market Research'); // First fallback task
  });

  it('should return fallback data when API call fails', async () => {
    mockGenerateContent.mockRejectedValueOnce(new Error('API Error'));

    const result = await suggestTasks('Test Venture', 'A great idea', 'Just started');

    expect(mockGenerateContent).toHaveBeenCalled();
    expect(Array.isArray(result)).toBe(true);
    expect(result[0]).toHaveProperty('title', 'Market Research'); // First fallback task
  });
});
