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

      <div class="history-panel">
        <ion-accordion-group>
          <ion-accordion value="recent">
            <ion-item slot="header" lines="full" button>
              <ion-label>Recent</ion-label>
            </ion-item>

            <div slot="content">
              <ion-list lines="full">
                <ion-item
                  v-for="item in recentBooks"
                  :key="`${item.bookId}-${item.type}-${item.id ?? ''}-${
                    item.sectionName || ''
                  }-${item.subsectionIndex ?? ''}-${item.title}`"
                  button
                  @click="openRecentBook(item)"
                >
                  <ion-label>{{ item.title }}</ion-label>
                </ion-item>
              </ion-list>
            </div>
          </ion-accordion>
        </ion-accordion-group>
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
  IonIcon,
  IonAccordionGroup,
  IonAccordion,
  IonItem,
  IonLabel,
  IonList,
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
const { books, isLoading, recentBooks } = storeToRefs(bookStore);
const globalSearchQuery = ref("");

onMounted(async () => {
  await bookStore.loadData();
});

const navigateToBook = (bookId: number) => {
  router.push(`/books/${bookId}`);
};

const openRecentBook = (item: any) => {
  if (item.type === "song" || item.type === "psalm") {
    router.push(`/books/${item.bookId}/song/${item.id}`);
    return;
  }

  if (item.type === "subsection") {
    router.push(
      `/books/${item.bookId}/section/${encodeURIComponent(
        item.sectionName || item.title,
      )}/subsection/${item.subsectionIndex ?? 0}`,
    );
    return;
  }

  if (item.type === "section") {
    router.push(
      `/books/${item.bookId}/section/${encodeURIComponent(
        item.sectionName || item.title,
      )}`,
    );
    return;
  }

  router.push(`/books/${item.bookId}`);
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

.history-panel {
  margin: 0 16px 12px;
}

.history-panel ion-accordion-group {
  border: 1px solid var(--ion-border-color);
  border-radius: 10px;
  overflow: hidden;
  background: var(--ion-item-background);
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05);
}

.history-panel ion-list {
  background: transparent;
  padding: 0;
}

.history-panel ion-item {
  --min-height: 38px;
  --padding-top: 4px;
  --padding-bottom: 4px;
  --padding-start: 12px;
  --padding-end: 10px;
  font-size: 0.8rem;
}

.history-panel ion-item[slot="header"] {
  --padding-start: 12px;
  --padding-end: 10px;
  min-height: 42px;
  font-weight: 600;
  font-size: 0.82rem;
}

.history-panel ion-label {
  white-space: normal;
  margin: 6px 0;
  font-size: 0.8rem;
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
