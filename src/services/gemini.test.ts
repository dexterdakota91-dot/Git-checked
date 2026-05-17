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

import { generateBusinessIdeas, generateNames, generateLogoConcepts, generateVoiceAndTone, generateMissionStatements, generatePalettes, specializeAgents, generateBranding, chatWithArchitect } from './gemini';

describe('generateBusinessIdeas', () => {
  it('should generate business ideas correctly', async () => {
    mockGenerateContent.mockResolvedValueOnce({
      text: JSON.stringify([{ title: 'Idea 1', description: 'Desc 1', tags: ['tag1'] }])
    });
    process.env.GEMINI_API_KEY = 'test-api-key';
    const result = await generateBusinessIdeas('tech');
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Idea 1');
  });
});

describe('generateNames', () => {
  it('should generate names correctly', async () => {
    mockGenerateContent.mockResolvedValueOnce({
      text: JSON.stringify({ names: ['Name 1', 'Name 2'] })
    });
    process.env.GEMINI_API_KEY = 'test-api-key';
    const result = await generateNames('Venture', 'Desc');
    expect(result.names).toHaveLength(2);
    expect(result.names[0]).toBe('Name 1');
  });
});

describe('generateLogoConcepts', () => {
  it('should generate logo concepts correctly', async () => {
    mockGenerateContent.mockResolvedValueOnce({
      text: JSON.stringify({ concepts: ['Concept 1', 'Concept 2'] })
    });
    process.env.GEMINI_API_KEY = 'test-api-key';
    const result = await generateLogoConcepts('Venture', 'Desc');
    expect(result.concepts).toHaveLength(2);
    expect(result.concepts[0]).toBe('Concept 1');
  });
});

describe('generateVoiceAndTone', () => {
  it('should generate voice and tone correctly', async () => {
    mockGenerateContent.mockResolvedValueOnce({
      text: JSON.stringify({ voice: 'Friendly', tone: 'Professional' })
    });
    process.env.GEMINI_API_KEY = 'test-api-key';
    const result = await generateVoiceAndTone('Venture', 'Desc');
    expect(result.voice).toBe('Friendly');
    expect(result.tone).toBe('Professional');
  });
});

describe('generateMissionStatements', () => {
  it('should generate mission statements correctly', async () => {
    mockGenerateContent.mockResolvedValueOnce({
      text: JSON.stringify({ statements: ['Mission 1', 'Mission 2'] })
    });
    process.env.GEMINI_API_KEY = 'test-api-key';
    const result = await generateMissionStatements('Venture', 'Desc');
    expect(result.statements).toHaveLength(2);
    expect(result.statements[0]).toBe('Mission 1');
  });
});

describe('generatePalettes', () => {
  it('should generate palettes correctly', async () => {
    mockGenerateContent.mockResolvedValueOnce({
      text: JSON.stringify({ palettes: [{ name: 'P1', colors: ['#000', '#fff'] }] })
    });
    process.env.GEMINI_API_KEY = 'test-api-key';
    const result = await generatePalettes('Venture', 'Desc');
    expect(result.palettes).toHaveLength(1);
    expect(result.palettes[0].name).toBe('P1');
  });
});

describe('specializeAgents', () => {
  it('should specialize agents correctly', async () => {
    mockGenerateContent.mockResolvedValueOnce({
      text: JSON.stringify([{ role: 'Agent 1', responsibilities: ['Task 1'] }])
    });
    process.env.GEMINI_API_KEY = 'test-api-key';
    const result = await specializeAgents('Venture', 'Desc');
    expect(result).toHaveLength(1);
    expect(result[0].role).toBe('Agent 1');
  });
});

describe('generateBranding', () => {
  it('should generate full branding correctly', async () => {
    mockGenerateContent.mockResolvedValueOnce({
      text: JSON.stringify({ ventureName: 'Brand', voiceAndTone: { voice: 'Tone' } })
    });
    process.env.GEMINI_API_KEY = 'test-api-key';
    const result = await generateBranding('Venture', 'Desc');
    expect(result.ventureName).toBe('Brand');
  });
});

describe('chatWithArchitect', () => {
  it('should chat with architect correctly', async () => {
    mockGenerateContent.mockResolvedValueOnce({
      text: 'Architect Response'
    });
    process.env.GEMINI_API_KEY = 'test-api-key';
    const result = await chatWithArchitect('Hello', [{ role: 'user', text: 'Hi' }]);
    expect(result).toBe('Architect Response');
  });
});
