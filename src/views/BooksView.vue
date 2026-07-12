<template>
  <ion-page>
    <app-header
      title="Boky Fivavahana"
      :show-searchbar="true"
      v-model:searchQuery="globalSearchQuery"
      @search-submit="onGlobalSearchSubmit"
      @search-clear="clearGlobalSearch"
    />

    <ion-content :fullscreen="true">
      <div class="books-container">
        <template v-if="isLoading">
          <ion-card v-for="i in 6" :key="'skeleton-' + i" class="book-card">
            <div class="card-content-wrapper">
              <div class="icon-section">
                <ion-skeleton-text
                  animated
                  style="width: 40px; height: 40px; border-radius: 4px"
                ></ion-skeleton-text>
              </div>
              <div class="text-section">
                <ion-card-header>
                  <ion-skeleton-text
                    animated
                    style="width: 60%"
                  ></ion-skeleton-text>
                </ion-card-header>
                <ion-card-content>
                  <ion-skeleton-text
                    animated
                    style="width: 100%"
                  ></ion-skeleton-text>
                  <ion-skeleton-text
                    animated
                    style="width: 80%"
                  ></ion-skeleton-text>
                </ion-card-content>
              </div>
            </div>
          </ion-card>
        </template>
        <template v-else>
          <ion-card
            v-for="book in books"
            :key="book.id"
            button
            @click="navigateToBook(book.id)"
            class="book-card"
          >
            <div class="card-content-wrapper">
              <div class="icon-section">
                <ion-icon :icon="getBookSvg(book.name)" color="secondary" />
              </div>
              <div class="text-section">
                <ion-card-header>
                  <ion-card-title>{{ book.name }}</ion-card-title>
                </ion-card-header>
                <ion-card-content>
                  {{ book.description }}
                </ion-card-content>
              </div>
            </div>
          </ion-card>
        </template>
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
  IonSkeletonText,
  useIonRouter,
} from "@ionic/vue";
import { ref, onMounted } from "vue";
import { storeToRefs } from "pinia";
import { useBookStore } from "@/stores/bookStore";
import AppHeader from "@/components/AppHeader.vue";
import AppFooter from "@/components/AppFooter.vue";
import { getBookSvg } from "@/utils/svgIcons";

const router = useIonRouter();
const bookStore = useBookStore();
const { books, isLoading } = storeToRefs(bookStore);
const globalSearchQuery = ref("");

onMounted(async () => {
  await bookStore.loadData();
});

const navigateToBook = (bookId: number) => {
  router.push(`/books/${bookId}`);
};

const onGlobalSearchSubmit = () => {
  const query = globalSearchQuery.value.toLowerCase().trim();
  if (query !== "") {
    router.push({ path: "/search", query: { q: query } });
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
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  will-change: transform;
}

.card-content-wrapper {
  display: flex;
  align-items: center;
  padding: 2px;
}

.icon-section {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 70px;
  height: 70px;
}

ion-icon {
  width: 40px;
  height: 40px;
}

.text-section {
  flex: 1;
}

ion-card-title {
  color: var(--ion-text-color);
}

.book-card:active {
  transform: scale(0.98);
  will-change: transform;
}

ion-card {
  font-family: Tahoma, Roboto, sans-serif;
}

ion-card-header {
  padding-bottom: 4px;
}

ion-card-title {
  font-size: 1.2em;
  font-weight: bold;
  letter-spacing: 0.05em;
}

ion-card-content {
  font-size: 0.85em;
  color: var(--ion-color-medium);
}
</style>
```
