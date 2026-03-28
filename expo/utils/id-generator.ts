export function generateId(prefix?: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  if (prefix) {
    return `${prefix}_${timestamp}_${random}`;
  }
  return `${timestamp}_${random}`;
}
