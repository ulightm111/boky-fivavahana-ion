<template>
  <ion-page>
    <app-header
      :title="title"
      :subtitle="displayMode === 'psalm' ? '' : subtitle"
    />

    <ion-content ref="contentRef" :fullscreen="true" :style="contentStyle">
      <!-- Render depending on what data we have -->
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
        :is-alternated="isAlternated"
      />

      <ion-fab
        v-if="displayMode != 'subsections'"
        vertical="bottom"
        horizontal="end"
        slot="fixed"
        class="zoom-fab"
      >
        <ion-fab-button
          v-if="displayMode === 'song'"
          @click="toggleIndent"
          :class="isAlternated ? 'translucent-btn disabled' : 'translucent-btn'"
          size="small"
        >
          <ion-icon :icon="reorderThreeOutline"></ion-icon>
        </ion-fab-button>
        <ion-fab-button @click="zoomIn" class="translucent-btn" size="small">
          <ion-icon :icon="add"></ion-icon>
        </ion-fab-button>
        <ion-fab-button @click="zoomOut" class="translucent-btn" size="small">
          <ion-icon :icon="remove"></ion-icon>
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
import { add, ellipse, remove, reorderThreeOutline } from "ionicons/icons";
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { useRoute } from "vue-router";
import { useBookStore } from "@/stores/bookStore";
import AppHeader from "@/components/AppHeader.vue";
import AppFooter from "@/components/AppFooter.vue";
import SongContent from "@/components/lyrics/SongContent.vue";
import PsalmContent from "@/components/lyrics/PsalmContent.vue";
import LitContent from "@/components/lyrics/LitContent.vue";

const route = useRoute();
const router = useIonRouter();
const bookStore = useBookStore();

const bookId = computed(() => Number(route.params.bookId));
const book = computed(() => bookStore.books.find((b) => b.id === bookId.value));
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

const isAlternated = ref(true);
const currentFontSize = ref(100);

const contentStyle = computed(() => ({
  "--lyrics-font-size": `${currentFontSize.value}%`,
}));

const displayMode = ref("");
const itemObj = ref<any>(null);
const htmlContent = ref<string>("");
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

const loadContent = () => {
  if (!book.value) return;

  const data = bookStore.getBookData(book.value);
  if (!data || data.length === 0) return;

  if (routeSongId.value !== null) {
    const songId = routeSongId.value;
    const songIndex = data.findIndex((s: any) => s.id === songId);
    if (songIndex !== -1) {
      itemObj.value = data[songIndex];
      displayMode.value = isSalamo.value ? "psalm" : "song";
      title.value = isSalamo.value
        ? `Salamo - ${itemObj.value.id}`
        : `${itemObj.value.id} - ${itemObj.value.title}`;
      subtitle.value = book.value.name;

      currentTitlesList.value = data.map((s: any) => ({
        id: s.id,
        type: "song",
      }));
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
        displayMode.value = "liturgia";
        const sub = section.subsections[routeSubIndex.value];
        subTitleText.value = sub.subsection;
        htmlContent.value = sub.content;
        currentTitlesList.value = section.subsections.map(
          (_: any, idx: number) => ({
            id: idx,
            type: "subsection",
            section: sName,
          }),
        );
        currentTitleIndex.value = routeSubIndex.value;
      } else {
        if (section.subsections && section.subsections.length > 0) {
          displayMode.value = "subsections";
          currentTitleIndex.value = -1;
        } else {
          displayMode.value = "liturgia";
          htmlContent.value = section.content || "";
          currentTitlesList.value = data.map((s: any) => ({
            id: s.section,
            type: "section",
          }));
          currentTitleIndex.value = sectionIndex;
        }
      }
    }
  }
};

const contentRef = ref<any>(null);
const isScrolling = ref(false);

const toggleAutoscroll = async () => {
  if (isScrolling.value) {
    isScrolling.value = false;
  } else {
    const el = await contentRef.value.$el.getScrollElement();
    isScrolling.value = true;

    const stopOnInteraction = () => {
      if (isScrolling.value) {
        isScrolling.value = false;
        el.removeEventListener("pointerdown", stopOnInteraction);
      }
    };
    el.addEventListener("pointerdown", stopOnInteraction);

    const speed = 10; // Azonao ovana ity: 20 = miadana, 50 = haingana
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
  }
};

// Atsahatra ny scroll raha miala amin'ny pejy na miova hira
watch([routeSongId, routeSectionName, routeSubIndex], () => {
  isScrolling.value = false;
  loadContent();
});

onUnmounted(() => {
  isScrolling.value = false;
});

onMounted(async () => {
  if (bookStore.books.length === 0) await bookStore.loadData();
  const savedFontSize = localStorage.getItem("fontSizePercentage");
  if (savedFontSize) {
    currentFontSize.value = parseInt(savedFontSize);
  }
  const savedIndent = localStorage.getItem("isAlternatedLayout");
  if (savedIndent !== null) {
    isAlternated.value = savedIndent === "true";
  }
  loadContent();
});

const toggleIndent = () => {
  isAlternated.value = !isAlternated.value;
  localStorage.setItem("isAlternatedLayout", isAlternated.value.toString());
};

watch([routeSongId, routeSectionName, routeSubIndex], () => {
  loadContent();
});

const navigateToSubsection = (index: number) => {
  router.push(
    `/books/${bookId.value}/section/${encodeURIComponent(
      routeSectionName.value as string,
    )}/subsection/${index}`,
  );
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
  if (itemObjRef.type === "song") {
    router.push(`/books/${bookId.value}/song/${itemObjRef.id}`);
  } else if (itemObjRef.type === "section") {
    router.push(
      `/books/${bookId.value}/section/${encodeURIComponent(itemObjRef.id)}`,
    );
  } else if (itemObjRef.type === "subsection") {
    router.push(
      `/books/${bookId.value}/section/${encodeURIComponent(
        itemObjRef.section,
      )}/subsection/${itemObjRef.id}`,
    );
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
  localStorage.setItem("fontSizePercentage", currentFontSize.value.toString());
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
.disabled {
  --background: rgba(var(--ion-color-medium-rgb), 0.4);
  --background-activated: rgba(var(--ion-color-medium-rgb), 0.6);
  --background-focused: rgba(var(--ion-color-medium-rgb), 0.6);
  --color: var(--ion-color-medium-contrast);
}
</style>
