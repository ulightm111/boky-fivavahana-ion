<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-title>{{ headerTitle }} <span v-if="headerSubtitle" class="subtitle">- {{ headerSubtitle }}</span></ion-title>
      </ion-toolbar>
      <!-- Global Search -->
      <ion-toolbar v-if="showGlobalSearch">
        <ion-searchbar
          v-model="globalSearchQuery"
          placeholder="Hitady..."
          @ionInput="onGlobalSearchInput"
          @ionClear="clearGlobalSearch"
        ></ion-searchbar>
      </ion-toolbar>
      <!-- Section Search -->
      <ion-toolbar v-if="showSectionSearch">
        <ion-searchbar
          v-model="sectionSearchQuery"
          :placeholder="`Hitady @${currentBook?.name || ''}...`"
          @ionInput="onSectionSearchInput"
          @ionClear="clearSectionSearch"
        ></ion-searchbar>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">

      <!-- Content Area -->
      <div id="content" class="content-area">
        <!-- Books List -->
        <ion-list v-if="currentView === 'books'">
          <ion-item
            v-for="book in books"
            :key="book.id"
            button
            @click="navigateToBook(book)"
            lines="none"
          >
            <ion-label>{{ book.name }}</ion-label>
          </ion-item>
        </ion-list>

        <!-- Sections List -->
        <ion-list v-if="currentView === 'sections'">
          <ion-item
            v-for="section in sections"
            :key="section"
            button
            @click="navigateToSection(section)"
            lines="none"
          >
            <ion-label>{{ section }}</ion-label>
          </ion-item>
        </ion-list>

        <!-- Songs List -->
        <!-- Song Sections (hierarchical view for grouped songs) -->
        <ion-list v-if="currentView === 'songSections'">
          <ion-item
            v-for="section in songSectionsList"
            :key="section"
            button
            @click="selectGroupedSection(section)"
            lines="none"
          >
            <ion-label>{{ section }}</ion-label>
          </ion-item>
        </ion-list>

        <!-- Songs List -->
        <ion-list v-if="currentView === 'songs'">
          <template v-if="isSalamo || songViewMode === 'flat' || currentGroupedSection === ''">
            <ion-item
              v-for="song in flatSongs"
              :key="song.id"
              button
              @click="navigateToSong(song.id)"
              lines="none"
            >
              <ion-label>{{ song.id }} - {{ song.title || `Salamo ${song.id}` }}</ion-label>
            </ion-item>
          </template>
          <template v-else>
            <ion-item
              v-for="song in songsInCurrentSection"
              :key="song.id"
              button
              @click="navigateToSong(song.id)"
              lines="none"
            >
              <ion-label>
                <h3>{{ song.id }} - {{ song.title }}</h3>
              </ion-label>
            </ion-item>
          </template>
        </ion-list>

        <ion-button v-if="hasMoreItems && currentView === 'songs'" expand="block" @click="loadMore">
          Load More
        </ion-button>

        <!-- Search Results -->
        <ion-list v-if="currentView === 'search'">
          <ion-item
            v-for="result in searchResults"
            :key="`${result.type}-${result.id}`"
            button
            @click="navigateToSearchResult(result)"
            lines="none"
          >
            <ion-label>
              <h3>{{ result.title }}</h3>
              <p v-if="result.subtitle">{{ result.subtitle }}</p>
            </ion-label>
          </ion-item>
        </ion-list>

        <!-- Content Display -->
        <div v-if="currentView === 'content'" v-html="currentContent" class="lyrics-content"></div>
        <ion-list v-if="currentView === 'content' && subsections.length > 0">
          <ion-item
            v-for="(sub, index) in subsections"
            :key="index"
            button
            @click="navigateToSubsection(index)"
            lines="none"
          >
            <ion-label>{{ sub.subsection }}</ion-label>
          </ion-item>
        </ion-list>
      </div>

      <!-- Floating Action Buttons -->
      <ion-fab vertical="bottom" horizontal="end" slot="fixed">
        <ion-fab-button v-if="showToggle" @click="toggleSongView">
          <ion-icon :icon="songViewMode === 'grouped' ? list : grid"></ion-icon>
        </ion-fab-button>
        <ion-fab-button @click="zoomIn">
          <ion-icon :icon="add"></ion-icon>
        </ion-fab-button>
        <ion-fab-button @click="zoomOut">
          <ion-icon :icon="remove"></ion-icon>
        </ion-fab-button>
      </ion-fab>
    </ion-content>

    <!-- Bottom Tab Bar -->
    <ion-footer>
      <ion-toolbar>
        <ion-buttons>
          <ion-button @click="toggleMenu" fill="clear">
            <ion-icon :icon="menu"></ion-icon>
            <ion-label>Menu</ion-label>
          </ion-button>
          <ion-button @click="navigatePrev" :disabled="!canGoPrev" fill="clear">
            <ion-icon :icon="chevronBack"></ion-icon>
            <ion-label>Prev</ion-label>
          </ion-button>
          <ion-button @click="navigateNext" :disabled="!canGoNext" fill="clear">
            <ion-icon :icon="chevronForward"></ion-icon>
            <ion-label>Next</ion-label>
          </ion-button>
          <ion-button @click="toggleSearch" fill="clear">
            <ion-icon :icon="search"></ion-icon>
            <ion-label>Search</ion-label>
          </ion-button>
          <ion-button @click="goBack" :disabled="!canGoBack" fill="clear">
            <ion-icon :icon="arrowBack"></ion-icon>
            <ion-label>Back</ion-label>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-footer>

    <!-- Menu Modal -->
    <ion-modal :is-open="showMenuModal" @didDismiss="showMenuModal = false">
      <ion-header>
        <ion-toolbar>
          <ion-title>Menu</ion-title>
          <ion-buttons slot="end">
            <ion-button @click="showMenuModal = false">Close</ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content>
        <ion-list>
          <ion-item
            v-for="book in books"
            :key="book.id"
            button
            @click="navigateToBookFromMenu(book)"
            lines="none"
          >
            <ion-label>{{ book.name }}</ion-label>
          </ion-item>
          <ion-item button @click="showAbout" lines="none">
            <ion-label>Mombamomba</ion-label>
          </ion-item>
        </ion-list>
      </ion-content>
    </ion-modal>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonSearchbar,
  IonList,
  IonItem,
  IonLabel,
  IonFab,
  IonFabButton,
  IonIcon,
  IonFooter,
  IonButton,
  IonModal,
  toastController,
} from '@ionic/vue';
import {
  menu,
  chevronBack,
  chevronForward,
  search,
  arrowBack,
  add,
  remove,
  list,
  grid,
} from 'ionicons/icons';
import { ref, onMounted, computed, shallowRef } from 'vue';

