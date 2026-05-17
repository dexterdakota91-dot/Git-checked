import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combines multiple class value inputs into a single Tailwind-compatible class string.
 *
 * @param inputs - Class value inputs (strings, arrays, or conditional objects) to merge
 * @returns The merged class string with conflicting Tailwind utilities resolved
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
