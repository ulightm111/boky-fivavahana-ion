import { defineStore } from 'pinia';
import { ref, shallowRef, markRaw } from 'vue';

export interface Book {
  id: number;
  name: string;
  description: string;
}

export interface Song {
  id: number;
  title: string;
  section: string;
  content?: string;
  verses?: any[];
  intro?: string;
  headnote?: string;
  has_amen?: boolean;
  footnote?: string;
  chorus?: string[];
}

export interface Psalm {
  id: number;
  verses?: any[];
}

export interface LitContent {
  section: string;
  content?: string;
  subsections?: Array<{ subsection: string; content?: string }>;
  items?: Array<{ id: number; content: string }>;
}

export interface SearchResult {
  type: string;
  id: number;
  title: string;
  subtitle?: string;
  bookId?: number;
  sectionName?: string;
  subsectionIndex?: number;
}

// Internal structure for fast searching
interface IndexedSearchItem {
  searchKey: string;   // lowercased, concatenated searchable fields
  result: SearchResult;
}

export const useBookStore = defineStore('book', () => {
  const books = ref<Book[]>([]);
  const hiraSongs = shallowRef<Song[]>([]);
  const haaSongs = shallowRef<Song[]>([]);
  const salamoPsalms = shallowRef<Psalm[]>([]);
  const litpContents = shallowRef<LitContent[]>([]);
  const litbfContents = shallowRef<LitContent[]>([]);
  const lhfContents = shallowRef<LitContent[]>([]);
  const searchResults = shallowRef<SearchResult[]>([]);
  const groupedSongsCache = shallowRef<{ section: string; songs: Song[] }[]>([]);
  const lastGroupedBookId = ref<number | null>(null);
  const flatSongsSorted = shallowRef<any[]>([]);
  const lastFlatBookId = ref<number | null>(null);
  const currentPage = ref(0);

  // Search indexes (built once after data load)
  const hiraSearchIndex = shallowRef<IndexedSearchItem[]>([]);
  const haaSearchIndex = shallowRef<IndexedSearchItem[]>([]);
  const litbfSearchIndex = shallowRef<IndexedSearchItem[]>([]);
  const lhfSearchIndex = shallowRef<IndexedSearchItem[]>([]);
  const litpSearchIndex = shallowRef<IndexedSearchItem[]>([]);
  const salamoSearchIndex = shallowRef<IndexedSearchItem[]>([]);

  // Helper: build index for songs (Hira / HAA)
  function buildSongIndex(
    songs: Song[],
    bookName: string,
    bookId: number,
    type: string
  ): IndexedSearchItem[] {
    return songs.map(song => {
      const searchKey = `${song.id} ${song.title || ''} ${song.section || ''}`.toLowerCase();
      const result: SearchResult = {
        type,
        id: song.id,
        title: `${song.id} - ${song.title}`,
        subtitle: `${bookName}${song.section ? ' → ' + song.section : ''}`,
        bookId,
      };
      return { searchKey, result };
    });
  }

  // Helper: build index for liturgical books (sections + subsections)
  function buildLitIndex(
    contents: LitContent[],
    bookName: string,
    bookId: number,
    typePrefix: string
  ): IndexedSearchItem[] {
    const items: IndexedSearchItem[] = [];
    let idc = 0;
    for (const section of contents) {
      // Section itself
      const sectionKey = section.section.toLowerCase();
      items.push({
        searchKey: sectionKey,
        result: {
          type: typePrefix,
          id: idc,
          title: section.section,
          subtitle: bookName,
          bookId,
        },
      });
      idc++;

      // Subsections
      if (section.subsections) {
        for (let idx = 0; idx < section.subsections.length; idx++) {
          const sub = section.subsections[idx];
          const subKey = sub.subsection.toLowerCase();
          items.push({
            searchKey: subKey,
            result: {
              type: `${typePrefix}-subsection`,
              id: idx,
              title: sub.subsection,
              subtitle: section.section,
              bookId,
              sectionName: section.section,
              subsectionIndex: idx,
            },
          });
        }
      }
    }
    return items;
  }

  // Build all search indexes after data is loaded
  function buildSearchIndexes() {
    const hiraBook = books.value.find(b => b.name === 'Fihirana');
    if (hiraBook) {
      hiraSearchIndex.value = buildSongIndex(hiraSongs.value, 'Fihirana', hiraBook.id, 'hira');
    }
    const haaBook = books.value.find(b => b.name === 'Hanandratra Anao Aho');
    if (haaBook) {
      haaSearchIndex.value = buildSongIndex(haaSongs.value, 'Hanandratra Anao Aho', haaBook.id, 'haa');
    }
    const litbfBook = books.value.find(b => b.name === 'Litorjia Boky Fivavahana');
    if (litbfBook) {
      litbfSearchIndex.value = buildLitIndex(litbfContents.value, 'Litorjia Boky Fivavahana', litbfBook.id, 'litbf');
    }
    const lhfBook = books.value.find(b => b.name === "Lalan'ny Hazo Fijaliana");
    if (lhfBook) {
      lhfSearchIndex.value = buildLitIndex(lhfContents.value, "Lalan'ny Hazo Fijaliana", lhfBook.id, 'lhf');
    }
    const litpBook = books.value.find(b => b.name === 'Litorjia Provinsialy');
    if (litpBook) {
      litpSearchIndex.value = buildLitIndex(litpContents.value, 'Litorjia Provinsialy', litpBook.id, 'litp');
    }
    const salamoBook = books.value.find(b => b.name === 'Salamo');
    if (salamoBook) {
      salamoSearchIndex.value = salamoPsalms.value.map(psalm => ({
        searchKey: String(psalm.id).toLowerCase(),
        result: {
          type: 'salamo',
          id: psalm.id,
          title: `Salamo ${psalm.id}`,
          bookId: salamoBook.id,
        },
      }));
    }
  }

  // Helper: search within a specific index
  function searchIndex(index: IndexedSearchItem[], query: string): SearchResult[] {
    if (!index.length) return [];
    const normalized = query.toLowerCase().trim();
    if (!normalized) return [];
    return index.filter(item => item.searchKey.includes(normalized)).map(item => item.result);
  }

  const isHiraBook = (book: Book | null) => book?.name === 'Fihirana';
  const isHaaBook = (book: Book | null) => book?.name === 'Hanandratra Anao Aho';
  const isSalamoBook = (book: Book | null) => book?.name === 'Salamo';
  const isLitPBook = (book: Book | null) => book?.name === 'Litorjia Provinsialy';
  const isLitBFBook = (book: Book | null) => book?.name === 'Litorjia Boky Fivavahana';
  const isLHFBook = (book: Book | null) => book?.name === 'Lalan\'ny Hazo Fijaliana';

  const getBookData = (book: Book | null): any[] => {
    if (!book) return [];
    if (isHiraBook(book)) return hiraSongs.value;
    if (isHaaBook(book)) return haaSongs.value;
    if (isSalamoBook(book)) return salamoPsalms.value;
    if (isLitPBook(book)) return litpContents.value;
    if (isLitBFBook(book)) return litbfContents.value;
    if (isLHFBook(book)) return lhfContents.value;
    return [];
  };

  const getGroupedSongs = (book: Book | null) => {
    if (!book) return [];
    if (lastGroupedBookId.value === book.id && groupedSongsCache.value.length > 0) {
      return groupedSongsCache.value;
    }

    let songs: Song[] = [];
    if (isHiraBook(book)) songs = hiraSongs.value;
    else if (isHaaBook(book)) songs = haaSongs.value;
    if (songs.length === 0) return [];

    const groups = new Map<string, Song[]>();
    songs.forEach(song => {
      const section = song.section || 'Other';
      if (!groups.has(section)) groups.set(section, []);
      groups.get(section)!.push(song);
    });

    const result = Array.from(groups).map(([section, songs]) => ({ section, songs }));
    groupedSongsCache.value = result;
    lastGroupedBookId.value = book.id;
    return result;
  };

  const pageSize = 50;

  const getFlatSongs = (book: Book | null) => {
    if (!book) return [];
    if (lastFlatBookId.value === book.id && flatSongsSorted.value.length > 0) {
      return flatSongsSorted.value.slice(0, (currentPage.value + 1) * pageSize);
    }

    let songs: any[] = [];
    if (isHiraBook(book)) songs = hiraSongs.value;
    else if (isHaaBook(book)) songs = haaSongs.value;
    else if (isSalamoBook(book)) songs = salamoPsalms.value;
    if (songs.length === 0) return [];

    flatSongsSorted.value = songs;
    lastFlatBookId.value = book.id;
    return songs.slice(0, (currentPage.value + 1) * pageSize);
  };

  const hasMoreItems = (book: Book | null) => {
    if (!book) return false;
    let totalSongs: any[] = [];
    if (isHiraBook(book)) totalSongs = hiraSongs.value;
    else if (isHaaBook(book)) totalSongs = haaSongs.value;
    else if (isSalamoBook(book)) totalSongs = salamoPsalms.value;
    return (currentPage.value + 1) * pageSize < totalSongs.length;
  };

  const performSearch = (query: string, scopeBookId: number | null = null) => {
    searchResults.value = [];
    const normalized = query.trim();
    if (!normalized) return;

    const isGlobal = scopeBookId == null;
    const scopedBook = scopeBookId ? books.value.find(b => b.id === scopeBookId) : null;

    const results: SearchResult[] = [];

    // Helper to add results from an index if the book matches
    const addFromIndex = (index: IndexedSearchItem[], bookId: number) => {
      if (isGlobal || (scopedBook && scopedBook.id === bookId)) {
        results.push(...searchIndex(index, normalized));
      }
    };

    // Fihirana
    const hiraBook = books.value.find(b => b.name === 'Fihirana');
    if (hiraBook) addFromIndex(hiraSearchIndex.value, hiraBook.id);

    // Hanandratra Anao Aho
    const haaBook = books.value.find(b => b.name === 'Hanandratra Anao Aho');
    if (haaBook) addFromIndex(haaSearchIndex.value, haaBook.id);

    // Litorjia Boky Fivavahana
    const litbfBook = books.value.find(b => b.name === 'Litorjia Boky Fivavahana');
    if (litbfBook) addFromIndex(litbfSearchIndex.value, litbfBook.id);

    // Lalan'ny Hazo Fijaliana
    const lhfBook = books.value.find(b => b.name === "Lalan'ny Hazo Fijaliana");
    if (lhfBook) addFromIndex(lhfSearchIndex.value, lhfBook.id);

    // Litorjia Provinsialy
    const litpBook = books.value.find(b => b.name === 'Litorjia Provinsialy');
    if (litpBook && (isGlobal || (scopedBook && scopedBook.id === litpBook.id))) {
      results.push(...searchIndex(litpSearchIndex.value, normalized));
    }

    // Salamo
    const salamoBook = books.value.find(b => b.name === 'Salamo');
    if (salamoBook && (isGlobal || (scopedBook && scopedBook.id === salamoBook.id))) {
      results.push(...searchIndex(salamoSearchIndex.value, normalized));
    }

    searchResults.value = results;
  };

  const clearSearchResults = () => {
    searchResults.value = [];
  };

  const loadData = async () => {
    const [booksRes, hiraRes, haaRes, salamoRes, litpRes, litbfRes, lhfRes] = await Promise.all([
      fetch('/data/books.json').then(r => r.json()),
      fetch('/data/HIRA.json').then(r => r.json()),
      fetch('/data/HAA.json').then(r => r.json()),
      fetch('/data/SALAMO.json').then(r => r.json()),
      fetch('/data/LitP.json').then(r => r.json()),
      fetch('/data/LitBF.json').then(r => r.json()),
      fetch('/data/LHF.json').then(r => r.json())
    ]);

    books.value = booksRes;
    hiraSongs.value = (hiraRes.songs || []).map(song => markRaw(song));
    haaSongs.value = (haaRes.songs || []).map(song => markRaw(song));
    salamoPsalms.value = (salamoRes.psalms || []).map(psalms => markRaw(psalms));
    litpContents.value = (litpRes.contents || []).map(content => markRaw(content));
    litbfContents.value = (litbfRes.sections || []).map(section => markRaw(section));
    lhfContents.value = (lhfRes.sections || []).map(section => markRaw(section));

    // Build search indexes after data is loaded
    buildSearchIndexes();
  };

  return {
    books,
    hiraSongs,
    haaSongs,
    salamoPsalms,
    litpContents,
    litbfContents,
    lhfContents,
    searchResults,
    groupedSongsCache,
    lastGroupedBookId,
    flatSongsSorted,
    lastFlatBookId,
    currentPage,
    loadData,
    performSearch,
    clearSearchResults,
    getBookData,
    getGroupedSongs,
    getFlatSongs,
    hasMoreItems,
    isHiraBook,
    isHaaBook,
    isSalamoBook,
    isLitPBook,
    isLitBFBook,
    isLHFBook,
  };
});