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
          <ion-item button @click="settings">
            <ion-label>Fikirakirana</ion-label>
          </ion-item>
          <ion-item button @click="about">
            <ion-label>Mombamomba</ion-label>
          </ion-item>
        </ion-list>
      </ion-content>
    </ion-menu>
    <!-- MAIN CONTENT -->
    <ion-router-outlet id="main-content" :animated="false" />
  </ion-app>
</template>

<script setup lang="ts">
import {
  IonApp,
  IonRouterOutlet,
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
import { onUnmounted, onMounted } from "vue";
import { useRoute } from "vue-router";
import { storeToRefs } from "pinia";
import { useBookStore } from "@/stores/bookStore";
import { App } from "@capacitor/app";
import { StatusBar, Style } from "@capacitor/status-bar";
import { Device } from "@capacitor/device";

const route = useRoute();
const bookStore = useBookStore();
const { books } = storeToRefs(bookStore);
const ionRouter = useIonRouter();

const navigateToBook = async (book: any) => {
  await menuController.close("main-menu");
  ionRouter.push(`/books/${book.id}`);
};

const settings = async () => {
  await menuController.close("main-menu");
  ionRouter.push("/settings");
};

const about = async () => {
  await menuController.close("main-menu");
  ionRouter.push("/about");
};

// Android Back Button Handling
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
        positionAnchor: "footer",
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

// Clean up timer on unmount
onUnmounted(() => {
  if (backTimer) clearTimeout(backTimer);
});

onMounted(async () => {
  const info = await Device.getInfo();
  const androidVersion = parseInt(info.osVersion);
  if (androidVersion < 15) {
    setTimeout(async () => {
      await StatusBar.setBackgroundColor({ color: "#002f98" });
      await StatusBar.setStyle({ style: Style.Dark });
    }, 300);
  }
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
  background: transparent;
  border-radius: 50%;
  padding: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  pointer-events: none;
}
</style>
