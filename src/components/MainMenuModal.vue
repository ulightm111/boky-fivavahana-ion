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
          <div class="menu-item" @click="about">
            <div class="icon-container">
              <ion-icon :icon="informationCircle" size="large" />
            </div>
            <div class="menu-label">Mombamomba</div>
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
import {
  informationCircle,
  settings as settingsIcon,
  exitOutline,
} from "ionicons/icons";
import { App } from "@capacitor/app";
import { storeToRefs } from "pinia";
import { useBookStore } from "@/stores/bookStore";
import { useIonRouter } from "@ionic/vue";

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

const about = async () => {
  await modalController.dismiss();
  ionRouter.push("/about");
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
}

.menu-item:active .icon-container {
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
