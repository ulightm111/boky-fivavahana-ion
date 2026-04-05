<template>
  <div class="lyrics-content">
    <div v-if="song.intro" class="note" id="intro">{{ song.intro }}</div>
    <hr v-if="song.intro">
    
    <div v-if="song.headnote" class="note" id="headnote">{{ song.headnote }}</div>

    <template v-if="song.verses && song.verses.length > 0">
      <template v-for="(v, index) in song.verses" :key="index">
        <div class="verse chorus" v-if="v.verse_number === 2 && song.chorus && song.chorus.length > 0">
          <div class="chorus-title">Fiverenana:</div>
          <p>
            <span v-for="(line, lIndex) in song.chorus" :key="lIndex">
              {{ line }}<br v-if="lIndex < song.chorus.length - 1" />
            </span>
          </p>
        </div>

        <div class="verse">
          <span v-if="isHira"><strong>{{ v.verse_number }}.</strong></span>
          <p>
            <span v-for="(line, lIndex) in (Array.isArray(v.lines) ? v.lines : [v.lines])" :key="lIndex">
              {{ line }}<br v-if="lIndex < (Array.isArray(v.lines) ? v.lines : [v.lines]).length - 1" />
            </span>
          </p>
        </div>
      </template>
    </template>

    <p v-if="song.has_amen" style="text-align:center"><em>Amena</em></p>
    
    <template v-if="song.footnote">
      <hr>
      <div class="note" id="footnote">{{ song.footnote }}</div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { PropType } from 'vue';
import { Song } from '@/stores/bookStore';

defineProps({
  song: {
    type: Object as PropType<Song>,
    required: true
  },
  isHira: {
    type: Boolean,
    default: true
  }
});
</script>

<style scoped>
.lyrics-content {
  font-family: "Times New Roman", Times, serif;
  background: white;
  padding: 16px;
  margin-bottom: 10px;
  border-radius: 10px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
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
  background: #f5f5f5;
  padding: 1rem;
  border-left: 4px solid #007bff;
  margin: 1rem 0;
}

.lyrics-content :deep(.chorus-title) {
  font-weight: bold;
  margin-bottom: 0.5rem;
  font-style: italic;
}

.lyrics-content :deep(.note) {
  font-style: italic;
  color: #555;
  margin: 1rem 0;
  padding: 0.5rem;
  border-left: 3px solid #ddd;
  padding-left: 1rem;
}

.lyrics-content :deep(hr) {
  border: none;
  border-top: 1px solid #ccc;
  margin: 1.5rem 0;
}
</style>
