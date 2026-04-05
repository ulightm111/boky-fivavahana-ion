<template>
  <ion-page>
    <app-header
      :title="title"
      :subtitle="subtitle"
      :show-back-button="true"
    />

    <ion-content :fullscreen="true">
      <div id="content" class="content-area">
        <!-- Render depending on what data we have -->
        <!-- Liturgia Subsections List (if we are at section level and it has subsections) -->
        <ion-list v-if="displayMode === 'subsections'">
          <ion-item
            v-for="(sub, index) in itemObj.subsections"
            :key="index"
            button
            @click="navigateToSubsection(Number(index))"
            lines="none"
          >
            <ion-label>{{ sub.subsection }}</ion-label>
          </ion-item>
        </ion-list>
        
        <!-- Liturgy Section or liturgia subsection content -->
        <lit-content v-else-if="displayMode === 'liturgia'"
                     :is-lit-p="isLitP"
                     :is-l-h-f="isLHF"
                     :title="subTitleText"
                     :items="itemObj.items"
                     :htmlContent="htmlContent" />

        <!-- Psalm -->
        <psalm-content v-else-if="displayMode === 'psalm'" :psalm="itemObj" />

        <!-- Song -->
        <song-content v-else-if="displayMode === 'song'" :song="itemObj" :is-hira="isHira" />
      </div>

      <ion-fab vertical="bottom" horizontal="end" slot="fixed">
        <ion-fab-button @click="zoomIn">
          <ion-icon :icon="add"></ion-icon>
        </ion-fab-button>
        <ion-fab-button @click="zoomOut">
          <ion-icon :icon="remove"></ion-icon>
        </ion-fab-button>
      </ion-fab>
    </ion-content>
    <app-footer @prev="navigatePrev" @next="navigateNext" :can-go-prev="canGoPrev" :can-go-next="canGoNext" />
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage, IonContent,
  IonFab, IonFabButton, IonIcon, IonList, IonItem, IonLabel
} from '@ionic/vue';
import { add, remove } from 'ionicons/icons';
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useBookStore } from '@/stores/bookStore';
import AppHeader from '@/components/AppHeader.vue';
import AppFooter from '@/components/AppFooter.vue';
import SongContent from '@/components/lyrics/SongContent.vue';
import PsalmContent from '@/components/lyrics/PsalmContent.vue';
import LitContent from '@/components/lyrics/LitContent.vue';

const route = useRoute();
const router = useRouter();
const bookStore = useBookStore();

const bookId = computed(() => Number(route.params.bookId));
const book = computed(() => bookStore.books.find(b => b.id === bookId.value));
const routeSongId = computed(() => route.params.songId ? Number(route.params.songId) : null);
const routeSectionName = computed(() => route.params.sectionName ? decodeURIComponent(route.params.sectionName as string) : null);
const routeSubIndex = computed(() => route.params.subIndex !== undefined ? Number(route.params.subIndex) : null);

const isHira = computed(() => bookStore.isHiraBook(book.value || null));
const isSalamo = computed(() => bookStore.isSalamoBook(book.value || null));
const isLitP = computed(() => bookStore.isLitPBook(book.value || null));
const isLHF = computed(() => bookStore.isLHFBook(book.value || null));

const currentFontSize = ref(100);

const displayMode = ref('');
const itemObj = ref<any>(null);
const htmlContent = ref<string>('');
const subTitleText = ref<string>('');
const title = ref('');
const subtitle = ref('');

const currentTitlesList = ref<any[]>([]);
const currentTitleIndex = ref(-1);

const canGoPrev = computed(() => currentTitleIndex.value > 0);
const canGoNext = computed(() => currentTitleIndex.value > -1 && currentTitleIndex.value < currentTitlesList.value.length - 1);

