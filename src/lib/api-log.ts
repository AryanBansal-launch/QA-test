export function apiLog(location: string, message: string, extra?: Record<string, unknown>) {
  const payload = { ts: new Date().toISOString(), location, message, ...extra };
  console.log(`[API] ${JSON.stringify(payload)}`);
}
