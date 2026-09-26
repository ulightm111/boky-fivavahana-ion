const DEFAULT_FONT_SIZE_PX = 16;
const LONG_LINE_THRESHOLD = 80;
const MEDIUM_LINE_THRESHOLD = 50;
const SHORT_LINE_THRESHOLD = 32;

function flattenLines(verses: unknown[]): string[] {
  const lines: string[] = [];

  for (const entry of verses) {
    if (typeof entry === "string") {
      lines.push(entry);
      continue;
    }

    if (!entry || typeof entry !== "object") continue;

    const record = entry as Record<string, unknown>;
    const verseLines = record.lines;

    if (Array.isArray(verseLines)) {
      for (const line of verseLines) {
        if (typeof line === "string") lines.push(line);
      }
      continue;
    }

    if (typeof verseLines === "string") {
      lines.push(verseLines);
    }

    if (typeof record.text === "string") {
      lines.push(record.text);
    }
  }

  return lines;
}

export function getVerseColumnCount(
  verses: unknown[] = [],
  fontSizePx = DEFAULT_FONT_SIZE_PX,
): number {
  const lines = flattenLines(verses);

  if (lines.length === 0) return 1;

  const fontSizeScale = fontSizePx / DEFAULT_FONT_SIZE_PX;
  const longThreshold = LONG_LINE_THRESHOLD / fontSizeScale;
  const mediumThreshold = MEDIUM_LINE_THRESHOLD / fontSizeScale;
  const shortThreshold = SHORT_LINE_THRESHOLD / fontSizeScale;

  const maxLength = Math.max(...lines.map((line) => line.trim().length));
  const averageLength =
    lines.reduce((total, line) => total + line.trim().length, 0) / lines.length;

  if (maxLength >= longThreshold || averageLength >= mediumThreshold) {
    return 1;
  }

  if (maxLength >= shortThreshold || averageLength >= 20 / fontSizeScale) {
    return 2;
  }

  return 3;
}
