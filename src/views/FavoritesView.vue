<template>
  <ion-page>
    <app-header title="Tiana" />

    <ion-content :fullscreen="true">
      <div v-if="favoriteItems.length > 0">
        <ion-list :inset="true">
          <template
            v-for="group in groupedAndSortedFavorites"
            :key="group.bookId"
          >
            <ion-item-divider sticky>
              <ion-label>{{ group.bookName }}</ion-label>
            </ion-item-divider>
            <ion-item-sliding
              v-for="item in group.items"
              :key="favoriteKey(item)"
            >
              <ion-item button @click="openFavorite(item)">
                <ion-icon
                  :icon="getBookSvg(group.bookName)"
                  slot="start"
                  color="medium"
                />
                <ion-label>
                  <h3>{{ item.title }}</h3>
                  <p>{{ item.subtitle || "Tiana" }}</p>
                </ion-label>
              </ion-item>

              <ion-item-options side="end">
                <ion-item-option color="danger" @click="removeFavorite(item)">
                  <ion-icon :icon="starIcon" size="large" />
                </ion-item-option>
              </ion-item-options>
            </ion-item-sliding>
          </template>
        </ion-list>
      </div>

      <div v-else class="empty-state">
        <ion-icon :icon="starIcon" size="large" color="medium" />
        <p>Mbola tsy misy nataonao ato.</p>
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
  IonItemDivider,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
  IonIcon,
  useIonRouter,
} from "@ionic/vue";
import { computed } from "vue";
import { storeToRefs } from "pinia";
import { useBookStore, FavoriteItem } from "@/stores/bookStore";
import AppHeader from "@/components/AppHeader.vue";
import AppFooter from "@/components/AppFooter.vue";
import { getBookSvg, starIcon } from "@/utils/svgIcons";

const router = useIonRouter();
const bookStore = useBookStore();
const { favoriteItems } = storeToRefs(bookStore);

const groupedAndSortedFavorites = computed(() => {
  // Group by bookId
  const groupMap = new Map<
    number,
    { bookName: string; items: FavoriteItem[] }
  >();

  favoriteItems.value.forEach((item) => {
    if (!groupMap.has(item.bookId)) {
      const book = bookStore.getBookById(item.bookId);
      groupMap.set(item.bookId, {
        bookName: book?.name || `Book ${item.bookId}`,
        items: [],
      });
    }
    groupMap.get(item.bookId)!.items.push(item);
  });

  // Sort each group by item ID, then convert to sorted array by book ID
  const sorted = Array.from(groupMap.entries())
    .sort(([bookIdA], [bookIdB]) => bookIdA - bookIdB)
    .map(([bookId, group]) => ({
      bookId,
      bookName: group.bookName,
      items: group.items.sort((a, b) => {
        const aId =
          typeof a.id === "number" ? a.id : parseInt(String(a.id), 10);
        const bId =
          typeof b.id === "number" ? b.id : parseInt(String(b.id), 10);
        return aId - bId;
      }),
    }));

  return sorted;
});

const favoriteKey = (item: FavoriteItem) =>
  `${item.type}-${item.bookId}-${item.id}-${item.sectionName || ""}-${
    item.subsectionIndex ?? ""
  }`;

const openFavorite = (item: FavoriteItem) => {
  router.push(bookStore.getFavoritePath(item));
};

const removeFavorite = async (item: FavoriteItem) => {
  await bookStore.toggleFavorite(item);
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
h3 {
  font-size: 1em;
}
</style>
