<template>
  <ion-app>
    <!-- LEFT SIDE MENU -->
    <ion-menu
      menu-id="main-menu"
      side="end"
      content-id="main-content"
      type="overlay"
    >
      <ion-header>
        <ion-toolbar>
          <ion-title>Menio</ion-title>
        </ion-toolbar>
      </ion-header>

      <ion-content>
        <ion-list>
          <ion-item
            v-for="book in books"
            :key="book.id"
            button
            @click="navigateToBook(book)"
          >
            <ion-label>{{ book.name }}</ion-label>
          </ion-item>
          <ion-item button @click="about">
            <ion-label>Mombamonba</ion-label>
          </ion-item>
        </ion-list>
      </ion-content>
    </ion-menu>
    <!-- MAIN CONTENT -->
    <ion-router-outlet id="main-content" :animated="false" />
    <div class="global-spinner-container" v-if="isLoading">
      <ion-spinner name="circular" color="primary"></ion-spinner>
    </div>
  </ion-app>
</template>

<script setup lang="ts">
import {
  IonApp,
  IonRouterOutlet,
  IonSpinner,
  IonMenu,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  menuController,
} from "@ionic/vue";
import { ref } from "vue";
import { useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import { useBookStore } from "@/stores/bookStore";

const router = useRouter();
const bookStore = useBookStore();
const { books } = storeToRefs(bookStore);

const navigateToBook = async (book: any) => {
  await menuController.close("main-menu");
  router.push(`/books/${book.id}`);
};

const about = async () => {
  await menuController.close("main-menu");
  router.push("/about");
};

const isLoading = ref(false);

router.beforeEach((to, from, next) => {
  if (to.path !== from.path) {
    isLoading.value = true;
  }
  next();
});

router.afterEach(() => {
  // Give a small delay to let logic and rendering finish
  setTimeout(() => {
    isLoading.value = false;
  }, 100);
});
</script>

<style scoped>
.global-spinner-container {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 100000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(var(--ion-background-color-rgb, 255, 255, 255), 0.8);
  border-radius: 50%;
  padding: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  pointer-events: none;
}
</style>
