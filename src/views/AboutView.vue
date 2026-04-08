<template>
  <ion-page>
    <app-header title="Mombamomba" :show-searchbar="false" />
    <ion-content :fullscreen="true">
      <ion-card>
        <ion-card-header>
          <ion-card-title>Ny Boky Fivavahana Anglikana</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <p>
            Natao hampiasaina amin'ny litorjia sy hira anglikana raha sendra tsy
            eo ny boky.
          </p>
          <p>
            Raha misy fanamarihan na olana: tsiorymanana7@gmail.com,
            +261437048504, https://www.facebook.com/tsiory.rjn.
          </p>

          <div class="version-info">
            <p>
              Version: <strong>{{ currentVersion }}</strong>
            </p>

            <ion-button
              expand="block"
              fill="outline"
              @click="checkForUpdate"
              :disabled="isChecking"
            >
              <ion-spinner
                v-if="isChecking"
                name="crescent"
                slot="start"
              ></ion-spinner>
              Hijerena version farany
            </ion-button>

            <ion-button
              v-if="updateUrl"
              expand="block"
              color="success"
              class="ion-margin-top"
              @click="openDownloadPage"
            >
              <ion-icon :icon="downloadOutline" slot="start"></ion-icon>
              Haka ny version vaovao
            </ion-button>
          </div>
        </ion-card-content>
      </ion-card>
    </ion-content>
    <app-footer />
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonButton,
  IonSpinner,
  IonIcon,
  toastController,
} from "@ionic/vue";
import { ref, onMounted } from "vue";
import { downloadOutline } from "ionicons/icons";
import { Browser } from "@capacitor/browser";
import { App } from "@capacitor/app";
import AppHeader from "@/components/AppHeader.vue";
import AppFooter from "@/components/AppFooter.vue";

const currentVersion = ref("...");
const isChecking = ref(false);
const updateUrl = ref<string | null>(null);

const GITHUB_REPO = "ulightm111/boky-fivavahana-ion";

// Get native info on mount
onMounted(async () => {
  const info = await App.getInfo();
  currentVersion.value = info.version;
});

const checkForUpdate = async () => {
  isChecking.value = true;
  updateUrl.value = null;

  try {
    const response = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO}/releases/latest`,
    );
    if (!response.ok) throw new Error();

    const data = await response.json();
    const latestVersion = data.tag_name;

    const latest = latestVersion.replace(/[^0-9.]/g, "");
    const current = currentVersion.value.replace(/[^0-9.]/g, "");

    if (latest !== current) {
      updateUrl.value = data.html_url;
      showToast(`Misy version vaovao: ${latestVersion}`, "success");
    } else {
      showToast("Efa ny version farany no ampiasainao.", "primary");
    }
  } catch (error) {
    showToast("Misy olana, hamarino ny internet.", "danger");
  } finally {
    isChecking.value = false;
  }
};

const openDownloadPage = async () => {
  if (updateUrl.value) {
    await Browser.open({ url: updateUrl.value });
  }
};

const showToast = async (message: string, color = "dark") => {
  const toast = await toastController.create({
    message,
    duration: 3000,
    color,
    position: "bottom",
  });
  await toast.present();
};
</script>
