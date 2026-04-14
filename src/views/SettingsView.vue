<template>
  <ion-page>
    <app-header title="Fikirakirana" />
    <ion-content class="ion-padding-bottom">
      <ion-list :inset="true">
        <ion-list-header>
          <ion-label>Endrika</ion-label>
        </ion-list-header>

        <ion-item>
          <ion-icon
            :icon="contrast"
            slot="start"
            color="secondary"
            aria-hidden="true"
          />
          <ion-label>Loko</ion-label>
          <ion-segment
            id="theme-segment"
            v-model="settings.theme"
            color="secondary"
          >
            <ion-segment-button
              value="system"
              @click="showThemeToast('Miova manaraka ny finday')"
            >
              <ion-icon :icon="phonePortraitOutline"></ion-icon>
            </ion-segment-button>
            <ion-segment-button value="light" @click="showThemeToast('Mazava')">
              <ion-icon :icon="sunnyOutline"></ion-icon>
            </ion-segment-button>
            <ion-segment-button value="dark" @click="showThemeToast('Matroka')">
              <ion-icon :icon="moonOutline"></ion-icon>
            </ion-segment-button>
          </ion-segment>
        </ion-item>

        <ion-item>
          <ion-icon
            :icon="textOutline"
            slot="start"
            color="secondary"
            aria-hidden="true"
          />
          <div class="range-container">
            <div class="range-header">
              <ion-label>Haben'ny lahatsoratra</ion-label>
              <ion-note color="secondary">{{ settings.fontSize }}%</ion-note>
            </div>
            <ion-range
              v-model="settings.fontSize"
              :min="70"
              :max="150"
              :step="10"
              :pin="true"
              class="custom-range"
              color="secondary"
            >
              <ion-icon
                slot="start"
                :icon="text"
                size="small"
                aria-hidden="true"
              />
              <ion-icon
                slot="end"
                :icon="text"
                size="large"
                aria-hidden="true"
              />
            </ion-range>
          </div>
        </ion-item>

        <ion-item>
          <ion-icon
            :icon="searchOutline"
            slot="start"
            color="secondary"
            aria-hidden="true"
          />
          <ion-label>Aseho ny bokotra Zoom</ion-label>
          <ion-toggle
            v-model="settings.showZoomBtn"
            color="secondary"
            slot="end"
          ></ion-toggle>
        </ion-item>

        <ion-item>
          <ion-icon
            :icon="swapHorizontalOutline"
            slot="start"
            color="secondary"
            aria-hidden="true"
          />
          <ion-label>Tononkira zigzag</ion-label>
          <ion-toggle
            v-model="settings.lyricsZZStyle"
            color="secondary"
            slot="end"
          >
          </ion-toggle>
        </ion-item>

        <ion-item>
          <ion-icon
            :icon="reorderThreeOutline"
            slot="start"
            color="secondary"
            aria-hidden="true"
          />
          <ion-label>Aseho ny bokotra zigzag</ion-label>
          <ion-toggle
            v-model="settings.showZigzagBtn"
            color="secondary"
            slot="end"
          >
          </ion-toggle>
        </ion-item>
      </ion-list>

      <ion-list :inset="true">
        <ion-list-header>
          <ion-label>Fampiasàna</ion-label>
        </ion-list-header>

        <ion-item>
          <ion-icon
            :icon="bulbOutline"
            slot="start"
            color="warning"
            aria-hidden="true"
          />
          <ion-label>Tazomina hirehitra foana ny efijery (ecran)</ion-label>
          <ion-toggle
            v-model="settings.keepScreenOn"
            color="secondary"
            slot="end"
          >
          </ion-toggle>
        </ion-item>

        <ion-item>
          <ion-icon
            :icon="speedometerOutline"
            slot="start"
            color="tertiary"
            aria-hidden="true"
          />
          <div class="range-container">
            <div class="range-header">
              <ion-label>Hafainganam-pandehan'ny autoscroll</ion-label>
              <ion-note color="tertiary">x{{ settings.scrollSpeed }}</ion-note>
            </div>
            <ion-range
              v-model="settings.scrollSpeed"
              :min="5"
              :max="30"
              :pin="true"
              color="secondary"
              class="custom-range"
            >
              <ion-icon
                slot="start"
                :icon="walk"
                color="medium"
                aria-hidden="true"
              />
              <ion-icon
                slot="end"
                :icon="rocket"
                color="secondary"
                aria-hidden="true"
              />
            </ion-range>
          </div>
        </ion-item>
      </ion-list>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonToggle,
  IonSegment,
  IonSegmentButton,
  IonListHeader,
  IonRange,
  IonIcon,
  IonNote,
  toastController,
} from "@ionic/vue";
import {
  text,
  walk,
  rocket,
  contrast,
  textOutline,
  searchOutline,
  swapHorizontalOutline,
  reorderThreeOutline,
  bulbOutline,
  speedometerOutline,
  phonePortraitOutline,
  sunnyOutline,
  moonOutline,
} from "ionicons/icons";
import { useSettingsStore } from "@/stores/settingsStore";
import AppHeader from "@/components/AppHeader.vue";

const settings = useSettingsStore();

const showThemeToast = async (message: string) => {
  const toast = await toastController.create({
    message,
    duration: 1000,
    position: "bottom",
    positionAnchor: "theme-segment",
    color: "medium",
  });
  await toast.present();
};
</script>

<style scoped>
ion-segment-button {
  min-width: 40px;
  color: var(--ion-color-medium);
}
.range-container {
  width: 100%;
  padding-top: 12px;
  padding-bottom: 8px;
}

.range-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.custom-range {
  padding: 0;
}
</style>
