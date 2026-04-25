<template>
  <ion-page class="content-view-page">
    <app-header
      :title="title"
      :subtitle="displayMode === 'psalm' ? '' : subtitle"
    />

    <ion-content ref="contentRef" :fullscreen="true" :style="contentStyle">
      <!-- Liturgia Subsections List (if we are at section level and it has subsections) -->
      <ion-list :inset="true" v-if="displayMode === 'subsections'">
        <ion-item
          v-for="(sub, index) in itemObj.subsections"
          :key="index"
          button
          @click="navigateToSubsection(Number(index))"
        >
          <ion-icon :icon="ellipse" slot="start" class="bullet-icon" />
          <ion-label>{{ sub.subsection }}</ion-label>
        </ion-item>
      </ion-list>

      <!-- Liturgy Section or liturgia subsection content -->
      <lit-content
        v-else-if="displayMode === 'liturgia'"
        :is-lit-p="isLitP"
        :is-l-h-f="isLHF"
        :title="subTitleText"
        :items="itemObj.items"
        :htmlContent="htmlContent"
      />

      <!-- Psalm -->
      <psalm-content v-else-if="displayMode === 'psalm'" :psalm="itemObj" />

      <!-- Song -->
      <song-content
        v-else-if="displayMode === 'song'"
        :song="itemObj"
        :is-hira="isHira"
        :is-zigzag="settings.lyricsZZStyle"
      />

      <ion-fab
        v-if="displayMode != 'subsections'"
        vertical="bottom"
        horizontal="end"
        slot="fixed"
        class="zoom-fab"
      >
        <ion-fab-button
          v-if="displayMode === 'song' && settings.showZigzagBtn"
          @click="toggleZigzag"
          class="translucent-btn"
          size="small"
        >
          <ion-icon
            :icon="settings.lyricsZZStyle ? verticalIcon : zigzagIcon"
          />
        </ion-fab-button>
        <ion-fab-button
          v-if="settings.showZoomBtn"
          @click="zoomIn"
          class="translucent-btn"
          size="small"
        >
          <ion-icon :icon="add" />
        </ion-fab-button>
        <ion-fab-button
          v-if="settings.showZoomBtn"
          @click="zoomOut"
          class="translucent-btn"
          size="small"
        >
          <ion-icon :icon="remove" />
        </ion-fab-button>
      </ion-fab>
    </ion-content>
    <app-footer
      @prev="navigatePrev"
      @next="navigateNext"
      @autoscroll="toggleAutoscroll"
      :can-go-prev="canGoPrev"
      :can-go-next="canGoNext"
      :show-autoscroll="true"
      :is-scrolling="isScrolling"
    />
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage,
  IonContent,
  IonFab,
  IonFabButton,
  IonIcon,
  IonList,
  IonItem,
  IonLabel,
  useIonRouter,
} from "@ionic/vue";
import { add, ellipse, remove } from "ionicons/icons";
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { useRoute } from "vue-router";
import { useBookStore } from "@/stores/bookStore";
import AppHeader from "@/components/AppHeader.vue";
import AppFooter from "@/components/AppFooter.vue";
import SongContent from "@/components/lyrics/SongContent.vue";
import PsalmContent from "@/components/lyrics/PsalmContent.vue";
import LitContent from "@/components/lyrics/LitContent.vue";
import { useSettingsStore } from "@/stores/settingsStore";
import { setForceDirection } from "@/router/animation";

const zigzagIcon =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">\
  <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="44"\
  d="M 190.3038,256 H 410 M 102,156 H 307.11392 M 102,356 h 205.11392"/></svg>';
const verticalIcon =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">\
  <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="44"\
  d="M 102,256 H 410 M 102,156 H 410 M 102,356 h 308"/></svg>';

const settings = useSettingsStore();
const route = useRoute();
const router = useIonRouter();
const bookStore = useBookStore();

const bookId = computed(() => Number(route.params.bookId));
const book = computed(() => bookStore.getBookById(bookId.value));

const routeSongId = computed(() =>
  route.params.songId ? Number(route.params.songId) : null,
);

const routeSectionName = computed(() =>
  route.params.sectionName
    ? decodeURIComponent(route.params.sectionName as string)
    : null,
);

const routeSubIndex = computed(() =>
  route.params.subIndex !== undefined ? Number(route.params.subIndex) : null,
);

const isHira = computed(() => bookStore.isHiraBook(book.value || null));
const isSalamo = computed(() => bookStore.isSalamoBook(book.value || null));
const isLitP = computed(() => bookStore.isLitPBook(book.value || null));
const isLHF = computed(() => bookStore.isLHFBook(book.value || null));

const contentStyle = computed(() => ({
  "--lyrics-font-size": `${settings.fontSize}%`,
}));

const displayMode = ref<"subsections" | "liturgia" | "psalm" | "song" | "">("");
const itemObj = ref<any>(null);
const htmlContent = ref<string[]>([]);
const subTitleText = ref<string>("");
const title = ref("");
const subtitle = ref("");

const currentTitlesList = ref<any[]>([]);
const currentTitleIndex = ref(-1);

const canGoPrev = computed(() => currentTitleIndex.value > 0);
const canGoNext = computed(
  () =>
    currentTitleIndex.value > -1 &&
    currentTitleIndex.value < currentTitlesList.value.length - 1,
);

const contentRef = ref<any>(null);
const isScrolling = ref(false);

