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
      <ion-list :inset="true">
        <template v-for="song in filteredSongs" :key="song.id">
          <ion-item button @click="navigateToSong(song.id)">
            <ion-label class="song-label">
              <span class="song-id">{{ song.id }}</span>
              <ion-icon :icon="line" class="bullet-icon line-icon" />
              <span class="song-title">{{ song.title }}</span>
            </ion-label>
          </ion-item>
        </template>
      </ion-list>
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
  useIonRouter,
} from "@ionic/vue";
import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useBookStore } from "@/stores/bookStore";
import AppHeader from "@/components/AppHeader.vue";
import AppFooter from "@/components/AppFooter.vue";

const line =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">\
  <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="10" d="M5 12h14"/></svg>';

const route = useRoute();
const router = useIonRouter();
const bookStore = useBookStore();

const sectionSearchQuery = ref("");
const bookId = computed(() => Number(route.params.bookId));
const book = computed(() => bookStore.books.find((b) => b.id === bookId.value));
const groupName = computed(() =>
  decodeURIComponent(route.params.groupName as string),
);

const songs = computed(() => {
  if (!book.value) return [];
  const groups = bookStore.getGroupedSongs(book.value);
  const group = groups.find((g) => g.section === groupName.value);
  return group ? group.songs : [];
});

const filteredSongs = computed(() => {
  if (!sectionSearchQuery.value) return songs.value;
  const q = sectionSearchQuery.value.toLowerCase().trim();
  return songs.value.filter((song) => {
    const title = song.title ? song.title.toLowerCase() : "";
    return String(song.id).includes(q) || title.includes(q);
  });
});

onMounted(async () => {
  await bookStore.loadData();
});

const navigateToSong = (songId: number) => {
  router.push(`/books/${bookId.value}/song/${songId}`);
};

const onSectionSearchSubmit = () => {
  // In specific song lists, search acts as a local filter. We don't navigate on submit.
};

const clearSectionSearch = () => {
  sectionSearchQuery.value = "";
};
</script>