// Type definitions
interface Book {
  id: number;
  name: string;
}

interface Song {
  id: number;
  title: string;
  section: string;
  content?: string;
  verses?: any[];
  intro?: string;
  headnote?: string;
  has_amen?: boolean;
  footnote?: string;
}

interface Psalm {
  id: number;
  verses?: any[];
}

interface LitContent {
  section: string;
  content?: string;
  subsections?: Array<{ subsection: string; content?: string }>;
  items?: Array<{ id: string; content: string }>;
}

interface SearchResult {
  type: string;
  id: number | string;
  title: string;
  subtitle?: string;
  bookId?: number;
  sectionName?: string;
  subsectionIndex?: number;
}

// Data - use shallowRef for large arrays to avoid deep reactivity overhead
const books = ref<Book[]>([]);
const hiraSongs = shallowRef<Song[]>([]);
const haaSongs = shallowRef<Song[]>([]);
const salamoPsalms = shallowRef<Psalm[]>([]);
const litpContents = shallowRef<LitContent[]>([]);
const litbfContents = shallowRef<LitContent[]>([]);
const lhfContents = shallowRef<LitContent[]>([]);

// New refs
const songViewMode = ref<'grouped' | 'flat'>('grouped');
const showToggle = ref(false);
const navigationStack = ref<(() => void)[]>([]);
const currentView = ref<string>('books');
const currentBook = ref<Book | null>(null);
const currentSection = ref<string>('');
const currentGroupedSection = ref<string>('');
const currentContent = ref<string>('');
const searchResults = shallowRef<SearchResult[]>([]);
const currentScopeBookId = ref<number | null>(null);
const currentTitleIndex = ref<number>(-1);
const currentTitlesList = shallowRef<any[]>([]);

