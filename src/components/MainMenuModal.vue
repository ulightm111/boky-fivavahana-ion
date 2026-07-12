<template>
  <ion-content class="ion-padding">
    <ion-grid>
      <ion-row>
        <ion-col
          size="4"
          v-for="book in books"
          :key="book.id"
          class="ion-text-center"
        >
          <div class="menu-item" @click="navigateToBook(book)">
            <div class="icon-container">
              <ion-icon :icon="getBookSvg(book.name)" size="large" />
            </div>
            <div class="menu-label">{{ book.name }}</div>
          </div>
        </ion-col>
        <ion-col size="4" class="ion-text-center">
          <div class="menu-item" @click="settings">
            <div class="icon-container">
              <ion-icon :icon="settingsIcon" size="large" />
            </div>
            <div class="menu-label">Fikirakirana</div>
          </div>
        </ion-col>
        <ion-col size="4" class="ion-text-center">
          <div class="menu-item" @click="favorites">
            <div class="icon-container">
              <ion-icon :icon="starIcon" size="large" />
            </div>
            <div class="menu-label">Tiana</div>
          </div>
        </ion-col>
        <ion-col size="4" class="ion-text-center">
          <div class="menu-item" @click="exitAppPrompt">
            <div class="icon-container">
              <ion-icon :icon="exitOutline" size="large" />
            </div>
            <div class="menu-label">Hiala</div>
          </div>
        </ion-col>
      </ion-row>
    </ion-grid>
  </ion-content>
</template>

<script setup lang="ts">
import {
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonIcon,
  modalController,
  alertController,
} from "@ionic/vue";
import { settings as settingsIcon, exitOutline } from "ionicons/icons";
import { App } from "@capacitor/app";
import { storeToRefs } from "pinia";
import { useBookStore } from "@/stores/bookStore";
import { useIonRouter } from "@ionic/vue";
import { getBookSvg, starIcon } from "@/utils/svgIcons";

const bookStore = useBookStore();
const { books } = storeToRefs(bookStore);
const ionRouter = useIonRouter();

const navigateToBook = async (book: any) => {
  await modalController.dismiss();
  ionRouter.push(`/books/${book.id}`);
};

const settings = async () => {
  await modalController.dismiss();
  ionRouter.push("/settings");
};

const favorites = async () => {
  await modalController.dismiss();
  ionRouter.push("/favorites");
};

const exitAppPrompt = async () => {
  await modalController.dismiss();
  const alert = await alertController.create({
    header: "Hiala",
    message: "Akatona ny Boky?",
    buttons: [
      {
        text: "Tsia",
        role: "cancel",
        cssClass: "alert-btn",
      },
      {
        text: "Eny",
        role: "confirm",
        cssClass: "alert-btn",
        handler: async () => {
          await App.exitApp();
        },
      },
    ],
  });
  await alert.present();
};
</script>

<style scoped>
ion-content {
  --background: var(--ion-background-color);
}
.menu-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 12px 8px;
  border-radius: 12px;
  height: 100%;
  cursor: pointer;
  transition: background-color 0.2s;
  user-select: none;
}

.menu-item:active {
  background-color: rgba(var(--ion-color-secondary-rgb), 0.1);
}

.icon-container {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: rgba(var(--ion-color-secondary-rgb), 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
  transition: transform 0.2s;
  will-change: transform;
}

.menu-item:active .icon-container {
  will-change: transform;
  transform: scale(0.95);
}

.icon-container ion-icon {
  color: var(--ion-color-secondary);
}

.menu-label {
  font-size: 0.85rem;
  line-height: 1.2;
  font-weight: 500;
  color: var(--ion-text-color);
  overflow: hidden;
  text-align: center;
}
</style>

<style>
.alert-btn {
  color: var(--ion-color-secondary) !important;
  width: 40%;
}
.bottom-menu-modal {
  --height: 400px;
  --border-radius: 24px;
  --border-width: 2px;
  --border-style: solid;
  --border-color: var(--ion-color-medium);
  padding-inline: 20px;
}
</style>
