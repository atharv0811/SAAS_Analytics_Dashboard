/**
 * Simulated write endpoints. They resolve after a short, realistic delay so
 * forms can demonstrate loading and success states without a backend.
 */
const LATENCY_MS = 700;

function simulateRequest<T>(result: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(result), LATENCY_MS));
}

export function saveSettings<T>(values: T) {
  return simulateRequest({ ok: true as const, values });
}

export function saveCustomer<T>(values: T) {
  return simulateRequest({ ok: true as const, values });
}

export function refundTransaction(transactionId: string) {
  return simulateRequest({ ok: true as const, transactionId });
}

export function revokeSession(sessionId: string) {
  return simulateRequest({ ok: true as const, sessionId });
}
