import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const { mockGenerateContent } = vi.hoisted(() => {
  return { mockGenerateContent: vi.fn() };
});

vi.mock('@google/genai', () => {
  return {
    GoogleGenAI: class {
      models = {
        generateContent: mockGenerateContent
      };
    }
  };
});

import { extractJson, generateBusinessIdeas } from './gemini';

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

describe('generateBusinessIdeas', () => {
  let originalEnv: string | undefined;

  beforeEach(() => {
    originalEnv = process.env.GEMINI_API_KEY;
    vi.clearAllMocks();
  });

  afterEach(() => {
    if (originalEnv === undefined) {
      delete process.env.GEMINI_API_KEY;
    } else {
      process.env.GEMINI_API_KEY = originalEnv;
    }
  });

  it('uses fallback when GEMINI_API_KEY is missing', async () => {
    delete process.env.GEMINI_API_KEY;
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const result = await generateBusinessIdeas();
    expect(result[0].title).toBe("AI Content Automator (Demo)");

    consoleSpy.mockRestore();
  });

  it('returns data from AI when API key is present and call succeeds', async () => {
    process.env.GEMINI_API_KEY = 'fake-key';
    const mockedResponse = [
      {
        title: "Test Idea",
        description: "A test description",
        potential: "high",
        tags: ["Test"],
        outlook: "Good",
        revenueStrategy: "Ads",
        projections: { month1: 100 },
        timeline: [{ milestone: "Start", date: "Week 1" }]
      }
    ];

    mockGenerateContent.mockResolvedValueOnce({
      text: JSON.stringify(mockedResponse)
    });

    const result = await generateBusinessIdeas('tech');
    expect(result[0].title).toBe("Test Idea");
    expect(mockGenerateContent).toHaveBeenCalledTimes(1);

    // verify the prompt has 'tech'. The structure is deeply nested in the current implementation.
    const callArgs = mockGenerateContent.mock.calls[0][0];
    const promptText = callArgs?.contents?.[0]?.parts?.[0]?.text || '';
    expect(promptText).toContain("Focus on the tech industry.");
  });

  it('uses fallback when AI call fails', async () => {
    process.env.GEMINI_API_KEY = 'fake-key';
    mockGenerateContent.mockRejectedValueOnce(new Error('AI is down'));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const result = await generateBusinessIdeas();
    expect(result[0].title).toBe("AI Content Automator (Demo)");

    consoleSpy.mockRestore();
  });
});
