// Escapes "<" so a "</script>" sequence inside free-text (e.g. blog body
// content) can't prematurely close the JSON-LD <script> tag it's embedded in.
export function safeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
