export function sanitizeRegex(input: unknown): string {
  if (typeof input !== 'string') return '';
  const MAX_LENGTH = 100;
  const trimmed = input.slice(0, MAX_LENGTH);
  const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return escaped;
}
