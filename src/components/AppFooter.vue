<template>
  <ion-footer :translucent="true" id="footer">
    <ion-toolbar color="primary">
      <ion-buttons>
        <ion-grid>
          <ion-row>
            <ion-col>
              <ion-button @click="handleBack" fill="clear">
                <ion-icon :icon="caretBack"></ion-icon>
              </ion-button>
            </ion-col>
            <ion-col>
              <ion-button
                @click="$emit('prev')"
                :disabled="!canGoPrev"
                fill="clear"
              >
                <ion-icon :icon="chevronBack"></ion-icon>
              </ion-button>
            </ion-col>
            <ion-col>
              <ion-button
                @click="$emit('next')"
                :disabled="!canGoNext"
                fill="clear"
              >
                <ion-icon :icon="chevronForward"></ion-icon>
              </ion-button>
            </ion-col>
            <ion-col>
              <template v-if="!showAutoscroll">
                <ion-button @click="gotoSearch" fill="clear">
                  <ion-icon :icon="search"></ion-icon>
                </ion-button>
              </template>
              <template v-else>
                <ion-button @click="$emit('autoscroll')" fill="clear">
                  <ion-icon :icon="isScrolling ? pause : play"></ion-icon>
                </ion-button>
              </template>
            </ion-col>
            <ion-col>
              <ion-button @click="openMenu" fill="clear">
                <ion-icon :icon="menu"></ion-icon>
              </ion-button>
            </ion-col>
          </ion-row>
        </ion-grid>
      </ion-buttons>
    </ion-toolbar>
  </ion-footer>
</template>

<script setup lang="ts">
import {
  IonFooter,
  IonToolbar,
  IonGrid,
  IonRow,
  IonCol,
  IonButtons,
  IonButton,
  IonIcon,
  menuController,
  useIonRouter,
  toastController,
} from "@ionic/vue";
import {
  menu,
  chevronBack,
  chevronForward,
  search,
  caretBack,
  play,
  pause,
} from "ionicons/icons";
import { useRoute } from "vue-router";
import { App } from "@capacitor/app";
import { onUnmounted } from "vue";

defineProps({
  canGoPrev: { type: Boolean, default: false },
  canGoNext: { type: Boolean, default: false },
  backButtonDefaultHref: { type: String, default: "/books" },
  showAutoscroll: { type: Boolean, default: false },
  isScrolling: { type: Boolean, default: false },
});

defineEmits(["prev", "next", "autoscroll"]);

const router = useIonRouter();
const route = useRoute();

let backPressedOnce = false;
let backTimer: ReturnType<typeof setTimeout> | null = null;

const handleBack = async () => {
  // Check if we are at the root 'books' page
  if (route.path === "/books" || route.path === "/") {
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
  } else {
    // Otherwise, perform standard back navigation
    router.back();
  }
};

onUnmounted(() => {
  if (backTimer) clearTimeout(backTimer);
});

const gotoSearch = (event?: Event) => {
  let searchbar = null;
  if (event && event.target) {
    const page = (event.target as HTMLElement).closest(".ion-page");
    if (page) searchbar = page.querySelector("ion-searchbar");
  }

  if (!searchbar) {
    // Fallback: try to find a searchbar on the active page
    searchbar =
      document.querySelector(".ion-page:not(.ion-page-hidden) ion-searchbar") ||
      document.querySelector("ion-searchbar");
  }

  if (searchbar) {
    (searchbar as any).setFocus();
  } else {
    router.push("/search");
  }
};

const openMenu = async () => {
  await menuController.open("main-menu");
};
</script>
