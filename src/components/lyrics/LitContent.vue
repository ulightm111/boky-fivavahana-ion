<template>
  <div class="lyrics-content">
    <template v-if="isLitP">
      <p v-for="item in sortedItems" :key="item.id">
        <strong>{{ item.id }}</strong>
        <span v-html="formatContent(item.content)"></span>
      </p>
    </template>
    <template v-else-if="isLHF">
      <h2 class="title">{{ title }}</h2>
      <div v-html="htmlContent"></div>
    </template>
    <template v-else>
      <div v-html="htmlContent"></div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, PropType } from "vue";

const props = defineProps({
  isLitP: Boolean,
  isLHF: Boolean,
  title: String,
  items: Array as PropType<Array<{ id: string; content: string }>>,
  htmlContent: String,
});

const sortedItems = computed(() => {
  if (!props.items) return [];
  return [...props.items].sort((a: any, b: any) => Number(a.id) - Number(b.id));
});

const formatContent = (content: string) => {
  if (!content) return "";
  return content.replace(
    /<br\s*\/?>/g,
    '<br><span style="margin-left:2rem; display:inline-block;"></span>',
  );
};
</script>