// UI State
const headerTitle = ref('Boky Fivavahana');
const headerSubtitle = ref('');
const showGlobalSearch = ref(false);
const showSectionSearch = ref(false);
const showMenuModal = ref(false);
const globalSearchQuery = ref('');
const sectionSearchQuery = ref('');

// Zoom
const currentFontSize = ref(100);

// Performance: Cache grouped/flat songs — shallowRef avoids deep reactivity on large arrays
const groupedSongsCache = shallowRef<{ section: string; songs: Song[] }[]>([]);
const lastGroupedBookId = ref<number | null>(null);
const flatSongsSorted = shallowRef<any[]>([]);
const lastFlatBookId = ref<number | null>(null);

// Performance: Pagination for large lists
const ITEMS_PER_PAGE = 50;
const currentPage = ref(0);

// Computed
const sections = computed(() => {
  if (!currentBook.value) return [];
  if (isLitBFBook(currentBook.value)) {
    return litbfContents.value.map(s => s.section);
  } else if (isLHFBook(currentBook.value)) {
    return lhfContents.value.map(s => s.section);
  } else if (isLitPBook(currentBook.value)) {
    return litpContents.value.map(s => s.section);
  }
  return [];
});

const groupedSongs = computed(() => {
  if (!currentBook.value) return [];
  
  // Return cached result if book hasn't changed
  if (lastGroupedBookId.value === currentBook.value.id && groupedSongsCache.value.length > 0) {
    return groupedSongsCache.value;
  }
  
  let songs: Song[] = [];
  if (isHiraBook(currentBook.value)) {
    songs = hiraSongs.value;
  } else if (isHaaBook(currentBook.value)) {
    songs = haaSongs.value;
  }
  
  if (songs.length === 0) return [];
  
  // Use Map for faster grouping
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
  lastGroupedBookId.value = currentBook.value.id;
  
  return result;
});

const canGoBack = computed(() => navigationStack.value.length > 0);
const canGoPrev = computed(() => currentTitleIndex.value > 0);
const canGoNext = computed(() => currentTitleIndex.value < currentTitlesList.value.length - 1);


const flatSongs = computed(() => {
  if (!currentBook.value) return [];
  if (lastFlatBookId.value === currentBook.value.id && flatSongsSorted.value.length > 0) {
    return flatSongsSorted.value.slice(0, (currentPage.value + 1) * ITEMS_PER_PAGE);
  }
  let songs: any[];
  if (isHiraBook(currentBook.value)) songs = hiraSongs.value;
  else if (isHaaBook(currentBook.value)) songs = haaSongs.value;
  else if (isSalamoBook(currentBook.value)) songs = salamoPsalms.value;
  else return [];
  // Data is pre-sorted by id in JSON — no spread/sort needed
  flatSongsSorted.value = songs;
  lastFlatBookId.value = currentBook.value.id;
  return songs.slice(0, (currentPage.value + 1) * ITEMS_PER_PAGE);
});

const hasMoreItems = computed(() => {
  if (!currentBook.value) return false;
  let totalSongs: any[];
  if (isHiraBook(currentBook.value)) totalSongs = hiraSongs.value;
  else if (isHaaBook(currentBook.value)) totalSongs = haaSongs.value;
  else if (isSalamoBook(currentBook.value)) totalSongs = salamoPsalms.value;
  else return false;
  return flatSongs.value.length < totalSongs.length;
});

const isSalamo = computed(() => isSalamoBook(currentBook.value));

const songSectionsList = computed(() => {
  return groupedSongs.value.map(g => g.section);
});

