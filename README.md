# Boky Fivavahana (Ionic Vue)

<p align="center">
  <img src="assets/logo.png" alt="Boky Fivavahana app icon" width="120" />
</p>

<p align="center">
  <a href="https://github.com/ulightm111/boky-fivavahana-ion/releases/latest">
    <img src="https://img.shields.io/github/v/release/ulightm111/boky-fivavahana-ion?label=Release" alt="Latest release" />
  </a>
  <a href="https://github.com/ulightm111/boky-fivavahana-ion/blob/main/LICENSE">
    <img src="https://img.shields.io/github/license/ulightm111/boky-fivavahana-ion" alt="License" />
  </a>
  <a href="https://f-droid.org/packages/com.uli.bokyfivavahana2/">
    <img src="https://img.shields.io/badge/F-Droid-1976D2?logo=f-droid&logoColor=white" alt="Get it on F-Droid" />
  </a>
  <a href="https://boky-fivavahana.netlify.app">
    <img src="https://img.shields.io/badge/Live%20Demo-Netlify-00C7B7?logo=netlify&logoColor=white" alt="Open live demo" />
  </a>
</p>

**Boky Fivavahana Anglikana** — A modern Anglican Common Prayer Book app in Malagasy.

> _"Ary toy izany ihany koa ianareo: raha fatra-paniry ny zava-panahy, dia izay hampandroso ny fiangonana no tadiavo indrindra." — I Korintiana 14 : 12_

---

## 📖 Overview

**Boky Fivavahana Anglikana** is a free, offline-first mobile application providing the full liturgical and musical heritage of the Anglican Church in Madagascar.

The app is written in **Ionic Vue**, offering a native-feeling experience with smooth transitions and high-performance search across thousands of entries.

### 📚 Content Included

- **Litorjia Boky Fivavahana** — Main Anglican Liturgies
- **Salamo** — The Book of Psalms
- **Fihirana** — Standard Hymnal
- **Litorjia Provinsialy** — Provincial Liturgy
- **Hanandratra Anao Aho (H.A.A)** — Praise & Worship Hymns
- **Lalan'ny Hazo Fijaliana** — Stations of the Cross

---

## ✨ Features

- **🚀 High Performance:** Powered by Vue 3 and Pinia with optimizations for near-instant rendering of large datasets.
- **🔍 Global & Scoped Search:** Search the entire library at once or filter results within a specific book (e.g., just within H.A.A).
- **🌙 Native Feel:** Follows Android/iOS design patterns with smooth animations and adaptive headers.
- **📱 One-Handed Navigation:** Bottom-focused UI and easy-access side menu for quick book switching.
- **📶 100% Offline:** All data is bundled locally. Zero data usage after installation.

---

## 🛠 Tech Stack

- **Framework:** [Ionic Vue](https://ionicframework.com/docs/vue/overview) (Vue 3)
- **State Management:** [Pinia](https://pinia.vuejs.org/) (with shallow reactivity for performance)
- **Native Bridge:** [Capacitor 7](https://capacitorjs.com/)
- **Icons:** [Ionicons](https://ionicons.com/)
- **Styling:** CSS Variables (supporting system-wide theming)

---

## 📲 Installation

1.  Download the latest `boky-fivavahana2.apk` from the [Releases](https://github.com/ulightm111/boky-fivavahana-ion/releases/latest) page.
2.  Ensure "Install from unknown sources" is enabled in your Android settings.
3.  Open the APK to install.
    - _Compatible with Android 6.0 up to Android 15._

---

## 🏗 Build Instructions

If you wish to contribute or build the app from source:

### Prerequisites

- **Node.js:** 20+ (LTS recommended)
- **Android Studio:** Latest version with SDK 34+
- **Java:** JDK 17+

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/ulightm111/boky-fivavahana-ion.git
cd boky-fivavahana-ion

# 2. Install dependencies
npm install

# 3. Build the Vue production assets
npm run build

# 4. Sync the web assets to the Android platform
npx ionic cap sync android

# 5. Build and Run on a device/emulator
npx ionic cap run android
```

---

## 📸 Screenshots

| Books View                                       | Song List                                        | Content View                                     |
| :----------------------------------------------- | :----------------------------------------------- | :----------------------------------------------- |
| <img src="images/Screenshot_1.png" width="200"/> | <img src="images/Screenshot_2.png" width="200"/> | <img src="images/Screenshot_3.png" width="200"/> |

---

## 📜 License

- **License:** Released under the [GNU General Public License v3.0](https://www.google.com/search?q=LICENSE).
- **Maintainer:** Tsiory M.

---

## 🤝 Feedback

Mandraisa anjara\! If you find a typo in the liturgies or a bug in the code:

- **GitHub:** Open an issue in this repository.
- **Email:** tsiorymanana7@gmail.com
- **Phone:** +261 34 70 485 04
