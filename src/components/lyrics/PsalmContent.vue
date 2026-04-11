<template>
  <div class="lyrics-content">
    <template v-if="psalm.verses && psalm.verses.length > 0">
      <template v-for="(v, index) in psalm.verses" :key="index">
        <p
          v-for="(line, lIndex) in Array.isArray(v.lines) ? v.lines : [v.lines]"
          :key="lIndex"
          class="line"
        >
          <span class="verse-id">{{ v.verse_number }}.</span>{{ line }}
        </p>
      </template>
    </template>
  </div>
</template>

<script setup lang="ts">
import { PropType } from "vue";
import { Psalm } from "@/stores/bookStore";

defineProps({
  psalm: {
    type: Object as PropType<Psalm>,
    required: true,
  },
});
</script>
<style scoped>
.verse-id {
  display: inline-block;
  width: 2em;
  font-weight: 600;
  text-align: right;
  margin-right: 0.5em;
}
</style>
