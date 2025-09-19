import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { createPinia } from 'pinia';

// Element Plus
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import * as ElementPlusIconsVue from '@element-plus/icons-vue';

import './assets/scss/main.scss';

console.log('Starting application...');

const app = createApp(App);
const pinia = createPinia();

// Register Element Plus
app.use(ElementPlus);

// Register all Element Plus icons
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}

app.use(pinia);
app.use(router);

console.log('Element Plus, Pinia and router initialized, mounting app...');

app.mount('#app');

console.log('Application mounted successfully');