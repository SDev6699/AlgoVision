/**
 * Pauses execution for a specified number of milliseconds.
 * @param ms - Duration to sleep in milliseconds.
 * @returns A promise that resolves after the specified duration.
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}