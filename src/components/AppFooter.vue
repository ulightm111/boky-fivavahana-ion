<template>
  <ion-footer>
    <ion-toolbar>
      <ion-buttons>
        <ion-button @click="showMenuModal = true" fill="clear">
          <ion-icon :icon="menu"></ion-icon>
          <ion-label>Menu</ion-label>
        </ion-button>
        <ion-button @click="$emit('prev')" :disabled="!canGoPrev" fill="clear">
          <ion-icon :icon="chevronBack"></ion-icon>
          <ion-label>Prev</ion-label>
        </ion-button>
        <ion-button @click="$emit('next')" :disabled="!canGoNext" fill="clear">
          <ion-icon :icon="chevronForward"></ion-icon>
          <ion-label>Next</ion-label>
        </ion-button>
        <ion-button @click="gotoSearch" fill="clear">
          <ion-icon :icon="search"></ion-icon>
          <ion-label>Search</ion-label>
        </ion-button>
      </ion-buttons>
    </ion-toolbar>

    <ion-modal :is-open="showMenuModal" @didDismiss="showMenuModal = false">
      <ion-header>
        <ion-toolbar>
          <ion-title>Menu</ion-title>
          <ion-buttons slot="end">
            <ion-button @click="showMenuModal = false">Close</ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content>
        <ion-list>
          <ion-item
            v-for="book in books"
            :key="book.id"
            button
            @click="navigateToBookFromMenu(book)"
            lines="none"
          >
            <ion-label>{{ book.name }}</ion-label>
          </ion-item>
        </ion-list>
      </ion-content>
    </ion-modal>
  </ion-footer>
</template>

<script setup lang="ts">
import {
  IonFooter, IonToolbar, IonButtons, IonButton, IonIcon, IonLabel,
  IonModal, IonHeader, IonTitle, IonContent, IonList, IonItem
} from '@ionic/vue';
import { menu, chevronBack, chevronForward, search } from 'ionicons/icons';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useBookStore } from '@/stores/bookStore';

defineProps({
  canGoPrev: {
    type: Boolean,
    default: false
  },
  canGoNext: {
    type: Boolean,
    default: false
  }
});

defineEmits(['prev', 'next']);

const router = useRouter();
const bookStore = useBookStore();
const { books } = storeToRefs(bookStore);
const showMenuModal = ref(false);

const gotoSearch = (event?: Event) => {
  showMenuModal.value = false;
  
  let searchbar = null;
  if (event && event.target) {
    const page = (event.target as HTMLElement).closest('.ion-page');
    if (page) {
      searchbar = page.querySelector('ion-searchbar');
    }
  }
  
  if (!searchbar) {
    // Fallback: try to find a searchbar on the active page
    searchbar = document.querySelector('.ion-page:not(.ion-page-hidden) ion-searchbar') || document.querySelector('ion-searchbar');
  }

  if (searchbar) {
    (searchbar as any).setFocus();
  } else {
    router.push('/search');
  }
};

const navigateToBookFromMenu = (book: any) => {
  showMenuModal.value = false;
  router.push(`/books/${book.id}`);
};
</script>
