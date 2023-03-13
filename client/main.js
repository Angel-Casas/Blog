import { createApp } from 'vue';
import { createPinia } from "pinia";

import VueSocialSharing from 'vue-social-sharing';

import App from './App.vue';
import router from "./router";

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(VueSocialSharing);

app.mount('#App');