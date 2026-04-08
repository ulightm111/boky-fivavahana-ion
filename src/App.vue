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
            <ion-label>Mombamomba</ion-label>
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
  useBackButton,
  useIonRouter,
  toastController,
} from "@ionic/vue";
import { ref, watch, onUnmounted } from "vue";
import { useRoute } from "vue-router";
import { storeToRefs } from "pinia";
import { useBookStore } from "@/stores/bookStore";
import { App } from "@capacitor/app";

const route = useRoute();
const bookStore = useBookStore();
const { books } = storeToRefs(bookStore);
const ionRouter = useIonRouter();

const navigateToBook = async (book: any) => {
  await menuController.close("main-menu");
  ionRouter.push(`/books/${book.id}`);
};

const about = async () => {
  await menuController.close("main-menu");
  ionRouter.push("/about");
};

// Loading spinner logic
const isLoading = ref(false);
let loadingTimeout: ReturnType<typeof setTimeout> | null = null;

watch(
  () => route.fullPath,
  (newPath, oldPath) => {
    if (newPath !== oldPath) {
      if (loadingTimeout) clearTimeout(loadingTimeout);
      isLoading.value = true;
      loadingTimeout = setTimeout(() => {
        isLoading.value = false;
        loadingTimeout = null;
      }, 100);
    }
  },
);

onUnmounted(() => {
  if (loadingTimeout) clearTimeout(loadingTimeout);
});

// ---------- Android Back Button Handling (with double‑click exit) ----------
let backPressedOnce = false;
let backTimer: ReturnType<typeof setTimeout> | null = null;

useBackButton(-1, async () => {
  if (route.path === "/books") {
    if (!backPressedOnce) {
      backPressedOnce = true;
      const toast = await toastController.create({
        message: "Tsindrio ihany raha iala",
        duration: 2000,
        position: "bottom",
      });
      await toast.present();
      backTimer = setTimeout(() => {
        backPressedOnce = false;
      }, 2000);
    } else {
      // Second press – exit the app
      if (backTimer) clearTimeout(backTimer);
      await App.exitApp();
    }
  }
});

// Clean up timer on unmount (optional)
onUnmounted(() => {
  if (backTimer) clearTimeout(backTimer);
});
</script>

<style scoped>
ion-content {
  --background: white;
}

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
