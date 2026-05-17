import { describe, it, expect } from 'vitest';
import { extractJson } from './gemini';

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
