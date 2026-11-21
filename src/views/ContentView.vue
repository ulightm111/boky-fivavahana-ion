<template>
  <ion-page class="content-view-page">
    <app-header
      :title="title"
      :subtitle="displayMode === 'psalm' ? '' : subtitle"
    >
      <template #header-actions>
        <ion-button
          v-if="currentFavoriteItem"
          fill="clear"
          size="small"
          class="favorite-header-btn"
          @click="toggleCurrentFavorite"
        >
          <ion-icon :icon="isCurrentFavorite ? starIconSolid : starIcon" />
        </ion-button>
      </template>
    </app-header>

    <ion-content
      ref="contentRef"
      :fullscreen="true"
      :style="contentStyle"
      @touchstart="handleTouchStart"
      @touchmove="handleTouchMove"
      @touchend="handleTouchEnd"
      @touchcancel="handleTouchCancel"
    >
      <div class="swipe-stage">
        <div ref="swipeElement" class="swipe-current">
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
            @multi-column-change="onSongMultiColumnChange"
          />
        </div>

        <div
          v-if="previewMode"
          ref="previewElement"
          class="swipe-preview"
          :class="previewSide"
        >
          <lit-content
            v-if="previewMode === 'liturgia'"
            :is-lit-p="isLitP"
            :is-l-h-f="isLHF"
            :title="previewSubTitle"
            :items="previewItem?.items"
            :htmlContent="previewHtml"
          />
          <psalm-content
            v-else-if="previewMode === 'psalm'"
            :psalm="previewItem"
          />
          <song-content
            v-else-if="previewMode === 'song'"
            :song="previewItem"
            :is-hira="isHira"
            :is-zigzag="settings.lyricsZZStyle"
            @multi-column-change="onSongMultiColumnChange"
          />
        </div>
      </div>

      <ion-fab
        v-if="displayMode != 'subsections'"
        vertical="bottom"
        horizontal="end"
        slot="fixed"
        class="zoom-fab"
      >
        <ion-fab-button
          v-if="
            displayMode === 'song' &&
            settings.showZigzagBtn &&
            !isSongMultiColumn
          "
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
  IonButton,
  IonList,
  IonItem,
  IonLabel,
  useIonRouter,
} from "@ionic/vue";
import { add, ellipse, remove } from "ionicons/icons";
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from "vue";
import { useRoute } from "vue-router";
import { useBookStore, FavoriteItem } from "@/stores/bookStore";
import AppHeader from "@/components/AppHeader.vue";
import AppFooter from "@/components/AppFooter.vue";
import SongContent from "@/components/lyrics/SongContent.vue";
import PsalmContent from "@/components/lyrics/PsalmContent.vue";
import LitContent from "@/components/lyrics/LitContent.vue";
import { useSettingsStore } from "@/stores/settingsStore";
import { setForceDirection } from "@/router/animation";
import {
  zigzagIcon,
  verticalIcon,
  starIcon,
  starIconSolid,
} from "@/utils/svgIcons";

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

const currentFavoriteItem = computed<FavoriteItem | null>(() => {
  if (!book.value || !itemObj.value) return null;

  if (displayMode.value === "song" || displayMode.value === "psalm") {
    return {
      type: displayMode.value === "psalm" ? "psalm" : "song",
      bookId: book.value.id,
      id: itemObj.value.id,
      title: title.value || `${itemObj.value.id}`,
      subtitle: book.value.name,
    };
  }

  if (displayMode.value === "liturgia") {
    return {
      type: routeSubIndex.value !== null ? "subsection" : "section",
      bookId: book.value.id,
      id: routeSubIndex.value ?? title.value,
      title: subTitleText.value || title.value,
      subtitle: book.value.name,
      sectionName: routeSectionName.value || title.value,
      subsectionIndex: routeSubIndex.value ?? undefined,
    };
  }

  return null;
});

const isCurrentFavorite = computed(() =>
  currentFavoriteItem.value
    ? bookStore.isFavorite(currentFavoriteItem.value)
    : false,
);

const toggleCurrentFavorite = () => {
  if (currentFavoriteItem.value) {
    bookStore.toggleFavorite(currentFavoriteItem.value);
  }
};

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

const swipeStart = ref<{ x: number; y: number } | null>(null);
const swipeElement = ref<HTMLElement | null>(null);
const previewElement = ref<HTMLElement | null>(null);
const isHorizontalSwipe = ref(false);
const SWIPE_THRESHOLD = 50;

const previewMode = ref<"liturgia" | "psalm" | "song" | "">("");
const previewSide = ref<"next" | "prev">("next");
const previewItem = ref<any>(null);
const previewHtml = ref<string[]>([]);
const previewSubTitle = ref("");

const clearPreview = () => {
  previewMode.value = "";
  previewItem.value = null;
  previewHtml.value = [];
  previewSubTitle.value = "";
};

