import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines multiple class names using clsx and tailwind-merge
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a decimal value for display
 * Handles Prisma.Decimal, numbers, and string representations
 * 
 * @param value - The value to format (Prisma.Decimal, number, or string)
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted string with the specified number of decimal places
 */
export function formatDecimal(value: any, decimals: number = 2): string {
  if (value === null || value === undefined) return '-';
  
  // Handle Prisma.Decimal objects
  if (typeof value === 'object' && value !== null) {
    // Prisma.Decimal objects have a toString or toFixed method
    if (typeof value.toFixed === 'function') {
      return value.toFixed(decimals);
    }
    if (typeof value.toString === 'function') {
      // Try to format the string representation
      const num = parseFloat(value.toString());
      return isNaN(num) ? value.toString() : num.toFixed(decimals);
    }
    return value.toString();
  }
  
  // Handle regular numbers
  if (typeof value === 'number') {
    return value.toFixed(decimals);
  }
  
  // Handle string representation of numbers
  if (typeof value === 'string' && !isNaN(parseFloat(value))) {
    return parseFloat(value).toFixed(decimals);
  }
  
  // Fallback
  return String(value);
}

/**
 * Formats a price value for display with currency symbol
 * 
 * @param value - The price value to format
 * @param symbol - Currency symbol (default: "$")
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted price string with currency symbol
 */
export function formatPrice(value: any, symbol: string = "$", decimals: number = 2): string {
  if (value === null || value === undefined) return '-';
  return `${symbol}${formatDecimal(value, decimals)}`;
} 