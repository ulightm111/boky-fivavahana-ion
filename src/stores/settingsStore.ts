// src/stores/settingsStore.ts
import { defineStore } from 'pinia';
import { ref, watch } from 'vue';
import { Preferences } from '@capacitor/preferences';
import { KeepAwake } from '@capacitor-community/keep-awake';

export const useSettingsStore = defineStore('settings', () => {
  const theme = ref<'light' | 'dark' | 'system'>('system');
  const keepScreenOn = ref(false);
  const fontSize = ref(100);
  const scrollSpeed = ref(10);
  const showZoomBtn = ref(true);
  const showZigzagBtn = ref(true);
  const lyricsZZStyle = ref(true);

  // Load settings on startup
  const loadSettings = async () => {
    const { value: t } = await Preferences.get({ key: 'theme' });
    const { value: k } = await Preferences.get({ key: 'keepScreenOn' });
    const { value: f } = await Preferences.get({ key: 'fontSize' });
    const { value: ss } = await Preferences.get({ key: 'scrollSpeed' });
    const { value: z } = await Preferences.get({ key: 'showZoomBtn'})
    const { value: i } = await Preferences.get({ key: 'showZigzagBtn'})
    const { value: zz } = await Preferences.get({ key: 'lyricsZZStyle'})

    if (t) theme.value = t as any;
    if (k) keepScreenOn.value = k === 'true';
    if (f) fontSize.value = parseInt(f);
    if (ss) scrollSpeed.value = parseInt(ss);
    if (z) showZoomBtn.value = z === 'true';
    if (i) showZigzagBtn.value = i === 'true';
    if (zz) lyricsZZStyle.value = zz === 'true';
    
    applyTheme();
    applyKeepAwake();
  };

  const applyTheme = () => {
    const isDark = theme.value === 'dark' || 
      (theme.value === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.body.classList.toggle('ion-palette-dark', isDark);
  };

  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  mediaQuery.addEventListener('change', () => {
    if (theme.value === 'system') {
      applyTheme();
    }
  });

  const applyKeepAwake = async () => {
    if (keepScreenOn.value) {
      await KeepAwake.keepAwake();
    } else {
      await KeepAwake.allowSleep();
    }
  };

  // Watchers to save automatically
  watch(theme, (val) => {
    Preferences.set({ key: 'theme', value: val });
    applyTheme();
  });

  watch(keepScreenOn, (val) => {
    Preferences.set({ key: 'keepScreenOn', value: String(val) });
    applyKeepAwake();
  });

  watch(fontSize, (val) => {
    Preferences.set({ key: 'fontSize', value: String(val) });
  });

  watch(scrollSpeed, (val) => {
    Preferences.set({ key: 'scrollSpeed', value: String(val) });
  });

  watch(showZoomBtn, (val) => {
    Preferences.set({ key: 'showZoomBtn', value: String(val) });
  });

  watch(showZigzagBtn, (val) => {
    Preferences.set({ key: 'showZigzagBtn', value: String(val) });
  });

  watch(lyricsZZStyle, (val) => {
    Preferences.set({ key: 'lyricsZZStyle', value: String(val) });
  });

  return { theme, keepScreenOn, fontSize, scrollSpeed, showZoomBtn, showZigzagBtn, lyricsZZStyle, loadSettings };
});
