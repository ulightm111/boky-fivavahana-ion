<template>
  <ion-header :translucent="true">
    <ion-toolbar>
      <ion-buttons v-if="showBackButton" slot="start">
        <ion-back-button :default-href="backButtonDefaultHref"></ion-back-button>
      </ion-buttons>
      <ion-title>
        <slot name="title">{{ title }}</slot>
        <span v-if="subtitle" class="subtitle">- {{ subtitle }}</span>
      </ion-title>
    </ion-toolbar>
    <ion-toolbar v-if="showSearchbar">
      <form action="." @submit.prevent="onSubmit">
        <ion-searchbar
          :value="searchQuery"
          :placeholder="searchPlaceholder"
          @ionInput="onInput"
          @ionClear="onClear"
        ></ion-searchbar>
      </form>
    </ion-toolbar>
  </ion-header>
</template>

<script setup lang="ts">
import { IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton, IonSearchbar } from '@ionic/vue';

const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  subtitle: {
    type: String,
    default: ''
  },
  showBackButton: {
    type: Boolean,
    default: true
  },
  backButtonDefaultHref: {
    type: String,
    default: '/books'
  },
  showSearchbar: {
    type: Boolean,
    default: false
  },
  searchQuery: {
    type: String,
    default: ''
  },
  searchPlaceholder: {
    type: String,
    default: 'Hitady...'
  }
});

const emit = defineEmits(['update:searchQuery', 'search-input', 'search-clear', 'search-submit']);

const onInput = (event: any) => {
  emit('update:searchQuery', event.target.value);
  emit('search-input', event);
};

const onSubmit = () => {
  emit('search-submit', props.searchQuery);
};

const onClear = (event: any) => {
  emit('update:searchQuery', '');
  emit('search-clear', event);
};
</script>

<style scoped>
.subtitle {
  font-size: 0.8em;
  font-weight: normal;
  color: var(--ion-color-medium);
}
</style>
