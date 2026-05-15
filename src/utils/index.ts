// Common utilities

export function formatError(error: unknown): string {
  if (error instanceof Error) {
    return `Error: ${error.message}`;
  }
  return `Error: ${String(error)}`;
}

export function sanitizeCode(code: string): string {
  return code.trim().replace(/\r\n/g, "\n");
}

export function buildCodeBlock(language: string | undefined, code: string): string {
  return `\`\`\`${language || ""}\n${code}\n\`\`\``;
}
