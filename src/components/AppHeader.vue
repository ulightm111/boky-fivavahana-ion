<template>
  <ion-header :translucent="true">
    <ion-toolbar color="primary">
      <ion-icon
        id="home-icon"
        slot="start"
        :icon="book"
        size="large"
        color="light"
        @click="home"
      ></ion-icon>
      <ion-title slot="start">
        <div v-if="subtitle" class="subtitle">{{ subtitle }}</div>
        <div class="title">{{ title }}</div>
      </ion-title>
    </ion-toolbar>
    <ion-toolbar color="secondary" v-if="showSearchbar">
      <form action="." @submit.prevent="onSubmit">
        <ion-searchbar
          :value="searchQuery"
          :placeholder="searchPlaceholder"
          :debounce="debounce"
          @ionInput="onInput"
          @ionClear="onClear"
        ></ion-searchbar>
      </form>
    </ion-toolbar>
  </ion-header>
</template>

<script setup lang="ts">
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonSearchbar,
  IonIcon,
  useIonRouter,
} from "@ionic/vue";
import { book } from "ionicons/icons";

const router = useIonRouter();

const home = () => {
  router.push("/books");
};

const props = defineProps({
  title: {
    type: String,
    default: "",
  },
  subtitle: {
    type: String,
    default: "",
  },
  showBackButton: {
    type: Boolean,
    default: true,
  },
  backButtonDefaultHref: {
    type: String,
    default: "/books",
  },
  showSearchbar: {
    type: Boolean,
    default: false,
  },
  searchQuery: {
    type: String,
    default: "",
  },
  searchPlaceholder: {
    type: String,
    default: "Hitady...",
  },
  debounce: {
    type: Number,
    default: 250, // milliseconds
  },
});

const emit = defineEmits([
  "update:searchQuery",
  "search-input",
  "search-clear",
  "search-submit",
]);

const onInput = (event: any) => {
  const value = event.target.value || "";
  emit("update:searchQuery", value);
  emit("search-input", event);
};

const onSubmit = () => {
  emit("search-submit", props.searchQuery);
};

const onClear = (event: any) => {
  emit("update:searchQuery", "");
  emit("search-clear", event);
};
</script>

<style scoped>
#home-icon {
  padding-left: 5px;
  cursor: pointer;
}

ion-title {
  padding-left: 10px;
}

.title {
  font-family: "Cinzel-Bold", serif;
  font-size: 1em;
}

.subtitle {
  font-size: 0.7em;
  font-weight: normal;
  color: var(--ion-color-white);
}
</style>
