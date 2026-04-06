<template>
  <div class="lyrics-content">
    <template v-if="psalm.verses && psalm.verses.length > 0">
      <template v-for="(v, index) in psalm.verses" :key="index">
        <p
          v-for="(line, lIndex) in Array.isArray(v.lines) ? v.lines : [v.lines]"
          :key="lIndex"
          class="line"
        >
          <strong>{{ v.verse_number }}.</strong> {{ line }}
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
