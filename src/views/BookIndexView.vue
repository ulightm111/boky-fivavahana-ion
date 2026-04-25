<template>
  <ion-page>
    <app-header
      :title="book?.name || 'Boky Fivavahana'"
      :show-searchbar="bookType !== 'litp' && bookType !== 'lhf'"
      :search-placeholder="`Hitady @${book?.name || ''}...`"
      v-model:searchQuery="sectionSearchQuery"
      @search-submit="onSectionSearchSubmit"
      @search-clear="clearSectionSearch"
    />

    <ion-content :fullscreen="true">
      <!-- Sections for LitBF, LitP, LHF -->
      <ion-list :inset="true" v-if="displayMode === 'sections'">
        <ion-item
          v-for="section in sections"
          :key="section"
          button
          @click="navigateToSection(section)"
        >
          <ion-icon
            :icon="ellipse"
            slot="start"
            size="x-small"
            class="bullet-icon"
          />
          <ion-label>{{ section }}</ion-label>
        </ion-item>
      </ion-list>

      <!-- Song Groups for Hira and HAA -->
      <ion-list :inset="true" v-else-if="displayMode === 'songSections'">
        <ion-item
          v-for="section in songSections"
          :key="section"
          button
          @click="navigateToSongGroup(section)"
        >
          <ion-icon
            :icon="ellipse"
            slot="start"
            size="x-small"
            class="bullet-icon"
          />
          <ion-label>{{ section }}</ion-label>
        </ion-item>
      </ion-list>

      <!-- Flat Songs and Salamo -->
      <ion-list
        :inset="true"
        v-else-if="displayMode === 'songs'"
        class="song-section"
      >
        <template v-for="(song, index) in displayedSongs" :key="song.id">
          <ion-item-divider
            v-if="
              song.section &&
              (index === 0 ||
                song.section !== displayedSongs[index - 1].section)
            "
            class="sticky-label"
            sticky
          >
            <ion-label>{{ song.section }}</ion-label>
          </ion-item-divider>

          <ion-item button @click="navigateToSong(song.id)">
            <ion-icon
              v-if="!song.title"
              :icon="ellipse"
              slot="start"
              class="bullet-icon"
            />
            <ion-label v-if="song.title" class="song-label">
              <span class="song-id">{{ song.id }}</span>
              <ion-icon :icon="line" class="bullet-icon line-icon" />
              <span class="song-title">{{ song.title }}</span>
            </ion-label>
            <ion-label v-else>
              Salamo<ion-icon :icon="line" class="bullet-icon line-icon" />
              <span style="margin-left: 0">{{ song.id }}</span>
            </ion-label>
          </ion-item>
        </template>
      </ion-list>

      <ion-infinite-scroll
        v-if="displayMode === 'songs'"
        @ionInfinite="onIonInfinite"
        :disabled="!hasMoreItems"
      >
        <ion-infinite-scroll-content
          loading-text="Loading..."
          loading-spinner="bubbles"
        ></ion-infinite-scroll-content>
      </ion-infinite-scroll>

      <ion-fab
        vertical="bottom"
        horizontal="end"
        slot="fixed"
        v-if="canToggleView"
      >
        <ion-fab-button @click="toggleToFlatSongs" size="small">
          <ion-icon
            :icon="displayMode === 'songSections' ? listIcon : folderIcon"
          ></ion-icon>
        </ion-fab-button>
      </ion-fab>
    </ion-content>

    <app-footer />
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonFab,
  IonFabButton,
  IonIcon,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonItemDivider,
  useIonRouter,
} from "@ionic/vue";
import {
  list as listIcon,
  folderOutline as folderIcon,
  ellipse,
} from "ionicons/icons";
import { ref, computed, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import { useBookStore } from "@/stores/bookStore";
import AppHeader from "@/components/AppHeader.vue";
import AppFooter from "@/components/AppFooter.vue";

const route = useRoute();
const router = useIonRouter();
const bookStore = useBookStore();

const bookId = computed(() => Number(route.params.bookId));
const book = computed(() => bookStore.getBookById(bookId.value));

const sectionSearchQuery = ref("");
const debouncedSearchQuery = ref("");
const displayMode = ref<"sections" | "songSections" | "songs">("sections");

const pageSize = 50;
const displayedSongs = ref<any[]>([]);
const prefetchedSongs = ref<any[]>([]);

const line =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">\
  <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="10" d="M5 12h14"/></svg>';

type BookKind = "hira" | "haa" | "salamo" | "litp" | "litbf" | "lhf" | null;

const bookType = computed<BookKind>(() => {
  if (!book.value) return null;
  if (bookStore.isHiraBook(book.value)) return "hira";
  if (bookStore.isHaaBook(book.value)) return "haa";
  if (bookStore.isSalamoBook(book.value)) return "salamo";
  if (bookStore.isLitPBook(book.value)) return "litp";
  if (bookStore.isLitBFBook(book.value)) return "litbf";
  if (bookStore.isLHFBook(book.value)) return "lhf";
  return null;
});

const sections = computed(() => {
  switch (bookType.value) {
    case "litbf":
      return bookStore.litbfContents.map((s) => s.section);
    case "lhf":
      return bookStore.lhfContents.map((s) => s.section);
    case "litp":
      return bookStore.litpContents.map((s) => s.section);
    default:
      return [];
  }
});

const songSections = computed(() =>
  bookStore.getGroupedSongs(book.value || null).map((g) => g.section),
);

const flatSongSource = computed<any[]>(() => {
  switch (bookType.value) {
    case "hira":
      return bookStore.hiraSongs;
    case "haa":
      return bookStore.haaSongs;
    case "salamo":
      return bookStore.salamoPsalms;
    default:
      return [];
  }
});

const filteredFlatSongs = computed(() => {
  const source = flatSongSource.value;
  const query = debouncedSearchQuery.value.toLowerCase().trim();

  if (!query) return source;

  return source.filter((song: any) => {
    const title = song.title
      ? String(song.title).toLowerCase()
      : `salamo ${song.id}`;
    const section = song.section ? String(song.section).toLowerCase() : "";
    return (
      String(song.id).includes(query) ||
      title.includes(query) ||
      section.includes(query)
    );
  });
});

const hasMoreItems = computed(() => prefetchedSongs.value.length > 0);

const canToggleView = computed(
  () =>
    book.value &&
    (bookStore.isHiraBook(book.value) || bookStore.isHaaBook(book.value)),
);

const syncSongPagination = () => {
  if (displayMode.value !== "songs") {
    displayedSongs.value = [];
    prefetchedSongs.value = [];
    return;
  }

  const songs = filteredFlatSongs.value;
  bookStore.currentPage = 0;
  displayedSongs.value = songs.slice(0, pageSize);
  prefetchedSongs.value = songs.slice(pageSize, pageSize * 2);
};

watch(
  sectionSearchQuery,
  (value, _oldValue, onCleanup) => {
    const timer = window.setTimeout(() => {
      debouncedSearchQuery.value = value;
    }, 200);

    onCleanup(() => window.clearTimeout(timer));
  },
  { immediate: true },
);

watch(
  [filteredFlatSongs, displayMode],
  () => {
    syncSongPagination();
  },
  { immediate: true },
);

const applyDefaultDisplayMode = () => {
  if (!book.value) return;

  if (
    bookStore.isHiraBook(book.value) ||
    bookStore.isHaaBook(book.value) ||
    bookStore.isSalamoBook(book.value)
  ) {
    displayMode.value = "songs";
  } else {
    displayMode.value = "sections";
  }
};

watch(
  bookType,
  () => {
    applyDefaultDisplayMode();
  },
  { immediate: true },
);

onMounted(async () => {
  await bookStore.loadData();
  bookStore.currentPage = 0;
  applyDefaultDisplayMode();
});

const navigateToSection = (sectionName: string) => {
  router.push(
    `/books/${bookId.value}/section/${encodeURIComponent(sectionName)}`,
  );
};

const navigateToSongGroup = (groupName: string) => {
  router.push(`/books/${bookId.value}/group/${encodeURIComponent(groupName)}`);
};

const navigateToSong = (songId: number) => {
  router.push(`/books/${bookId.value}/song/${songId}`);
};

const onIonInfinite = async (event: any) => {
  if (prefetchedSongs.value.length === 0) {
    await event.target.complete();
    return;
  }

  displayedSongs.value = displayedSongs.value.concat(prefetchedSongs.value);
  bookStore.currentPage += 1;

  const nextStart = (bookStore.currentPage + 1) * pageSize;
  prefetchedSongs.value = filteredFlatSongs.value.slice(
    nextStart,
    nextStart + pageSize,
  );

  await event.target.complete();
};

const toggleToFlatSongs = () => {
  displayMode.value = displayMode.value === "songs" ? "songSections" : "songs";
};

const onSectionSearchSubmit = () => {
  if (displayMode.value === "songs") {
    // If we're displaying flat songs, search acts as a local filter.
    return;
  }

  const query = sectionSearchQuery.value.toLowerCase().trim();
  if (query !== "") {
    router.push({ path: "/search", query: { q: query, scope: bookId.value } });
  }
};

const clearSectionSearch = () => {
  sectionSearchQuery.value = "";
  debouncedSearchQuery.value = "";
};
</script>

<style scoped>
.content-area {
  padding: 16px;
  max-width: 900px;
  margin: 0 auto;
}

.song-section {
  overflow: visible;
}

.sticky-label {
  color: var(--ion-text-color);
  font-weight: 600;
  height: 3em;
  text-wrap: balance;
}
</style>
