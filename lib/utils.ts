import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combine multiple class value inputs into a single Tailwind-compatible class string.
 *
 * @param inputs - One or more class value inputs (e.g., strings, arrays, or conditional objects) to be merged.
 * @returns The merged class name string with input values combined and conflicting Tailwind utilities resolved.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
