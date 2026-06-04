// plugins/vuetify.js
// Konfigurerer Vuetify med LÅKALs designtema og farvepalette.

// Vuetify fabriksfunktion
import { createVuetify } from 'vuetify'
// MDI-ikoner
import '@mdi/font/css/materialdesignicons.css'
// Vuetify basestile
import 'vuetify/styles'

export default createVuetify({
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        colors: {
          primary: '#546a41',
          background: '#f5f3ef',
          surface: '#ffffff',
          secondary: '#6b6763',
        }
      }
    }
  }
})
