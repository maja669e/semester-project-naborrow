// Startpunkt for LÅKAL SPA.
// Registrerer alle plugins og monterer rod-komponenten i DOM'en.

// Vue kernebibliotek
import { createApp } from 'vue'

// Plugin-registrering (Vuetify, router m.fl.)
import { registerPlugins } from '@/plugins/index.js'

// Rod-komponent
import App from './App.vue'

// Fonte
import 'unfonts.css'

// Design system CSS variabler
import './styles/settings.scss'

const app = createApp(App)

registerPlugins(app)

app.mount('#app')
