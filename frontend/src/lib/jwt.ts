export function parseJwtPayload(token: string): { role?: string; sub?: string } {
  try {
    const part = token.split('.')[1];
    const json = atob(part.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json) as { role?: string; sub?: string };
  } catch {
    return {};
  }
}
