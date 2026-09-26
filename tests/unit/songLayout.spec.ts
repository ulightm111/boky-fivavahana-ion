import { describe, expect, it } from "vitest";
import { getVerseColumnCount } from "@/utils/songLayout";

describe("getVerseColumnCount", () => {
  it("uses 3 columns for short lyric lines on wide screens", () => {
    expect(
      getVerseColumnCount([
        "A short line",
        "Another short line",
        "One more short phrase",
      ]),
    ).toBe(3);
  });

  it("uses 2 columns for medium-length lines", () => {
    expect(
      getVerseColumnCount([
        "A longer lyric line that still fits nicely",
        "Another medium-length verse line with words",
      ]),
    ).toBe(2);
  });

  it("keeps a single column for long lines", () => {
    expect(
      getVerseColumnCount([
        "This is a very long line that will not fit within a narrow multi-column layout and should stay single column in large screen mode",
      ]),
    ).toBe(1);
  });

  it("reduces columns when the active font is larger", () => {
    expect(
      getVerseColumnCount(
        ["A short line", "Another short line", "One more short phrase"],
        22,
      ),
    ).toBe(2);
  });
});
