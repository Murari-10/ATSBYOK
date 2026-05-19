export function cleanJSON(raw: string): string {
  // Strip markdown code fences
  let s = raw.replace(/```json/g, "").replace(/```/g, "").trim();
  // Extract the first {...} block — handles preamble text from less-strict models
  const start = s.indexOf("{");
  const end = s.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start) {
    s = s.slice(start, end + 1);
  }
  // Fix trailing commas before } or ]
  return s.replace(/,(\s*[}\]])/g, "$1").trim();
}

export function safeParseJSON<T>(raw: string): T | null {
  try {
    return JSON.parse(cleanJSON(raw)) as T;
  } catch {
    return null;
  }
}
