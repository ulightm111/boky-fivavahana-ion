<template>
  <ion-app>
    <ion-router-outlet id="main-content" :animated="false" />
  </ion-app>
</template>

<script setup lang="ts">
import {
  IonApp,
  IonRouterOutlet,
  useBackButton,
  toastController,
} from "@ionic/vue";
import { onUnmounted, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useSettingsStore } from "./stores/settingsStore";
import { App } from "@capacitor/app";

const route = useRoute();
const settingsStore = useSettingsStore();

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
  await settingsStore.loadSettings();
});
</script>
