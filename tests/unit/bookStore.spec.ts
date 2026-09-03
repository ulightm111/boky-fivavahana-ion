import { beforeEach, describe, expect, it, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { useBookStore } from "@/stores/bookStore";

const { mockGet, mockSet } = vi.hoisted(() => ({
  mockGet: vi.fn(),
  mockSet: vi.fn(),
}));

vi.mock("@capacitor/preferences", () => ({
  Preferences: {
    get: mockGet,
    set: mockSet,
  },
}));

describe("favorites", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    mockGet.mockReset();
    mockSet.mockReset();
    mockGet.mockResolvedValue({ value: null });
    mockSet.mockResolvedValue(undefined);
  });

  it("toggles and persists favorites", async () => {
    const store = useBookStore();
    const favorite = {
      type: "song" as const,
      bookId: 1,
      id: 5,
      title: "Song 5",
      subtitle: "Book Name",
    };

    expect(store.isFavorite(favorite)).toBe(false);

    await store.toggleFavorite(favorite);

    expect(store.isFavorite(favorite)).toBe(true);
    expect(store.favoriteItems).toHaveLength(1);
    expect(mockSet).toHaveBeenCalledWith(
      expect.objectContaining({
        key: "boky-favorites",
        value: expect.stringContaining("song"),
      }),
    );

    await store.toggleFavorite(favorite);

    expect(store.favoriteItems).toHaveLength(0);
  });

  it("tracks recent content entries with a 10 item cap", async () => {
    const store = useBookStore();

    for (let i = 1; i <= 12; i++) {
      await store.recordContentVisit(
        {
          id: i,
          name: `Book ${i}`,
          description: `Description ${i}`,
        },
        {
          id: i,
          type: i % 2 === 0 ? "section" : "song",
          title: `Item ${i}`,
          subtitle: `Book ${i}`,
          sectionName: i % 2 === 0 ? `Section ${i}` : undefined,
        },
      );
    }

    expect(store.recentBooks).toHaveLength(10);
    expect(store.recentBooks[0]).toMatchObject({
      bookId: 12,
      bookName: "Book 12",
      title: "Item 12",
      type: "section",
    });
    expect(store.recentBooks.at(-1)).toMatchObject({
      bookId: 3,
      bookName: "Book 3",
      title: "Item 3",
      type: "song",
    });
    expect(mockSet).toHaveBeenCalledWith(
      expect.objectContaining({
        key: "boky-book-history",
      }),
    );
  });
});
