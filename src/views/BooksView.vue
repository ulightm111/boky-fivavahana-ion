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
        <ion-card
          v-for="book in books"
          :key="book.id"
          button
          @click="navigateToBook(book.id)"
          class="book-card"
        >
          <div class="card-content-wrapper">
            <div class="icon-section">
              <div class="svg-container" v-html="getBookSvg(book.name)"></div>
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
  useIonRouter,
} from "@ionic/vue";
import { ref, onMounted } from "vue";
import { storeToRefs } from "pinia";
import { useBookStore } from "@/stores/bookStore";
import AppHeader from "@/components/AppHeader.vue";
import AppFooter from "@/components/AppFooter.vue";

const router = useIonRouter();
const bookStore = useBookStore();
const { books } = storeToRefs(bookStore);
const globalSearchQuery = ref("");

const SVGS = {
  LITURGY:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>',
  MUSIC:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>',
  PSALMS:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path><path d="M9 14V7l8-1v7"></path><circle cx="7.5" cy="14" r="1.5"></circle><circle cx="15.5" cy="13" r="1.5"></circle></svg>',
  CROSS:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="2" x2="12" y2="22"></line><line x1="7" y1="9" x2="17" y2="9"></line></svg>',
  DEFAULT:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>',
};

const getBookSvg = (name: string) => {
  const re = /fihirana|hanandratra/i;
  if (re.test(name)) return SVGS.MUSIC;
  if (name.includes("Salamo")) return SVGS.PSALMS;
  if (name.includes("Hazo Fijaliana")) return SVGS.CROSS;
  if (name.includes("Litorjia")) return SVGS.LITURGY;
  return SVGS.DEFAULT;
};

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

.svg-container {
  width: 40px;
  height: 40px;
  color: var(--ion-color-secondary);
}

.text-section {
  flex: 1;
}

ion-card-title {
  color: var(--ion-text-color);
}

.book-card:active {
  transform: scale(0.98);
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