const resetSwipeVisual = (commitDirection?: "forward" | "back") => {
  if (!swipeElement.value) return;

  const el = swipeElement.value;
  const width = el.clientWidth || window.innerWidth;
  el.style.transition = "transform 180ms cubic-bezier(0.4, 0, 0.2, 1)";

  if (commitDirection) {
    el.style.transform = `translate3d(${commitDirection === "back" ? width : -width}px, 0, 0)`;
    if (previewElement.value) {
      previewElement.value.style.transition = "transform 180ms cubic-bezier(0.4, 0, 0.2, 1)";
      previewElement.value.style.transform = "translate3d(0, 0, 0)";
    }
  } else {
    el.style.transform = "translate3d(0, 0, 0)";
    if (previewElement.value) {
      previewElement.value.style.transition = "transform 180ms cubic-bezier(0.4, 0, 0.2, 1)";
      previewElement.value.style.transform = "";
    }
  }

  window.setTimeout(() => {
    el.style.transition = "";
    if (!commitDirection) el.style.transform = "";
    if (previewElement.value) {
      previewElement.value.style.transition = "";
      if (!commitDirection) previewElement.value.style.transform = "";
    }
    if (!commitDirection) clearPreview();
  }, 190);
};

const showPreview = (direction: "forward" | "back") => {
  const index =
    direction === "forward"
      ? currentTitleIndex.value + 1
      : currentTitleIndex.value - 1;
  const item = currentTitlesList.value[index];
  if (!item) {
    clearPreview();
    return;
  }

  const path = getItemPath(item);
  const content = preloadedContent.get(path) ?? null;
  if (!content) {
    clearPreview();
    return;
  }

  previewSide.value = direction === "forward" ? "next" : "prev";

  if (item.type === "song") {
    previewItem.value = content;
    previewMode.value = isSalamo.value ? "psalm" : "song";
  } else if (item.type === "subsection") {
    previewItem.value = content;
    previewMode.value = "liturgia";
    previewSubTitle.value = content.subsection || "";
    previewHtml.value = content.content || [];
  } else if (item.type === "section") {
    previewItem.value = content;
    previewMode.value = "liturgia";
    previewSubTitle.value = "";
    previewHtml.value = content.content || [];
  }
};

const handleTouchStart = (event: TouchEvent) => {
  if (event.touches.length !== 1) {
    swipeStart.value = null;
    return;
  }

  const touch = event.touches[0];
  swipeStart.value = { x: touch.clientX, y: touch.clientY };
  isHorizontalSwipe.value = false;
  swipeElement.value = document.querySelector(
    ".ion-page:not(.ion-page-hidden) .swipe-current",
  ) as HTMLElement | null;
};

const handleTouchMove = (event: TouchEvent) => {
  if (!swipeStart.value || event.touches.length !== 1) return;

  const touch = event.touches[0];
  const deltaX = touch.clientX - swipeStart.value.x;
  const deltaY = touch.clientY - swipeStart.value.y;

  if (!isHorizontalSwipe.value) {
    if (Math.abs(deltaX) < 10) return;
    if (Math.abs(deltaY) >= Math.abs(deltaX)) return;
    isHorizontalSwipe.value = true;
    showPreview(deltaX < 0 ? "forward" : "back");
  }

  event.preventDefault();

  const canNavigate = deltaX < 0 ? canGoNext.value : canGoPrev.value;
  const resistance = canNavigate ? 1 : 0.28;
  const limitedDelta = deltaX * resistance;
  const width = swipeElement.value?.clientWidth || window.innerWidth;

  if (swipeElement.value) {
    swipeElement.value.style.transition = "none";
    swipeElement.value.style.transform = `translate3d(${limitedDelta}px, 0, 0)`;
  }

  if (previewMode.value) {
    nextTick(() => {
      if (!previewElement.value) {
        previewElement.value = document.querySelector(
          ".ion-page:not(.ion-page-hidden) .swipe-preview",
        ) as HTMLElement | null;
      }
      if (!previewElement.value) return;

      previewElement.value.style.transition = "none";
      const previewOffset =
        previewSide.value === "next"
          ? width + limitedDelta
          : -width + limitedDelta;
      previewElement.value.style.transform = `translate3d(${previewOffset}px, 0, 0)`;
    });
  }
};

const handleTouchEnd = (event: TouchEvent) => {
  if (!swipeStart.value || event.changedTouches.length !== 1) {
    swipeStart.value = null;
    isHorizontalSwipe.value = false;
    resetSwipeVisual();
    return;
  }

  const touch = event.changedTouches[0];
  const deltaX = touch.clientX - swipeStart.value.x;
  const deltaY = touch.clientY - swipeStart.value.y;
  swipeStart.value = null;

  if (
    !isHorizontalSwipe.value ||
    Math.abs(deltaX) < SWIPE_THRESHOLD ||
    Math.abs(deltaX) <= Math.abs(deltaY)
  ) {
    isHorizontalSwipe.value = false;
    resetSwipeVisual();
    return;
  }

  const direction: "forward" | "back" = deltaX < 0 ? "forward" : "back";
  const canNavigate = direction === "forward" ? canGoNext.value : canGoPrev.value;
  if (!canNavigate) {
    isHorizontalSwipe.value = false;
    resetSwipeVisual();
    return;
  }

  isHorizontalSwipe.value = false;
  resetSwipeVisual(direction);

  window.setTimeout(() => {
    if (direction === "forward") navigateNext();
    else navigatePrev();
  }, 120);
};

