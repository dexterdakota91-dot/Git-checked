import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('cn utility function', () => {
  it('combines normal strings', () => {
    expect(cn('class1', 'class2')).toBe('class1 class2');
  });

  it('handles conditional classes (objects)', () => {
    expect(cn('class1', { class2: true, class3: false })).toBe('class1 class2');
  });

  it('handles arrays of classes', () => {
    expect(cn(['class1', 'class2'])).toBe('class1 class2');
    expect(cn(['class1', { class2: true }])).toBe('class1 class2');
  });

  it('ignores falsy values', () => {
    expect(cn('class1', null, undefined, false, 0, '')).toBe('class1');
  });

  it('merges tailwind classes and resolves conflicts', () => {
    // p-2 and p-4 conflict (padding), twMerge should pick the last one
    expect(cn('p-2', 'p-4')).toBe('p-4');

    // px-2 and p-4 conflict, twMerge should pick p-4
    expect(cn('px-2', 'p-4')).toBe('p-4');

    // p-4 and px-2 conflict, twMerge should pick both or just specific one (p-4 overrides general padding, px-2 overrides x padding specifically)
    expect(cn('p-4', 'px-2')).toBe('p-4 px-2');
  });

  it('handles complex combinations', () => {
    const isActive = true;
    const isError = false;

    expect(
      cn(
        'base-class p-2',
        isActive && 'active-class bg-blue-500',
        isError ? 'text-red-500' : 'text-green-500',
        ['array-class', { 'object-class': true }],
        'p-4' // overrides p-2
      )
    ).toBe('base-class active-class bg-blue-500 text-green-500 array-class object-class p-4');
  });
});