const songsInCurrentSection = computed(() => {
  if (!currentGroupedSection.value) return [];
  const group = groupedSongs.value.find(g => g.section === currentGroupedSection.value);
  return group ? group.songs : [];
});

const subsections = shallowRef<{ subsection: string; content?: string }[]>([]);
const loadData = async () => {
  try {
    books.value = await fetch('/data/books.json').then(r => r.json());
    hiraSongs.value = await fetch('/data/HIRA.json').then(r => r.json()).then(d => d.songs || []);
    haaSongs.value = await fetch('/data/HAA.json').then(r => r.json()).then(d => d.songs || []);
    salamoPsalms.value = await fetch('/data/SALAMO.json').then(r => r.json()).then(d => d.psalms || []);
    litpContents.value = await fetch('/data/LitP.json').then(r => r.json()).then(d => d.contents || []);
    litbfContents.value = await fetch('/data/LitBF.json').then(r => r.json()).then(d => d.sections || []);
    lhfContents.value = await fetch('/data/LHF.json').then(r => r.json()).then(d => d.sections || []);
  } catch (error) {
    console.error('Failed to load data:', error);
    const toast = await toastController.create({
      message: 'Failed to load data',
      duration: 2000,
    });
    await toast.present();
  }
};

const updateHeader = (title: string, subtitle = '') => {
  headerTitle.value = title;
  headerSubtitle.value = subtitle;
};

const showBooks = () => {
  currentView.value = 'books';
  updateHeader('Boky Fivavahana');
  currentScopeBookId.value = null;
  showSectionSearch.value = false;
};

const loadMore = () => {
  currentPage.value++;
};

const navigateToBook = (book: Book) => {
  lastGroupedBookId.value = null;
  lastFlatBookId.value = null;
  currentPage.value = 0;
  navigationStack.value = [...navigationStack.value, showBooks];
  showSections(book);
};

const navigateToBookFromMenu = (book: Book) => {
  showMenuModal.value = false;
  navigateToBook(book);
};

const showSections = (book: Book) => {
  currentBook.value = book;
  currentScopeBookId.value = book.id;
  showSectionSearch.value = true;

  if (isHiraBook(book) || isHaaBook(book)) {
    showSectionsView();
  } else if (isLitPBook(book)) {
    showLitPSections();
  } else if (isLitBFBook(book) || isLHFBook(book)) {
    showSectionsList();
  } else if (isSalamoBook(book)) {
    showSalamoList();
  }
  updateHeader(book.name);
};

const navigateToSection = (section: string) => {
  navigationStack.value.push(() => showSections(currentBook.value!));
  showSectionContent(currentBook.value!, section);
};

const showSectionContent = (book: Book, sectionName: string) => {
  currentSection.value = sectionName;
  const contents = getBookData(book);
  const sectionObj = contents.find((s: any) => s.section === sectionName);
  if (sectionObj) {
    if (isLitPBook(book)) {
      currentContent.value = renderLitPContent(sectionObj);
      currentTitlesList.value = litpContents.value.map(s => ({ id: s.section }));
      currentTitleIndex.value = litpContents.value.findIndex(s => s.section === sectionName);
      subsections.value = [];
    } else {
      currentContent.value = sectionObj.content || '';
      if (sectionObj.subsections && sectionObj.subsections.length > 0) {
        subsections.value = sectionObj.subsections;
        currentTitlesList.value = sectionObj.subsections.map((_: any, idx: number) => ({ id: idx }));
        currentTitleIndex.value = -1;
      } else {
        subsections.value = [];
        currentTitlesList.value = contents.map((s: any, idx: number) => ({ id: idx }));
        currentTitleIndex.value = contents.findIndex((s: any) => s.section === sectionName);
      }
    }
    currentView.value = 'content';
    updateHeader(sectionName, book.name);
  }
};

const navigateToSong = (songId: number) => {
  navigationStack.value = [...navigationStack.value, () => showSections(currentBook.value!)];
  showSong(currentBook.value!, songId);
};

