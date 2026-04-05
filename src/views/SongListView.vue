<template>
  <ion-page>
    <app-header
      :title="book?.name || ''"
      :show-back-button="true"
      :show-searchbar="true"
      :search-placeholder="`Hitady @${book?.name || ''}...`"
      v-model:searchQuery="sectionSearchQuery"
      @search-submit="onSectionSearchSubmit"
      @search-clear="clearSectionSearch"
    />

    <ion-content :fullscreen="true">
      <div class="content-area">
        <ion-list>
          <ion-item
            v-for="song in songs"
            :key="song.id"
            button
            @click="navigateToSong(song.id)"
            lines="none"
          >
            <ion-label>
              <h3>{{ song.id }} - {{ song.title }}</h3>
            </ion-label>
          </ion-item>
        </ion-list>
      </div>
    </ion-content>
    <app-footer />
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage, IonContent, IonList, IonItem, IonLabel
} from '@ionic/vue';
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useBookStore } from '@/stores/bookStore';
import AppHeader from '@/components/AppHeader.vue';
import AppFooter from '@/components/AppFooter.vue';

const route = useRoute();
const router = useRouter();
const bookStore = useBookStore();

const sectionSearchQuery = ref('');
const bookId = computed(() => Number(route.params.bookId));
const book = computed(() => bookStore.books.find(b => b.id === bookId.value));
const groupName = computed(() => decodeURIComponent(route.params.groupName as string));

const songs = computed(() => {
  if (!book.value) return [];
  const groups = bookStore.getGroupedSongs(book.value);
  const group = groups.find(g => g.section === groupName.value);
  return group ? group.songs : [];
});

onMounted(async () => {
  if (bookStore.books.length === 0) await bookStore.loadData();
});

const navigateToSong = (songId: number) => {
  router.push(`/books/${bookId.value}/song/${songId}`);
};

const onSectionSearchSubmit = () => {
  const query = sectionSearchQuery.value.toLowerCase().trim();
  if (query !== '') {
    router.push({ path: '/search', query: { q: query, scope: bookId.value } });
  }
};

const clearSectionSearch = () => {
  sectionSearchQuery.value = '';
};
</script>

<style scoped>
.content-area {
  padding: 16px;
  max-width: 900px;
  margin: 0 auto;
}
</style>
