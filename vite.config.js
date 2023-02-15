import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// import { promises as fs } from "fs";
import Icons from "unplugin-icons/vite";
import { FileSystemIconLoader } from "unplugin-icons/loaders";
// import IconsResolver from "unplugin-icons/resolver";
// import Components from "unplugin-vue-components/vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    Icons({
      compiler: "vue3",
      customCollections: {
        // key as the collection name
        default: FileSystemIconLoader("./src/assets/icons", (svg) =>
          svg.replace(/fill="#fff"/gi, 'fill="currentColor"')
        ),
      },
    }),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  // base: "/wonderwall/",
});
