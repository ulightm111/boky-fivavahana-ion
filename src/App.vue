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
            <ion-icon :icon="getBookSvg(book.name)" slot="start" />
            <ion-label>{{ book.name }}</ion-label>
          </ion-item>
          <ion-item button @click="settings">
            <ion-icon :icon="settingsIcon" slot="start" />
            <ion-label>Fikirakirana</ion-label>
          </ion-item>
          <ion-item button @click="about">
            <ion-icon :icon="informationCircle" slot="start" />
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
  IonIcon,
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
import { informationCircle, settings as settingsIcon } from "ionicons/icons";

const SVGS = {
  LITURGY:
    'data:image/svg+xml;utf8,<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>',
  MUSIC:
    'data:image/svg+xml;utf8,<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>',
  PSALMS:
    'data:image/svg+xml;utf8,<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path><path d="M9 14V7l8-1v7"></path><circle cx="7.5" cy="14" r="1.5"></circle><circle cx="15.5" cy="13" r="1.5"></circle></svg>',
  CROSS:
    'data:image/svg+xml;utf8,<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="2" x2="12" y2="22"></line><line x1="7" y1="9" x2="17" y2="9"></line></svg>',
  DEFAULT:
    'data:image/svg+xml;utf8,<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>',
};
const getBookSvg = (name: string) => {
  const re = /fihirana|hanandratra/i;
  if (re.test(name)) return SVGS.MUSIC;
  if (name.includes("Salamo")) return SVGS.PSALMS;
  if (name.includes("Hazo Fijaliana")) return SVGS.CROSS;
  if (name.includes("Litorjia")) return SVGS.LITURGY;
  return SVGS.DEFAULT;
};

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
  --background: var(--ion-background-color);
}
ion-icon {
  color: var(--ion-text-color);
}
</style>
