<template>
  <ion-page>
    <app-header title="Mombamomba" :show-searchbar="false" />
    <ion-content :fullscreen="true">
      <div class="about-header">
        <div class="logo-container">
          <img
            src="/src/assets/icon.png"
            alt="App Icon"
            class="about-logo-img"
          />
        </div>
        <h2>Boky Fivavahana Anglikana</h2>
        <p class="motto">
          "Ary toy izany ihany koa ianareo: raha fatra-paniry ny zava-panahy,
          dia izay hampandroso ny fiangonana no tadiavo indrindra."<br />
          — I Korintiana 14 : 12
        </p>
      </div>

      <ion-card mode="ios">
        <ion-card-content>
          <p class="description">
            Voninahitra ho an'Andriamanitra irery ihany.<br />
            Natao hampiasaina amin'ny litorjia sy hira anglikana raha sendra tsy
            eo ny boky.
          </p>
        </ion-card-content>
      </ion-card>

      <ion-list-header>
        <ion-label
          >Fifandraisana raha misy fanamarihana, olana,
          sosokevitra...</ion-label
        >
      </ion-list-header>

      <ion-list :inset="true" mode="ios" id="contacts">
        <ion-item button @click="openEmail">
          <ion-icon :icon="mailOutline" slot="start" color="primary"></ion-icon>
          <ion-label>
            <h3>Mailaka</h3>
            <p>tsiorymanana7@gmail.com</p>
          </ion-label>
        </ion-item>

        <ion-item button @click="openPhone">
          <ion-icon :icon="callOutline" slot="start" color="primary"></ion-icon>
          <ion-label>
            <h3>Finday</h3>
            <p>+261 34 70 485 04</p>
          </ion-label>
        </ion-item>

        <ion-item button @click="openFacebook">
          <ion-icon
            :icon="logoFacebook"
            slot="start"
            color="primary"
          ></ion-icon>
          <ion-label>
            <h3>Facebook</h3>
            <p>Tsiory Manana</p>
          </ion-label>
        </ion-item>

        <ion-item button @click="openGithub">
          <ion-icon :icon="logoGithub" slot="start" color="primary"></ion-icon>
          <ion-label>
            <h3>GitHub</h3>
            <p>ulightm111/boky-fivavahana-ion</p>
          </ion-label>
        </ion-item>
      </ion-list>

      <div class="version-section">
        <p class="version-text">
          Version: <strong>{{ currentVersion }}</strong>
        </p>

        <div class="button-group">
          <ion-button
            v-if="!updateUrl"
            expand="block"
            fill="outline"
            shape="round"
            @click="checkForUpdate"
            :disabled="isChecking"
          >
            <ion-spinner
              v-if="isChecking"
              name="crescent"
              slot="start"
            ></ion-spinner>
            <ion-icon v-else :icon="refreshOutline" slot="start"></ion-icon>
            Hijerena version farany
          </ion-button>

          <ion-button
            v-else
            expand="block"
            color="success"
            shape="round"
            class="ion-margin-top"
            @click="openDownloadPage"
          >
            <ion-icon :icon="downloadOutline" slot="start"></ion-icon>
            Haka ny version vaovao
          </ion-button>
        </div>
      </div>
    </ion-content>
    <app-footer />
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage,
  IonContent,
  IonCard,
  IonCardContent,
  IonButton,
  IonSpinner,
  IonIcon,
  IonList,
  IonItem,
  IonLabel,
  IonListHeader,
  toastController,
} from "@ionic/vue";
import { ref, onMounted } from "vue";
import {
  downloadOutline,
  mailOutline,
  callOutline,
  logoFacebook,
  logoGithub,
  refreshOutline,
} from "ionicons/icons";
import { Browser } from "@capacitor/browser";
import { App } from "@capacitor/app";
import AppHeader from "@/components/AppHeader.vue";
import AppFooter from "@/components/AppFooter.vue";

const currentVersion = ref("...");
const isChecking = ref(false);
const updateUrl = ref<string | null>(null);

const GITHUB_REPO = "ulightm111/boky-fivavahana-ion";

onMounted(async () => {
  try {
    const info = await App.getInfo();
    currentVersion.value = info.version;
  } catch (e) {
    currentVersion.value = "1.0.0";
  }
});

const openEmail = () => window.open("mailto:tsiorymanana7@gmail.com");
const openPhone = () => window.open("tel:+261347048504");
const openFacebook = () =>
  Browser.open({ url: "https://www.facebook.com/tsiory.rjn" });
const openGithub = () =>
  Browser.open({ url: `https://github.com/${GITHUB_REPO}` });

const checkForUpdate = async () => {
  isChecking.value = true;
  updateUrl.value = null;

  try {
    const response = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO}/releases/latest`,
    );
    if (!response.ok) throw new Error();

    const data = await response.json();
    const latestVersion = data.tag_name;
    const latest = latestVersion.replace(/[^0-9.]/g, "");
    const current = currentVersion.value.replace(/[^0-9.]/g, "");

    if (latest !== current) {
      updateUrl.value = data.html_url;
      showToast(`Misy version vaovao: ${latestVersion}`, "success");
    } else {
      showToast("Efa ny version farany no ampiasainao.", "dark");
    }
  } catch (error) {
    showToast("Misy olana, hamarino ny internet.", "danger");
  } finally {
    isChecking.value = false;
  }
};

const openDownloadPage = async () => {
  if (updateUrl.value) await Browser.open({ url: updateUrl.value });
};

const showToast = async (message: string, color = "dark") => {
  const toast = await toastController.create({
    message,
    duration: 3000,
    color,
    position: "bottom",
  });
  await toast.present();
};
</script>

<style scoped>
.about-header {
  text-align: center;
  padding: 10px 20px;
  background: var(--ion-color-light);
  margin-bottom: 5px;
}

.logo-container {
  width: 80px;
  height: 80px;
  background: white;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 15px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.about-logo-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.about-header h2 {
  margin: 0;
  font-weight: 800;
  color: var(--ion-text-color);
}

.motto {
  font-family: "Charis SIL Italic";
  color: var(--ion-color-medium);
  margin-top: 5px;
}

.description {
  line-height: 1.5;
  text-align: center;
  margin: 0;
}

#contacts {
  margin-block: 8px;
}

.version-section {
  padding: 10px;
  text-align: center;
}

.version-text {
  font-size: 0.85em;
  color: var(--ion-color-medium);
  margin-bottom: 15px;
}

.button-group {
  max-width: 300px;
  margin: 0 auto;
}
</style>
