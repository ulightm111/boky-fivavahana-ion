<template>
  <ion-page>
    <app-header title="Fikirana" />
    <ion-content>
      <ion-list :inset="true">
        <ion-list-header><ion-label>Endrika</ion-label></ion-list-header>

        <ion-item>
          <ion-label>Loko (Theme)</ion-label>
          <ion-select v-model="settings.theme" interface="popover">
            <ion-select-option value="system"
              >Manaraka ny finday</ion-select-option
            >
            <ion-select-option value="light">Mazava</ion-select-option>
            <ion-select-option value="dark">Matroka</ion-select-option>
          </ion-select>
        </ion-item>

        <ion-item>
          <ion-label>
            <div>Haben'ny lahatsoratra</div>
            <ion-range
              v-model="settings.fontSize"
              :min="70"
              :max="150"
              :step="10"
              :pin="true"
            >
              <ion-icon slot="start" :icon="text" size="small" />
              <ion-icon slot="end" :icon="text" size="large" />
            </ion-range>
          </ion-label>
        </ion-item>
        <ion-item>
          <ion-label>Aseho ny Bokotra Zoom</ion-label>
          <ion-toggle v-model="settings.showZoomBtn" slot="end"></ion-toggle>
        </ion-item>
        <ion-item>
          <ion-label>Tononkira zigzag</ion-label>
          <ion-toggle v-model="settings.lyricsZZStyle" slot="end"></ion-toggle>
        </ion-item>
        <ion-item>
          <ion-label>Aseho ny Bokotra zigzag</ion-label>
          <ion-toggle v-model="settings.showZigzagBtn" slot="end"></ion-toggle>
        </ion-item>
      </ion-list>

      <ion-list :inset="true">
        <ion-list-header><ion-label>Fampiasana</ion-label></ion-list-header>

        <ion-item>
          <ion-label>Tazomina hirehitra foana ny efijery (ecran)</ion-label>
          <ion-toggle v-model="settings.keepScreenOn" slot="end"></ion-toggle>
        </ion-item>

        <ion-item>
          <ion-label>
            <div>Hafainganam-pandehan'ny 'autoscroll'</div>
            <ion-range
              v-model="settings.scrollSpeed"
              :min="5"
              :max="30"
              :pin="true"
            >
              <ion-icon slot="start" :icon="walk" />
              <ion-icon slot="end" :icon="rocket" />
            </ion-range>
          </ion-label>
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
  IonSelect,
  IonSelectOption,
  IonListHeader,
  IonRange,
  IonIcon,
} from "@ionic/vue";
import { text, walk, rocket } from "ionicons/icons";
import { useSettingsStore } from "@/stores/settingsStore";
import AppHeader from "@/components/AppHeader.vue";

const settings = useSettingsStore();
</script>
