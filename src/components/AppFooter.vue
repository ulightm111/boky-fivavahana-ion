<template>
  <ion-footer>
    <ion-toolbar color="primary">
      <ion-buttons>
        <ion-grid>
          <ion-row>
            <ion-col>
              <ion-back-button
                :default-href="backButtonDefaultHref"
                fill="clear"
                text=" "
                :icon="caretBack"
              >
              </ion-back-button>
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
              <ion-button @click="gotoSearch" fill="clear">
                <ion-icon :icon="search"></ion-icon>
              </ion-button>
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
  IonBackButton,
  IonIcon,
  menuController,
} from "@ionic/vue";
import {
  menu,
  chevronBack,
  chevronForward,
  search,
  caretBack,
} from "ionicons/icons";
import { useRouter } from "vue-router";

defineProps({
  canGoPrev: {
    type: Boolean,
    default: false,
  },
  canGoNext: {
    type: Boolean,
    default: false,
  },
  backButtonDefaultHref: {
    type: String,
    default: "/books",
  },
});

defineEmits(["prev", "next"]);

const router = useRouter();

const gotoSearch = (event?: Event) => {
  let searchbar = null;
  if (event && event.target) {
    const page = (event.target as HTMLElement).closest(".ion-page");
    if (page) {
      searchbar = page.querySelector("ion-searchbar");
    }
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
