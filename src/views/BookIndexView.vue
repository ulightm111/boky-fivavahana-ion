<template>
  <ion-page>
    <app-header
      :title="book?.name || ''"
      :show-searchbar="true"
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
        <template v-for="(song, index) in flatSongs" :key="song.id">
          <ion-item-divider
            v-if="
              song.section &&
              (index === 0 || song.section !== flatSongs[index - 1].section)
            "
            color="light"
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
const book = computed(() => bookStore.books.find((b) => b.id === bookId.value));

const sectionSearchQuery = ref("");
const displayMode = ref<"sections" | "songSections" | "songs">("sections");

const line =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">\
  <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="10" d="M5 12h14"/></svg>';

const sections = computed(() => {
  if (!book.value) return [];
  if (bookStore.isLitBFBook(book.value))
    return bookStore.litbfContents.map((s) => s.section);
  if (bookStore.isLHFBook(book.value))
    return bookStore.lhfContents.map((s) => s.section);
  if (bookStore.isLitPBook(book.value))
    return bookStore.litpContents.map((s) => s.section);
  return [];
});

const songSections = computed(() =>
  bookStore.getGroupedSongs(book.value || null).map((g) => g.section),
);
const allFlatSongs = computed<any[]>(() => {
  if (!book.value) return [];
  if (bookStore.isHiraBook(book.value)) return bookStore.hiraSongs;
  if (bookStore.isHaaBook(book.value)) return bookStore.haaSongs;
  if (bookStore.isSalamoBook(book.value)) return bookStore.salamoPsalms;
  return [];
});

const filteredAllFlatSongs = computed(() => {
  if (!sectionSearchQuery.value) return allFlatSongs.value;
  const q = sectionSearchQuery.value.toLowerCase().trim();
  return allFlatSongs.value.filter((song: any) => {
    const title = song.title ? song.title.toLowerCase() : `salamo ${song.id}`;
    const section = song.section ? song.section.toLowerCase() : "";
    return (
      String(song.id).includes(q) || title.includes(q) || section.includes(q)
    );
  });
});

const flatSongs = computed(() => {
  return filteredAllFlatSongs.value.slice(0, (bookStore.currentPage + 1) * 50);
});

const hasMoreItems = computed(() => {
  return (bookStore.currentPage + 1) * 50 < filteredAllFlatSongs.value.length;
});
const canToggleView = computed(
  () =>
    book.value &&
    (bookStore.isHiraBook(book.value) || bookStore.isHaaBook(book.value)),
);

const checkDisplayMode = () => {
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

onMounted(async () => {
  if (bookStore.books.length === 0) await bookStore.loadData();
  bookStore.currentPage = 0; // Reset pagination
  checkDisplayMode();
});

watch(book, () => {
  bookStore.currentPage = 0;
  checkDisplayMode();
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

const onIonInfinite = (event: any) => {
  bookStore.currentPage++;
  setTimeout(() => event.target.complete(), 50);
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
</style>
