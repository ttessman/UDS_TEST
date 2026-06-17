/**
 * Validation helpers for user fields in forms.
 */

import { maximumNameIDLength } from "utils/shared/constants";

/**
 * Validates a user ID string.
 *
 * @param val - The user ID to validate
 * @param maximumLength - The maximum allowed length for the user ID
 * @returns An error message if invalid, or null if valid
 */
export function validateUserId(val: string): string | null {
  if (!val) return "User ID is required.";
  if (!/^[\w.-]+$/.test(val))
    return "User ID must not contain spaces or special characters other than '_', '.', and '-'.";
  if (val.length > maximumNameIDLength) return `User ID must be <= ${maximumNameIDLength} characters.`;
  return null;
}

/**
 * Validates an email address string.
 *
 * @param val - The email address to validate
 * @returns An error message if invalid, or null if valid
 */
export function validateEmail(val: string): string | null {
  if (!val) return "Email is required.";
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(val) ? null : "Invalid email format.";
}