const loadContent = () => {
  const currentBook = book.value;
  if (!currentBook) return;

  const data = bookStore.getBookData(currentBook);
  if (!Array.isArray(data) || data.length === 0) return;

  // Reset per-load state first, so stale values do not linger.
  itemObj.value = null;
  htmlContent.value = [];
  subTitleText.value = "";
  subtitle.value = currentBook.name;
  currentTitlesList.value = [];
  currentTitleIndex.value = -1;

  if (routeSongId.value !== null) {
    const songId = routeSongId.value;
    const songIndex = data.findIndex((s: any) => s.id === songId);

    if (songIndex !== -1) {
      const song = data[songIndex];
      itemObj.value = song;
      displayMode.value = isSalamo.value ? "psalm" : "song";
      title.value = isSalamo.value
        ? `Salamo - ${song.id}`
        : `${song.id} - ${song.title}`;
      currentTitlesList.value = data.map((s: any) => ({
        id: s.id,
        type: "song",
      }));
      currentTitleIndex.value = songIndex;
    }
    return;
  }

  if (routeSectionName.value !== null) {
    const sectionName = routeSectionName.value;
    const sectionIndex = data.findIndex((s: any) => s.section === sectionName);

    if (sectionIndex === -1) return;

    const section = data[sectionIndex];
    itemObj.value = section;
    title.value = sectionName;

    if (routeSubIndex.value !== null) {
      const subs = section.subsections || [];
      const idx = routeSubIndex.value;

      if (idx >= 0 && idx < subs.length) {
        displayMode.value = "liturgia";
        const sub = subs[idx];
        subTitleText.value = sub.subsection;
        htmlContent.value = sub.content || [];
        currentTitlesList.value = subs.map((_s: any, subIdx: number) => ({
          id: subIdx,
          type: "subsection",
          section: sectionName,
        }));
        currentTitleIndex.value = idx;
      }
      return;
    }

    if (section.subsections && section.subsections.length > 0) {
      displayMode.value = "subsections";
      currentTitlesList.value = section.subsections.map(
        (_s: any, idx: number) => ({
          id: idx,
          type: "subsection",
          section: sectionName,
        }),
      );
    } else {
      displayMode.value = "liturgia";
      htmlContent.value = section.content || [];
      currentTitlesList.value = data.map((s: any) => ({
        id: s.section,
        type: "section",
      }));
      currentTitleIndex.value = sectionIndex;
    }
  }
};

const toggleAutoscroll = async () => {
  if (isScrolling.value) {
    isScrolling.value = false;
    return;
  }

  const el = await contentRef.value?.$el?.getScrollElement?.();
  if (!el) return;

  isScrolling.value = true;

  const stopOnInteraction = () => {
    if (isScrolling.value) {
      isScrolling.value = false;
      el.removeEventListener("pointerdown", stopOnInteraction);
    }
  };

  el.addEventListener("pointerdown", stopOnInteraction);

  const speed = settings.scrollSpeed * 5;
  let lastTime = performance.now();
  let currentPos = el.scrollTop;

  const step = (currentTime: number) => {
    if (!isScrolling.value) return;

    const deltaTime = (currentTime - lastTime) / 1000;
    lastTime = currentTime;

    currentPos += speed * deltaTime;
    el.scrollTop = currentPos;

    if (currentPos + el.clientHeight < el.scrollHeight - 1) {
      requestAnimationFrame(step);
    } else {
      isScrolling.value = false;
      el.removeEventListener("pointerdown", stopOnInteraction);
    }
  };

  requestAnimationFrame(step);
};

watch([routeSongId, routeSectionName, routeSubIndex, bookId], () => {
  isScrolling.value = false;
  loadContent();
});

onMounted(async () => {
  await bookStore.loadData();
  loadContent();
});

onUnmounted(() => {
  isScrolling.value = false;
});

const toggleZigzag = () => {
  settings.lyricsZZStyle = !settings.lyricsZZStyle;
};

const navigateToSubsection = (index: number) => {
  if (!routeSectionName.value) return;

  router.push(
    `/books/${bookId.value}/section/${encodeURIComponent(
      routeSectionName.value,
    )}/subsection/${index}`,
  );
};

const navigateByItem = (
  item: any,
  direction: "forward" | "back" = "forward",
) => {
  if (!item) return;

  let path = "";
  if (item.type === "song") {
    path = `/books/${bookId.value}/song/${item.id}`;
  } else if (item.type === "section") {
    path = `/books/${bookId.value}/section/${encodeURIComponent(item.id)}`;
  } else if (item.type === "subsection") {
    path = `/books/${bookId.value}/section/${encodeURIComponent(
      item.section,
    )}/subsection/${item.id}`;
  }

  if (path) {
    setForceDirection(direction);
    router.navigate(path, direction, "replace");
  }
};

const navigatePrev = () => {
  if (canGoPrev.value) {
    navigateByItem(
      currentTitlesList.value[currentTitleIndex.value - 1],
      "back",
    );
  }
};

const navigateNext = () => {
  if (canGoNext.value) {
    navigateByItem(
      currentTitlesList.value[currentTitleIndex.value + 1],
      "forward",
    );
  }
};

const zoomIn = () => {
  settings.fontSize = Math.min(settings.fontSize + 10, 150);
};

const zoomOut = () => {
  settings.fontSize = Math.max(settings.fontSize - 10, 70);
};
</script>

<style scoped>
:deep(.lyrics-content) {
  font-size: var(--lyrics-font-size, 100%);
}

.zoom-fab {
  margin-bottom: 10px;
  margin-right: 5px;
}

.translucent-btn {
  --background: rgba(var(--ion-color-primary-rgb), 0.4);
  --background-activated: rgba(var(--ion-color-primary-rgb), 0.6);
  --background-focused: rgba(var(--ion-color-primary-rgb), 0.6);
  --color: var(--ion-color-primary-contrast);
  margin-top: 10px;
}
</style>
