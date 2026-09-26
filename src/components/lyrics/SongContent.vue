<template>
  <div class="lyrics-content" ref="lyricsContentRef">
    <div v-if="song.intro" class="note" id="intro">{{ song.intro }}</div>
    <hr v-if="song.intro" />

    <div v-if="song.headnote" class="note" id="headnote">
      {{ song.headnote }}
    </div>

    <template v-if="song.verses && song.verses.length > 0">
      <div
        class="verses"
        :class="{
          'zigzag-layout': isZigzag,
          'multi-column': verseColumns > 1,
        }"
        :style="{ '--verse-columns': verseColumns }"
      >
        <template v-for="(v, index) in song.verses" :key="index">
          <div
            class="verse chorus"
            v-if="v.verse_number === 2 && song.chorus && song.chorus.length > 0"
          >
            <div class="chorus-title">Fiverenana:</div>
            <p>
              <span v-for="(line, lIndex) in song.chorus" :key="lIndex">
                {{ line }}<br v-if="lIndex < song.chorus.length - 1" />
              </span>
            </p>
          </div>

          <div
            class="verse"
            :class="{
              'even-verse': v.verse_number % 2 === 0,
              chorus: !v.verse_number,
            }"
          >
            <span v-if="isHira">
              <strong v-if="v.verse_number">{{ v.verse_number }}.</strong>
              <div v-else class="chorus-title">Fiverenana:</div>
            </span>
            <p>
              <span
                v-for="(line, lIndex) in Array.isArray(v.lines)
                  ? v.lines
                  : [v.lines]"
                :key="lIndex"
              >
                {{ line
                }}<br
                  v-if="
                    (lIndex as number) <
                    (Array.isArray(v.lines) ? v.lines : [v.lines]).length - 1
                  "
                />
              </span>
            </p>
          </div>
        </template>
      </div>
    </template>

    <p v-if="song.has_amen" style="text-align: center"><em>Amena</em></p>

    <template v-if="song.footnote">
      <hr />
      <div class="note" id="footnote">{{ song.footnote }}</div>
    </template>
  </div>
</template>

<script setup lang="ts">
import {
  computed,
  onBeforeUnmount,
  onMounted,
  PropType,
  ref,
  watch,
} from "vue";
import { Song } from "@/stores/bookStore";
import { useSettingsStore } from "@/stores/settingsStore";
import { getVerseColumnCount } from "@/utils/songLayout";

const props = defineProps({
  song: {
    type: Object as PropType<Song>,
    required: true,
  },
  isHira: {
    type: Boolean,
    default: true,
  },
  isZigzag: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits<{
  "multi-column-change": [value: boolean];
}>();

const settings = useSettingsStore();
const viewportWidth = ref(
  typeof window !== "undefined" ? window.innerWidth : 0,
);
const activeFontSizePx = computed(() => (Number(settings.fontSize) / 100) * 16);
let resizeFrameId: number | null = null;

const updateViewportWidth = () => {
  if (resizeFrameId !== null) return;

  resizeFrameId = window.requestAnimationFrame(() => {
    viewportWidth.value = window.innerWidth;
    resizeFrameId = null;
  });
};

watch(
  () => settings.fontSize,
  () => {
    viewportWidth.value = window.innerWidth;
  },
  { immediate: true },
);

onMounted(() => {
  viewportWidth.value = window.innerWidth;
  window.addEventListener("resize", updateViewportWidth, { passive: true });
});

onBeforeUnmount(() => {
  if (resizeFrameId !== null) {
    cancelAnimationFrame(resizeFrameId);
  }
  window.removeEventListener("resize", updateViewportWidth);
});

const verseColumns = computed(() => {
  if (!props.song.verses || props.song.verses.length === 0) return 1;

  if (viewportWidth.value < 700) {
    return 1;
  }

  return getVerseColumnCount(props.song.verses, activeFontSizePx.value);
});

watch(
  verseColumns,
  (value) => {
    emit("multi-column-change", value > 1);
  },
  { immediate: true },
);
</script>

<style scoped>
.lyrics-content {
  text-align: left;
}

.lyrics-content :deep(.verse) {
  display: grid;
  grid-template-columns: auto 1fr;
  column-gap: 0.5em;
  align-items: start;
  padding: 0.8rem 0;
}

.lyrics-content :deep(.verse p) {
  margin: 0;
  line-height: normal;
}

.lyrics-content :deep(.verse.chorus) {
  display: block;
  padding: 1em;
  border-left: 4px solid var(--app-bg-color);
  margin: 1em 0;
  background: var(--chorus-bg-color);
}

.lyrics-content :deep(.chorus-title) {
  font-family: "Charis SIL Bold Italic", serif;
  margin-bottom: 0.5em;
  text-decoration: underline;
}

.lyrics-content :deep(.note) {
  text-align: center;
  color: var(--note-text-color);
  margin: 1em 0;
  padding: 0.5em;
}

.lyrics-content :deep(hr) {
  border: none;
  border-top: 1px solid var(--ion-color-medium);
  margin: 1em 0;
}

.verses.zigzag-layout .even-verse {
  margin-left: 3em;
}

.verses.multi-column {
  display: block;
}

@media (min-width: 700px) {
  .verses.multi-column {
    display: grid;
    grid-template-columns: repeat(var(--verse-columns), minmax(0, 1fr));
    gap: 0 1.5rem;
    align-items: start;
  }

  .verses.multi-column .verse {
    margin-left: 0;
  }

  .verses.zigzag-layout.multi-column .even-verse {
    margin-left: 0;
  }
}

.verse {
  transition: margin-left 0.3s ease;
}
</style>