const loadContent = () => {
  if (!book.value) return;

  const data = bookStore.getBookData(book.value);
  if (!data || data.length === 0) return;

  if (routeSongId.value !== null) {
    const songId = routeSongId.value;
    const songIndex = data.findIndex((s: any) => s.id === songId);
    if (songIndex !== -1) {
      itemObj.value = data[songIndex];
      displayMode.value = isSalamo.value ? 'psalm' : 'song';
      title.value = isSalamo.value ? `Salamo ${itemObj.value.id}` : `${itemObj.value.id} - ${itemObj.value.title}`;
      subtitle.value = book.value.name;

      if (bookStore.lastFlatBookId !== book.value.id) {
        currentTitlesList.value = data.map((s: any) => ({ id: s.id, type: 'song' }));
        bookStore.lastFlatBookId = book.value.id;
      } else {
        currentTitlesList.value = data.map((s: any) => ({ id: s.id, type: 'song' }));
      }
      currentTitleIndex.value = songIndex;
    }
  } else if (routeSectionName.value !== null) {
    const sName = routeSectionName.value;
    const sectionIndex = data.findIndex((s: any) => s.section === sName);
    if (sectionIndex !== -1) {
      const section = data[sectionIndex];
      itemObj.value = section;
      title.value = sName;
      subtitle.value = book.value.name;
      
      if (routeSubIndex.value !== null) {
        displayMode.value = 'liturgia';
        const sub = section.subsections[routeSubIndex.value];
        subTitleText.value = sub.subsection;
        htmlContent.value = sub.content;
        currentTitlesList.value = section.subsections.map((_: any, idx: number) => ({ id: idx, type: 'subsection', section: sName }));
        currentTitleIndex.value = routeSubIndex.value;
      } else {
        if (section.subsections && section.subsections.length > 0) {
          displayMode.value = 'subsections';
          currentTitleIndex.value = -1;
        } else {
          displayMode.value = 'liturgia';
          htmlContent.value = section.content || '';
          currentTitlesList.value = data.map((s: any) => ({ id: s.section, type: 'section' }));
          currentTitleIndex.value = sectionIndex;
        }
      }
    }
  }
};

onMounted(async () => {
  if (bookStore.books.length === 0) await bookStore.loadData();
  const saved = localStorage.getItem('fontSizePercentage');
  if (saved) {
    currentFontSize.value = parseInt(saved);
    applyFontSize();
  }
  loadContent();
});

watch([routeSongId, routeSectionName, routeSubIndex], () => {
  loadContent();
});

const navigateToSubsection = (index: number) => {
  router.push(`/books/${bookId.value}/section/${encodeURIComponent(routeSectionName.value as string)}/subsection/${index}`);
};

const navigatePrev = () => {
  if (canGoPrev.value) {
    const prevItem = currentTitlesList.value[currentTitleIndex.value - 1];
    navigateByItem(prevItem);
  }
};

const navigateNext = () => {
  if (canGoNext.value) {
    const nextItem = currentTitlesList.value[currentTitleIndex.value + 1];
    navigateByItem(nextItem);
  }
};

const navigateByItem = (itemObjRef: any) => {
  if (itemObjRef.type === 'song') {
    router.push(`/books/${bookId.value}/song/${itemObjRef.id}`);
  } else if (itemObjRef.type === 'section') {
    router.push(`/books/${bookId.value}/section/${encodeURIComponent(itemObjRef.id)}`);
  } else if (itemObjRef.type === 'subsection') {
    router.push(`/books/${bookId.value}/section/${encodeURIComponent(itemObjRef.section)}/subsection/${itemObjRef.id}`);
  }
};

const zoomIn = () => {
  currentFontSize.value = Math.min(currentFontSize.value + 10, 150);
  applyFontSize();
};

const zoomOut = () => {
  currentFontSize.value = Math.max(currentFontSize.value - 10, 80);
  applyFontSize();
};

const applyFontSize = () => {
  document.documentElement.style.fontSize = (16 * (currentFontSize.value / 100)) + 'px';
  localStorage.setItem('fontSizePercentage', currentFontSize.value.toString());
};
</script>

<style scoped>
.content-area {
  padding: 16px;
  max-width: 900px;
  margin: 0 auto;
}
.subtitle {
  font-size: 0.8em;
  font-weight: normal;
  color: var(--ion-color-medium);
}
</style>
