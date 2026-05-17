import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { extractJson, generateMissionStatements } from './gemini';

// Mock the GoogleGenAI module

export const mockGenerateContent = vi.fn();

vi.mock('@google/genai', () => {
  return {
    GoogleGenAI: class {
      models: any;
      constructor() {
        this.models = {
          generateContent: (...args: any[]) => mockGenerateContent(...args),
        };
      }
    },
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
    const raw = 'Here is it: { "key": "value" '; // missing closing brace
    expect(() => extractJson(raw)).toThrow('No JSON found in AI response.');
  });

  it('should correctly parse json with newlines and white space', () => {
    const raw = "\n      ```json\n      {\n        \"a\": 1,\n        \"b\": \"text\"\n      }\n      ```\n    ";
    expect(extractJson(raw)).toEqual({ a: 1, b: "text" });
  });
});

describe('generateMissionStatements', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
    mockGenerateContent.mockReset();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should return fallback data when GEMINI_API_KEY is missing', async () => {
    delete process.env.GEMINI_API_KEY;

    const result = await generateMissionStatements('Test Venture', 'A test description');

    expect(result).toEqual(["Empowering AI-driven growth.", "The future of automated business."]);
    expect(mockGenerateContent).not.toHaveBeenCalled();
  });

  it('should call AI service and extract JSON when GEMINI_API_KEY is present', async () => {
    process.env.GEMINI_API_KEY = 'test-api-key';

    const mockAiResponse = {
      text: '["Mission 1", "Mission 2", "Mission 3", "Mission 4", "Mission 5"]'
    };
    mockGenerateContent.mockResolvedValue(mockAiResponse);

    const result = await generateMissionStatements('Test Venture', 'A test description');

    expect(mockGenerateContent).toHaveBeenCalledTimes(1);
    expect(mockGenerateContent).toHaveBeenCalledWith({
      model: 'gemini-3-flash-preview',
      contents: [{
        role: 'user',
        parts: [
          expect.objectContaining({
            text: expect.stringContaining('Generate 5 sophisticated and unique mission statements')
          })
        ]
      }]
    });
    expect(result).toEqual(["Mission 1", "Mission 2", "Mission 3", "Mission 4", "Mission 5"]);
  });

  it('should return fallback data when AI service throws an error', async () => {
    process.env.GEMINI_API_KEY = 'test-api-key';

    mockGenerateContent.mockRejectedValue(new Error('AI API Error'));

    const result = await generateMissionStatements('Test Venture', 'A test description');

    expect(mockGenerateContent).toHaveBeenCalledTimes(1);
    expect(result).toEqual(["Empowering AI-driven growth.", "The future of automated business."]);
  });
});
