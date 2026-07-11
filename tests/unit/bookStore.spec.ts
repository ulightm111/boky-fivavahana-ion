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
});
