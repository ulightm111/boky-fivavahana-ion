import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.uli.bokyfivavahana2",
  appName: "Boky Fivavahana Anglikana",
  webDir: "dist",
  plugins: {
    StatusBar: {
      overlaysWebView: true,
      style: "DARK",
      backgroundColor: "#00277c",
    },
  },
};

export default config;
