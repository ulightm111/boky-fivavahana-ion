<template>
  <ion-page>
    <app-header
      title="Boky Fivavahana"
      :show-back-button="false"
      :show-searchbar="true"
      v-model:searchQuery="globalSearchQuery"
      @search-submit="onGlobalSearchSubmit"
      @search-clear="clearGlobalSearch"
    />

    <ion-content :fullscreen="true">
      <div class="content-area">
        <ion-list>
          <ion-item
            v-for="book in books"
            :key="book.id"
            button
            @click="navigateToBook(book.id)"
            lines="none"
          >
            <ion-label>{{ book.name }}</ion-label>
          </ion-item>
        </ion-list>
      </div>
    </ion-content>
    <app-footer />
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage, IonContent,
  IonList, IonItem, IonLabel
} from '@ionic/vue';
import { ref, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router';
import { useBookStore } from '@/stores/bookStore';
import AppHeader from '@/components/AppHeader.vue';
import AppFooter from '@/components/AppFooter.vue';

const router = useRouter();
const bookStore = useBookStore();
const { books } = storeToRefs(bookStore);
const globalSearchQuery = ref('');

const loadData = async () => {
  if (books.value.length === 0) {
    await bookStore.loadData();
  }
};

onMounted(async () => {
  await loadData();
});

const navigateToBook = (bookId: number) => {
  router.push(`/books/${bookId}`);
};

const onGlobalSearchSubmit = () => {
  const query = globalSearchQuery.value.toLowerCase().trim();
  if (query !== '') {
    router.push({ path: '/search', query: { q: query } });
  }
};

const clearGlobalSearch = () => {
  globalSearchQuery.value = '';
};
</script>

<style scoped>
.content-area {
  padding: 16px;
  max-width: 900px;
  margin: 0 auto;
}
</style>
