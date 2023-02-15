import { createApp } from "vue";
import { createPinia } from "pinia";
// import { InlineSvgPlugin } from "vue-inline-svg";
import InlineSvg from "vue-inline-svg";

import App from "./App.vue";
import router from "./router";

import "./assets/style/base.scss";

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.component("inline-svg", InlineSvg);
// app.use(InlineSvgPlugin);

app.mount("#app");
