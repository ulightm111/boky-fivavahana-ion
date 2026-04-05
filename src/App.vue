<template>
  <ion-app>
    <ion-router-outlet />
    <div class="global-spinner-container" v-if="isLoading">
      <ion-spinner name="circular" color="primary"></ion-spinner>
    </div>
  </ion-app>
</template>

<script setup lang="ts">
import { IonApp, IonRouterOutlet, IonSpinner } from '@ionic/vue';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const isLoading = ref(false);

router.beforeEach((to, from, next) => {
  if (to.path !== from.path) {
    isLoading.value = true;
  }
  next();
});

router.afterEach(() => {
  // Give a small delay to let logic and rendering finish
  setTimeout(() => {
    isLoading.value = false;
  }, 100);
});
</script>

<style scoped>
.global-spinner-container {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 100000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(var(--ion-background-color-rgb, 255, 255, 255), 0.8);
  border-radius: 50%;
  padding: 4px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  pointer-events: none;
}
</style>