const handleTouchCancel = () => {
  swipeStart.value = null;
  isHorizontalSwipe.value = false;
  resetSwipeVisual();
};

const preloadedContent = new Map<string, any>();

function getItemPath(item: any): string {
  if (!item) return "";
  if (item.type === "song") {
    return `/books/${bookId.value}/song/${item.id}`;
  }
  if (item.type === "section") {
    return `/books/${bookId.value}/section/${encodeURIComponent(item.id)}`;
  }
  if (item.type === "subsection") {
    return `/books/${bookId.value}/section/${encodeURIComponent(item.section)}/subsection/${item.id}`;
  }
  return "";
}

function preloadAdjacentContent() {
  const neighbors = [
    currentTitleIndex.value > 0
      ? currentTitlesList.value[currentTitleIndex.value - 1]
      : null,
    currentTitleIndex.value >= 0 &&
    currentTitleIndex.value < currentTitlesList.value.length - 1
      ? currentTitlesList.value[currentTitleIndex.value + 1]
      : null,
  ];

  neighbors.forEach((item) => {
    const path = getItemPath(item);
    if (!path || preloadedContent.has(path)) return;

    const data = bookStore.getBookData(book.value);
    let content: any = null;

    if (item?.type === "song") {
      content = data.find((entry: any) => entry.id === item.id) ?? null;
    } else if (item?.type === "section") {
      content =
        data.find((entry: any) => entry.section === item.id) ?? null;
    } else if (item?.type === "subsection") {
      const section = data.find(
        (entry: any) => entry.section === item.section,
      );
      content = section?.subsections?.[item.id] ?? null;
    }

    if (content) preloadedContent.set(path, content);
  });
}

const recordCurrentContentVisit = async () => {
  const currentBook = book.value;
  if (!currentBook) return;

  if (displayMode.value === "song") {
    const titleText = title.value || `${itemObj.value?.id ?? ""}`;
    await bookStore.recordContentVisit(currentBook, {
      id: itemObj.value?.id,
      type: isSalamo.value ? "psalm" : "song",
      title: titleText,
    });
    return;
  }

  if (displayMode.value === "psalm") {
    await bookStore.recordContentVisit(currentBook, {
      id: itemObj.value?.id,
      type: "psalm",
      title: title.value || `Salamo - ${itemObj.value?.id ?? ""}`,
    });
    return;
  }

  if (displayMode.value === "liturgia") {
    const sectionName = routeSectionName.value || title.value;
    const subsectionIndex = routeSubIndex.value ?? undefined;

    await bookStore.recordContentVisit(currentBook, {
      id: subsectionIndex !== undefined ? subsectionIndex : undefined,
      type: subsectionIndex !== undefined ? "subsection" : "section",
      title:
        subsectionIndex !== undefined
          ? subTitleText.value || title.value
          : title.value,
      sectionName,
      subsectionIndex,
    });
  }
};

const loadContent = async () => {
  const currentBook = book.value;
  if (!currentBook) return;

  const data = bookStore.getBookData(currentBook);
  if (!Array.isArray(data) || data.length === 0) return;

  // Reset per-load state first, so stale values do not linger.
  clearPreview();
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
      preloadAdjacentContent();
    }
    await recordCurrentContentVisit();
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
        preloadAdjacentContent();
      }
      await recordCurrentContentVisit();
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
      preloadAdjacentContent();
    }

    await recordCurrentContentVisit();
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

watch([routeSongId, routeSectionName, routeSubIndex, bookId], async () => {
  isScrolling.value = false;
  await loadContent();
});

onMounted(async () => {
  await bookStore.loadData();
  await loadContent();
  await recordCurrentContentVisit();
});

onUnmounted(() => {
  isScrolling.value = false;
});

const isSongMultiColumn = ref(false);

const onSongMultiColumnChange = (value: boolean) => {
  isSongMultiColumn.value = value;

  if (value && settings.lyricsZZStyle) {
    settings.lyricsZZStyle = false;
  }
};

const toggleZigzag = () => {
  if (isSongMultiColumn.value) return;
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
:deep(ion-content) {
  touch-action: pan-y;
}

.swipe-stage {
  position: relative;
  min-height: 100%;
  overflow: hidden;
}

.swipe-current {
  position: relative;
  min-height: 100%;
  will-change: transform;
}

.swipe-preview {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 2;
  width: 100%;
  min-height: 100%;
  background: var(--ion-background-color, #fff);
  will-change: transform;
  overflow-y: auto;
}

.favorite-header-btn {
  --color: var(--ion-color-light);
  --padding-start: 4px;
  --padding-end: 4px;
}

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
