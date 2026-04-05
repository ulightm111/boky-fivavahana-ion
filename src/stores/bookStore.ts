import { defineStore } from 'pinia';
import { ref, shallowRef } from 'vue';

export interface Book {
  id: number;
  name: string;
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
  items?: Array<{ id: string; content: string }>;
}

export interface SearchResult {
  type: string;
  id: number | string;
  title: string;
  subtitle?: string;
  bookId?: number;
  sectionName?: string;
  subsectionIndex?: number;
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
      if (!groups.has(section)) {
        groups.set(section, []);
      }
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
    return ((currentPage.value + 1) * pageSize) < totalSongs.length;
  };

  const performSearch = (query: string, scopeBookId: number | null = null) => {
    searchResults.value = [];
    const normalized = query.toLowerCase().trim();
    if (!normalized) return;
    const isGlobal = scopeBookId == null;
    const scopedBook = scopeBookId ? books.value.find(b => b.id === scopeBookId) : null;

    const searchLit = (bookName: string, contents: any[], type: string) => {
      const book = books.value.find(b => b.name === bookName);
      if (!book) return;
      if (!isGlobal && scopedBook && scopedBook.id !== book.id) return;
      contents.forEach(section => {
        if (section.section.toLowerCase().includes(normalized)) {
          searchResults.value.push({
            type,
            id: section.section,
            title: section.section,
            subtitle: bookName,
            bookId: book.id,
          });
        }
        if (section.subsections) {
          section.subsections.forEach((sub: any, idx: number) => {
            if (sub.subsection.toLowerCase().includes(normalized)) {
              searchResults.value.push({
                type: `${type}-subsection`,
                id: idx,
                title: sub.subsection,
                subtitle: section.section,
                bookId: book.id,
                sectionName: section.section,
                subsectionIndex: idx,
              });
            }
          });
        }
      });
    };

    searchLit('Litorjia Boky Fivavahana', litbfContents.value, 'litbf');
    searchLit('Lalan\'ny Hazo Fijaliana', lhfContents.value, 'lhf');

    if (isGlobal || (scopedBook && isLitPBook(scopedBook))) {
      const book = books.value.find(b => b.name === 'Litorjia Provinsialy');
      if (book) {
        litpContents.value.forEach(section => {
          if (section.section.toLowerCase().includes(normalized)) {
            searchResults.value.push({
              type: 'litp',
              id: section.section,
              title: section.section,
              subtitle: book.name,
              bookId: book.id,
            });
          }
        });
      }
    }

    const searchSongs = (bookName: string, data: any[], type: string) => {
      const book = books.value.find(b => b.name === bookName);
      if (!book) return;
      if (!isGlobal && scopedBook && scopedBook.id !== book.id) return;
      data.forEach(song => {
        const normalizedTitle = song.title ? song.title.toLowerCase() : '';
        const normalizedSection = song.section ? song.section.toLowerCase() : '';
        const match = String(song.id).toLowerCase().includes(normalized)
          || normalizedTitle.includes(normalized)
          || normalizedSection.includes(normalized);
        if (match) {
          searchResults.value.push({
            type,
            id: song.id,
            title: `${song.id} - ${song.title}`,
            subtitle: `${bookName}${song.section ? ' → ' + song.section : ''}`,
            bookId: book.id,
          });
        }
      });
    };

    searchSongs('Fihirana', hiraSongs.value, 'hira');
    searchSongs('Hanandratra Anao Aho', haaSongs.value, 'haa');

    const salamoBook = books.value.find(b => b.name === 'Salamo');
    if ((isGlobal || (scopedBook && scopedBook.id === salamoBook?.id)) && salamoBook) {
      salamoPsalms.value.forEach(psalm => {
        if (String(psalm.id).toLowerCase().includes(normalized)) {
          searchResults.value.push({
            type: 'salamo',
            id: psalm.id,
            title: `Salamo ${psalm.id}`,
            bookId: salamoBook.id,
          });
        }
      });
    }
  };

  const clearSearchResults = () => {
    searchResults.value = [];
  };

  const loadData = async () => {
    books.value = await fetch('/data/books.json').then(r => r.json());
    hiraSongs.value = await fetch('/data/HIRA.json').then(r => r.json()).then(d => d.songs || []);
    haaSongs.value = await fetch('/data/HAA.json').then(r => r.json()).then(d => d.songs || []);
    salamoPsalms.value = await fetch('/data/SALAMO.json').then(r => r.json()).then(d => d.psalms || []);
    litpContents.value = await fetch('/data/LitP.json').then(r => r.json()).then(d => d.contents || []);
    litbfContents.value = await fetch('/data/LitBF.json').then(r => r.json()).then(d => d.sections || []);
    lhfContents.value = await fetch('/data/LHF.json').then(r => r.json()).then(d => d.sections || []);
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