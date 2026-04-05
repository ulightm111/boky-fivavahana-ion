<template>
  <ion-page>
    <app-header
      title="Search Results"
      :show-searchbar="true"
      v-model:searchQuery="query"
      @search-input="onSearchInput"
      @search-clear="clearSearch"
    />

    <ion-content :fullscreen="true">
      <div class="content-area">
        <ion-list>
          <ion-item
            v-for="result in searchResults"
            :key="`${result.type}-${result.id}`"
            button
            @click="navigateToSearchResult(result)"
            lines="none"
          >
            <ion-label>
              <h3>{{ result.title }}</h3>
              <p v-if="result.subtitle">{{ result.subtitle }}</p>
            </ion-label>
          </ion-item>
        </ion-list>
        
        <p v-if="searchResults.length === 0 && query.length > 0" class="no-results">
          Tsy misy hita.
        </p>
      </div>
    </ion-content>
    <app-footer />
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage, IonContent, IonList, IonItem, IonLabel
} from '@ionic/vue';
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useBookStore } from '@/stores/bookStore';
import { SearchResult } from '@/stores/bookStore';
import AppHeader from '@/components/AppHeader.vue';
import AppFooter from '@/components/AppFooter.vue';

const route = useRoute();
const router = useRouter();
const bookStore = useBookStore();
const { searchResults } = storeToRefs(bookStore);

const query = ref('');
const scope = ref<number | null>(null);

const performSearch = () => {
  if (query.value) {
    bookStore.performSearch(query.value, scope.value);
  } else {
    bookStore.clearSearchResults();
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

watch(() => route.query, (newQuery) => {
  if (newQuery.q !== query.value) {
    query.value = (newQuery.q as string) || '';
  }
  if (Number(newQuery.scope) !== scope.value && newQuery.scope !== undefined) {
    scope.value = Number(newQuery.scope);
  }
  performSearch();
});

const onSearchInput = (event: any) => {
  query.value = event.target.value.toLowerCase().trim();
  router.replace({ path: '/search', query: { q: query.value, scope: scope.value || undefined } });
};

const clearSearch = () => {
  query.value = '';
  bookStore.clearSearchResults();
  if (scope.value) {
    router.replace({ path: `/books/${scope.value}` });
  } else {
    router.replace({ path: '/books' });
  }
};

const navigateToSearchResult = (result: SearchResult) => {
  if (result.type === 'book') {
    router.push(`/books/${result.id}`);
  } else if (result.type === 'litbf' || result.type === 'lhf' || result.type === 'litp') {
    router.push(`/books/${result.bookId}/section/${encodeURIComponent(result.id as string)}`);
  } else if (result.type === 'litbf-subsection' || result.type === 'lhf-subsection') {
    router.push(`/books/${result.bookId}/section/${encodeURIComponent(result.sectionName!)}/subsection/${result.subsectionIndex}`);
  } else if (result.type === 'hira' || result.type === 'haa' || result.type === 'salamo') {
    router.push(`/books/${result.bookId}/song/${result.id}`);
  }
};
</script>

<style scoped>
.content-area {
  padding: 16px;
  max-width: 900px;
  margin: 0 auto;
}
.no-results {
  text-align: center;
  margin-top: 2rem;
  color: #666;
  font-style: italic;
}
</style>
