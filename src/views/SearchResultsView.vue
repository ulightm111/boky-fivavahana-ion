<template>
  <ion-page>
    <app-header
      title="Fikarohana"
      :show-searchbar="true"
      :debounce="250"
      v-model:searchQuery="query"
      @search-input="onSearchInput"
      @search-clear="clearSearch"
    />

    <ion-content :fullscreen="true">
      <ion-list :inset="true">
        <ion-item
          v-for="result in searchResults"
          :key="`${result.type}-${result.id}`"
          button
          @click="navigateToSearchResult(result)"
        >
          <ion-label>
            <h3>{{ result.title }}</h3>
            <p v-if="result.subtitle">{{ result.subtitle }}</p>
          </ion-label>
        </ion-item>
      </ion-list>

      <p
        v-if="searchResults.length === 0 && query.length > 0"
        class="no-results"
      >
        Tsy misy hita.
      </p>
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
import { ref, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import { storeToRefs } from "pinia";
import { useBookStore, SearchResult } from "@/stores/bookStore";
import AppHeader from "@/components/AppHeader.vue";
import AppFooter from "@/components/AppFooter.vue";

const route = useRoute();
const router = useIonRouter();
const bookStore = useBookStore();
const { searchResults } = storeToRefs(bookStore);

const query = ref("");
const scope = ref<number | null>(null);

const performSearch = () => {
  if (query.value) {
    bookStore.performSearch(query.value, scope.value);
  } else {
    bookStore.clearSearchResults();
  }
};

const updateRoute = () => {
  router.replace({
    path: "/search",
    query: {
      q: query.value || undefined,
      scope: scope.value || undefined,
    },
  });
};

// Called after debounce (user stopped typing)
const onSearchInput = () => {
  performSearch();
  updateRoute();
};

const clearSearch = () => {
  query.value = "";
  bookStore.clearSearchResults();
  if (scope.value) {
    router.replace({ path: `/books/${scope.value}` });
  } else {
    router.replace({ path: "/books" });
  }
};

onMounted(async () => {
  if (bookStore.books.length === 0) await bookStore.loadData();

  if (route.query.q) {
    query.value = route.query.q as string;
  }
  if (route.query.scope) {
    scope.value = Number(route.query.scope);
  }
  performSearch();
});

// Sync with URL changes (back/forward buttons)
watch(
  () => route.query,
  (newQuery) => {
    const newQ = (newQuery.q as string) || "";
    if (newQ !== query.value) {
      query.value = newQ;
      performSearch();
    }
    const newScope = newQuery.scope ? Number(newQuery.scope) : null;
    if (newScope !== scope.value) {
      scope.value = newScope;
    }
  },
  { deep: true },
);

const navigateToSearchResult = (result: SearchResult) => {
  if (result.type === "book") {
    router.push(`/books/${result.id}`);
  } else if (
    result.type === "litbf" ||
    result.type === "lhf" ||
    result.type === "litp"
  ) {
    router.push(
      `/books/${result.bookId}/section/${encodeURIComponent(result.title!)}`,
    );
  } else if (
    result.type === "litbf-subsection" ||
    result.type === "lhf-subsection"
  ) {
    router.push(
      `/books/${result.bookId}/section/${encodeURIComponent(
        result.sectionName!,
      )}/subsection/${result.subsectionIndex}`,
    );
  } else if (
    result.type === "hira" ||
    result.type === "haa" ||
    result.type === "salamo"
  ) {
    router.push(`/books/${result.bookId}/song/${result.id}`);
  }
};
</script>

<style scoped>
h3 {
  font-size: 1em;
}
.no-results {
  text-align: center;
  margin-top: 2em;
  color: var(--ion-color-medium);
  font-style: italic;
}
</style>
