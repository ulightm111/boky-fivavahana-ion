<template>
  <div class="lyrics-content">
    <template v-if="isLitP">
      <div
        v-for="item in sortedItems"
        :key="item.id"
        v-html="formatContent(item)"
      ></div>
    </template>
    <template v-else-if="isLHF">
      <h2 class="title">{{ title?.toUpperCase() }}</h2>
      <div v-html="htmlContent?.join('')"></div>
    </template>
    <template v-else>
      <div v-html="htmlContent?.join('')"></div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, PropType } from "vue";

const props = defineProps({
  isLitP: Boolean,
  isLHF: Boolean,
  title: String,
  items: Array as PropType<Array<{ id: number; content: string }>>,
  htmlContent: Array,
});

const sortedItems = computed(() => {
  if (!props.items) return [];
  return [...props.items].sort((a: any, b: any) => a.id - b.id);
});

const formatContent = (item: { id: number; content: string }) => {
  const { id, content } = item;
  if (!content) return "";
  return (
    `<p class="lit"><span class="item-id">${id}-</span>` +
    content
      .replace(
        /<br\s*\/?>/g,
        "<br><span style='margin-left:2em; display:inline-block;'></span>",
      )
      .slice(3)
  );
};
</script>
<style scoped>
:deep(.item-id) {
  display: inline-block;
  width: 2em;
  font-weight: bold;
  text-indent: 0;
  margin-left: -2em;
}
:deep(p:not(.text-center)) {
  text-indent: 2em;
}
</style>
