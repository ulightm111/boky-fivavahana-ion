<template>
  <ion-page>
    <app-header title="Favorites" />

    <ion-content :fullscreen="true">
      <ion-list v-if="favoriteItems.length > 0" :inset="true">
        <ion-item
          v-for="item in favoriteItems"
          :key="favoriteKey(item)"
          button
          @click="openFavorite(item)"
        >
          <ion-icon :icon="star" slot="start" color="secondary" />
          <ion-label>
            <h3>{{ item.title }}</h3>
            <p>
              {{
                item.subtitle ||
                bookStore.getBookById(item.bookId)?.name ||
                "Favorite"
              }}
            </p>
          </ion-label>
        </ion-item>
      </ion-list>

      <div v-else class="empty-state">
        <ion-icon :icon="starOutline" size="large" color="medium" />
        <p>No favorites yet.</p>
      </div>
    </ion-content>

    <app-footer />
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonIcon,
  useIonRouter,
} from "@ionic/vue";
import { star, starOutline } from "ionicons/icons";
import { storeToRefs } from "pinia";
import { useBookStore, FavoriteItem } from "@/stores/bookStore";
import AppHeader from "@/components/AppHeader.vue";
import AppFooter from "@/components/AppFooter.vue";

const router = useIonRouter();
const bookStore = useBookStore();
const { favoriteItems } = storeToRefs(bookStore);

const favoriteKey = (item: FavoriteItem) =>
  `${item.type}-${item.bookId}-${item.id}-${item.sectionName || ""}-${
    item.subsectionIndex ?? ""
  }`;

const openFavorite = (item: FavoriteItem) => {
  router.push(bookStore.getFavoritePath(item));
};
</script>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  text-align: center;
  color: var(--ion-color-medium);
  gap: 0.5rem;
  padding: 1rem;
}
</style>
