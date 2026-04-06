<template>
  <ion-page :key="$route.fullPath">
    <app-header
      title="Boky Fivavahana"
      :show-searchbar="true"
      v-model:searchQuery="globalSearchQuery"
      @search-submit="onGlobalSearchSubmit"
      @search-clear="clearGlobalSearch"
    />

    <ion-content :fullscreen="true">
      <div class="books-container">
        <ion-card
          v-for="book in books"
          :key="book.id"
          button
          @click="navigateToBook(book.id)"
          class="book-card"
        >
          <ion-card-header>
            <ion-card-title>{{ book.name }}</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            {{ book.description }}
          </ion-card-content>
        </ion-card>
      </div>
    </ion-content>
    <app-footer />
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
} from "@ionic/vue";
import { ref, onMounted } from "vue";
import { storeToRefs } from "pinia";
import { useRouter } from "vue-router";
import { useBookStore } from "@/stores/bookStore";
import AppHeader from "@/components/AppHeader.vue";
import AppFooter from "@/components/AppFooter.vue";

const router = useRouter();
const bookStore = useBookStore();
const { books } = storeToRefs(bookStore);
const globalSearchQuery = ref("");

const loadData = async () => {
  if (books.value.length === 0) {
    await bookStore.loadData();
  }
};

onMounted(async () => {
  await loadData();
});

const navigateToBook = (bookId: number) => {
  router.replace(`/books/${bookId}`);
};

const onGlobalSearchSubmit = () => {
  const query = globalSearchQuery.value.toLowerCase().trim();
  if (query !== "") {
    router.replace({ path: "/search", query: { q: query } });
  }
};

const clearGlobalSearch = () => {
  globalSearchQuery.value = "";
};
</script>

<style scoped>
.books-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 12px;
  padding: 16px;
}

.book-card {
  margin: 0;
  width: 100%;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.book-card:active {
  transform: scale(0.98);
}

ion-card-header {
  padding-bottom: 8px;
}

ion-card-title {
  font-size: 1.2em;
  font-weight: bold;
}

ion-card-content {
  font-size: 0.9em;
  color: var(--ion-color-medium);
}
</style>
