<template>
  <ion-page :key="$route.fullPath">
    <app-header title="Mombamonba" :show-searchbar="false" />

    <ion-content :fullscreen="true">
      <ion-card>
        <ion-card-header>
          <ion-card-title>Ny Boky Fivavahana Anglikana</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <p>Natao hampiasaina amin'ny litorjia sy hira anglikana.</p>
          <p>Tsy mahasolo ny Boky akory fa natao anampy</p>
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
} from "@ionic/vue";
import AppHeader from "@/components/AppHeader.vue";
import AppFooter from "@/components/AppFooter.vue";
</script>