const showSong = (book: Book, songId: number) => {
  const songs = getBookData(book);
  const songIndex = songs.findIndex((s: any) => s.id === songId);
  if (songIndex === -1) return;
  const song = songs[songIndex];

  if (isSalamoBook(book)) {
    currentContent.value = renderPsalmContent(song);
    updateHeader(`Salamo ${song.id}`, book.name);
  } else {
    currentContent.value = renderSongContent(song);
    updateHeader(`${song.id} - ${song.title}`, book.name);
  }
  currentView.value = 'content';
  subsections.value = [];

  // Only rebuild titles list if book changed — avoid mapping 500+ songs on every navigation
  if (lastFlatBookId.value !== book.id) {
    currentTitlesList.value = songs.map((s: any) => ({ id: s.id }));
    lastFlatBookId.value = book.id;
  }
  currentTitleIndex.value = songIndex;
};

// Helper functions
const isHiraBook = (book: Book | null) => book && book.name === 'Fihirana';
const isHaaBook = (book: Book | null) => book && book.name === 'Hanandratra Anao Aho';
const isSalamoBook = (book: Book | null) => book && book.name === 'Salamo';
const isLitPBook = (book: Book | null) => book && book.name === 'Litorjia Provinsialy';
const isLitBFBook = (book: Book | null) => book && book.name === 'Litorjia Boky Fivavahana';
const isLHFBook = (book: Book | null) => book && book.name === 'Lalan\'ny Hazo Fijaliana';

const getBookData = (book: Book | null): any[] => {
  if (isHiraBook(book)) return hiraSongs.value;
  if (isHaaBook(book)) return haaSongs.value;
  if (isSalamoBook(book)) return salamoPsalms.value;
  if (isLitPBook(book)) return litpContents.value;
  if (isLitBFBook(book)) return litbfContents.value;
  if (isLHFBook(book)) return lhfContents.value;
  return [];
};

// Navigation
const goBack = () => {
  const stack = navigationStack.value;
  if (stack.length === 0) return;
  const previous = stack[stack.length - 1];
  navigationStack.value = stack.slice(0, -1);
  clearSearch();
  currentContent.value = '';
  currentTitleIndex.value = -1;
  currentTitlesList.value = [];
  currentGroupedSection.value = '';
  previous();
};

const navigatePrev = () => {
  if (currentTitleIndex.value > 0) {
    currentTitleIndex.value--;
    showContent(currentTitlesList.value[currentTitleIndex.value].id);
  }
};

const navigateNext = () => {
  if (currentTitleIndex.value < currentTitlesList.value.length - 1) {
    currentTitleIndex.value++;
    showContent(currentTitlesList.value[currentTitleIndex.value].id);
  }
};

const showContent = (titleId: any) => {
  if (!currentBook.value) return;
  if (currentSection.value && typeof titleId === 'number') {
    showSubsectionContent(currentBook.value, currentSection.value, titleId);
  } else if (typeof titleId === 'string') {
    showSectionContent(currentBook.value, titleId);
  } else {
    showSong(currentBook.value, titleId);
  }
};

// Search
const toggleSearch = () => {
  if (showSectionSearch.value) {
    showSectionSearch.value = false;
    clearSectionSearch();
  } else {
    showGlobalSearch.value = !showGlobalSearch.value;
    if (!showGlobalSearch.value) {
      clearGlobalSearch();
    }
  }
};

const onGlobalSearchInput = (event: any) => {
  const query = event.target.value.toLowerCase().trim();
  if (query === '') {
    searchResults.value = [];
    showBooks();
  } else {
    performSearch(query);
  }
};

const onSectionSearchInput = (event: any) => {
  const query = event.target.value.toLowerCase().trim();
  if (query === '') {
    searchResults.value = [];
    if (currentBook.value) showSections(currentBook.value);
  } else {
    performSearch(query, currentScopeBookId.value);
  }
};

const clearGlobalSearch = () => {
  globalSearchQuery.value = '';
  searchResults.value = [];
  showBooks();
};

const clearSectionSearch = () => {
  sectionSearchQuery.value = '';
  searchResults.value = [];
  if (currentBook.value) showSections(currentBook.value);
};

