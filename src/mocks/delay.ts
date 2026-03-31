// Simulates realistic network latency in mock mode.
// Use this in every mock service call so the UI loading states are exercised.
export const mockDelay = (ms = 700) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));