const clearSearch = () => {
  globalSearchQuery.value = '';
  sectionSearchQuery.value = '';
  searchResults.value = [];
  showGlobalSearch.value = false;
  showSectionSearch.value = false;
};

const performSearch = (query: string, scopeBookId: number | null = null) => {
  searchResults.value = [];
  const normalized = query.toLowerCase().trim();
  if (!normalized) return;

  const isGlobal = scopeBookId == null;
  const scopedBook = scopeBookId ? books.value.find(b => b.id === scopeBookId) : null;

  // Search books
  books.value.forEach(book => {
    if (!isGlobal && scopedBook && scopedBook.id !== book.id) return;
    if (book.name.toLowerCase().includes(normalized)) {
      searchResults.value.push({
        type: 'book',
        id: book.id,
        title: book.name,
      });
    }
  });

  // Search lit style
  const searchLit = (bookName: string, contents: any[], type: string) => {
    const book = books.value.find(b => b.name === bookName);
    if (!book) return;
    if (!isGlobal && scopedBook && scopedBook.id !== book.id) return;
    contents.forEach(section => {
      if (section.section && section.section.toLowerCase().includes(normalized)) {
        searchResults.value.push({
          type,
          id: section.section,
          title: section.section,
          bookId: book.id,
          sectionName: section.section,
        });
      }
      if (section.subsections) {
        section.subsections.forEach((sub: any, idx: number) => {
          if (sub.subsection && sub.subsection.toLowerCase().includes(normalized)) {
            searchResults.value.push({
              type: `${type}-subsection`,
              id: idx,
              title: sub.subsection,
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

  // Search LitP
  if (isGlobal || (scopedBook && isLitPBook(scopedBook))) {
    const book = books.value.find(b => b.name === 'Litorjia Provinsialy');
    if (book) {
      litpContents.value.forEach(section => {
        if (section.section && section.section.toLowerCase().includes(normalized)) {
          searchResults.value.push({
            type: 'litp',
            id: section.section,
            title: section.section,
            bookId: book.id,
          });
        }
      });
    }
  }

  // Search songs
  const searchSongs = (bookName: string, data: any[], type: string) => {
    const book = books.value.find(b => b.name === bookName);
    if (!book) return;
    if (!isGlobal && scopedBook && scopedBook.id !== book.id) return;
    data.forEach(song => {
      let match = false;
      // Search by ID
      if (String(song.id).toLowerCase().includes(normalized)) match = true;
      // Search by title
      if (!match && song.title && song.title.toLowerCase().includes(normalized)) match = true;
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

  // Search Salamo
  const salamoBook = books.value.find(b => b.name === 'Salamo');
  if ((isGlobal || (scopedBook && scopedBook.id === salamoBook?.id)) && salamoBook) {
    salamoPsalms.value.forEach(psalm => {
      let match = false;
      // Search by ID
      if (String(psalm.id).toLowerCase().includes(normalized)) match = true;
      if (match) {
        searchResults.value.push({
          type: 'salamo',
          id: psalm.id,
          title: `Salamo ${psalm.id}`,
          bookId: salamoBook.id,
        });
      }
    });
  }

  showSearchResults();
};

const showSearchResults = () => {
  currentView.value = 'search';
  updateHeader('Search Results');
};

const navigateToSearchResult = (result: SearchResult) => {
  clearSearch();
  if (result.type === 'book') {
    const book = books.value.find(b => b.id === result.id);
    if (book) {
      navigationStack.value = [showBooks];
      showSections(book);
    }
  } else if (result.type === 'litbf' || result.type === 'lhf' || result.type === 'litp') {
    const book = books.value.find(b => b.id === result.bookId);
    if (book) {
      navigationStack.value = [showBooks, () => showSections(book)];
      showSections(book);
      navigateToSection(result.id as string);
    }
  } else if (result.type === 'litbf-subsection' || result.type === 'lhf-subsection') {
    const book = books.value.find(b => b.id === result.bookId);
    if (book) {
      navigationStack.value = [showBooks, () => showSections(book)];
      showSections(book);
      navigateToSection(result.sectionName!);
      navigateToSubsection(result.subsectionIndex!);
    }
  } else if (result.type === 'hira' || result.type === 'haa' || result.type === 'salamo') {
    const book = books.value.find(b => b.id === result.bookId);
    if (book) {
      navigationStack.value = [showBooks, () => showSections(book)];
      showSections(book);
      navigateToSong(result.id as number);
    }
  }
};

// Zoom
const zoomIn = () => {
  currentFontSize.value = Math.min(currentFontSize.value + 10, 150);
  applyFontSize();
};

const zoomOut = () => {
  currentFontSize.value = Math.max(currentFontSize.value - 10, 80);
  applyFontSize();
};

const applyFontSize = () => {
  document.documentElement.style.fontSize = (16 * (currentFontSize.value / 100)) + 'px';
  localStorage.setItem('fontSizePercentage', currentFontSize.value.toString());
};

// Menu
const toggleMenu = () => {
  showMenuModal.value = true;
};

const showAbout = () => {
  currentView.value = 'content';
  currentContent.value = `
    <h2>Mombamomba</h2>
    <p>Aplikasiona boky fivavahana malagasy.</p>
    <p>Version 1.0</p>
    <p>Built with Ionic and Vue.</p>
  `;
  updateHeader('Mombamomba');
  currentTitlesList.value = [];
  currentTitleIndex.value = -1;
};


// Render methods
const renderSongContent = (song: any) => {
  const lines: string[] = [];

  if (song.intro) {
    lines.push(`<div class="note" id="intro">${song.intro}</div>`);
    lines.push('<hr>');
  }
  if (song.headnote) {
    lines.push(`<div class="note" id="headnote">${song.headnote}</div>`);
  }

  if (song.verses && song.verses.length > 0) {
    song.verses.forEach((v: any) => {
      // Insert chorus after verse 2 if available
      if (v.verse_number === 2 && song.chorus && song.chorus.length > 0) {
        lines.push('<div class="verse chorus">');
        lines.push('<div class="chorus-title">Fiverenana:</div>');
        lines.push('<p>');
        lines.push(song.chorus.join('<br />'));
        lines.push('</p>');
        lines.push('</div>');
      }

      lines.push('<div class="verse">');
      if (isHiraBook(currentBook.value)) {
        lines.push(`<span><strong>${v.verse_number}.</strong></span>`);
      }
      const verseLines = Array.isArray(v.lines) ? v.lines : [v.lines];
      lines.push('<p>');
      lines.push(verseLines.join('<br />'));
      lines.push('</p>');
      lines.push('</div>');
    });
  }

  if (song.has_amen) {
    lines.push('<p style="text-align:center"><em>Amena</em></p>');
  }
  if (song.footnote) {
    lines.push('<hr>');
    lines.push(`<div class="note" id="footnote">${song.footnote}</div>`);
  }

  return lines.join('\n');
};

const renderPsalmContent = (psalm: any) => {
  const lines: string[] = [];
  if (psalm.verses && psalm.verses.length > 0) {
    psalm.verses.forEach((v: any) => {
      const verseLines = Array.isArray(v.lines) ? v.lines : [v.lines];
      verseLines.forEach((line: any) => {
        lines.push(`<p class="line"><strong>${v.verse_number}.</strong> ${line}</p>`);
      });
    });
  }
  return lines.join('\n');
};

const renderLitPContent = (sectionObj: any) => {
  let html = '';
  sectionObj.items.sort((a: any, b: any) => Number(a.id) - Number(b.id)).forEach((item: any) => {
    html += `<p><strong>${item.id}</strong> ${item.content}</p>`;
  });
  return html.replace(/<br\s*\/?>/g, '<br><span style="margin-left:2rem; display:inline-block;"></span>');
};

// New methods
const toggleSongView = () => {
  songViewMode.value = songViewMode.value === 'grouped' ? 'flat' : 'grouped';
  if (songViewMode.value === 'flat') {
    // When switching to flat mode, show all songs
    currentGroupedSection.value = '';
    currentView.value = 'songs';
  } else {
    // When switching to grouped mode, show sections
    currentGroupedSection.value = '';
    showSectionsView();
  }
};

const navigateToSubsection = (index: number) => {
  navigationStack.value = [...navigationStack.value, () => showSectionContent(currentBook.value!, currentSection.value)];
  showSubsectionContent(currentBook.value!, currentSection.value, index);
};

const showSubsectionContent = (book: Book, sectionName: string, subsectionIndex: number) => {
  const contents = getBookData(book);
  const sectionObj = contents.find((s: any) => s.section === sectionName);
  const sub = sectionObj.subsections[subsectionIndex];
  currentContent.value = isLHFBook(book) ? `<h2 class="title">${sub.subsection}</h2>${sub.content}` : sub.content;
  currentView.value = 'content';
  updateHeader(sectionName, book.name);
  currentTitlesList.value = sectionObj.subsections!.map((_: any, idx: number) => ({ id: idx }));
  currentTitleIndex.value = subsectionIndex;
};

const showSongs = () => {
  currentView.value = 'songs';
  updateHeader(currentBook.value!.name);
  showToggle.value = true;
};

const showSectionsView = () => {
  if (songViewMode.value === 'grouped' && (isHiraBook(currentBook.value) || isHaaBook(currentBook.value))) {
    currentView.value = 'songSections';
    updateHeader(currentBook.value!.name);
    showToggle.value = true;
  } else {
    showSongs();
  }
};

const selectGroupedSection = (sectionName: string) => {
  currentGroupedSection.value = sectionName;
  currentView.value = 'songs';
  updateHeader(currentBook.value!.name, sectionName);
  navigationStack.value = [...navigationStack.value, showSectionsView];
};

const showSalamoList = () => {
  currentView.value = 'songs';
  updateHeader(currentBook.value!.name);
  showToggle.value = false;
};

const showSectionsList = () => {
  currentView.value = 'sections';
  updateHeader(currentBook.value!.name);
  showToggle.value = false;
};

const showLitPSections = () => {
  currentView.value = 'sections';
  updateHeader(currentBook.value!.name);
  showToggle.value = false;
};

// Lifecycle
onMounted(async () => {
  await loadData();
  showBooks();
  // Load saved font size
  const saved = localStorage.getItem('fontSizePercentage');
  if (saved) {
    currentFontSize.value = parseInt(saved);
    applyFontSize();
  }
});
</script>

<style scoped>
.content-area {
  padding: 16px;
  max-width: 900px;
  margin: 0 auto;
}

.lyrics-content {
  font-family: "Times New Roman", Times, serif;
  background: white;
  padding: 16px;
  margin-bottom: 10px;
  border-radius: 10px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
}

.lyrics-content :deep(.verse) {
  display: grid;
  grid-template-columns: auto 1fr;
  column-gap: 0.5em;
  align-items: start;
  padding: 0.8rem 0;
}

.lyrics-content :deep(.verse p) {
  margin: 0;
  line-height: normal;
}

.lyrics-content :deep(.verse.chorus) {
  background: #f5f5f5;
  padding: 1rem;
  border-left: 4px solid #007bff;
  margin: 1rem 0;
}

.lyrics-content :deep(.chorus-title) {
  font-weight: bold;
  margin-bottom: 0.5rem;
  font-style: italic;
}

.lyrics-content :deep(.title) {
  font-size: 1.2rem;
  font-weight: 600;
  text-align: center;
  margin-top: 0.4rem;
}

.lyrics-content :deep(.note) {
  font-style: italic;
  color: #555;
  margin: 1rem 0;
  padding: 0.5rem;
  border-left: 3px solid #ddd;
  padding-left: 1rem;
}

.lyrics-content :deep(hr) {
  border: none;
  border-top: 1px solid #ccc;
  margin: 1.5rem 0;
}

.lyrics-content :deep(.line) {
  margin: 0.5rem 0;
  line-height: 1.6;
}
</style>