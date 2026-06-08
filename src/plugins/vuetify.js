// plugins/vuetify.js
// Konfigurerer Vuetify med LÅKALs designtema og farvepalette.

// Composables
import { createVuetify } from 'vuetify'
// Styles
import '@mdi/font/css/materialdesignicons.css'
// Vuetify basestile
import 'vuetify/styles'

// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
export default createVuetify({
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        dark: false,
        colors: {
          background: '#F6F5F0',
          surface: '#FFFFFF',
          primary: '#2C3B1E',
          'on-primary': '#FFFFFF',
          secondary: '#004D40',
          'on-secondary': '#FFFFFF',
          success: '#1A521A',
          warning: '#714A00',
          error: '#861E1E',
          info: '#004D40',
          'on-surface': '#2C2C25',
        }
      },
      dark: {
        dark: true,
        colors: {
          background: '#1F1F1A',
          surface: '#2C2C25',
          primary: '#A8BE8C',
          'on-primary': '#15150F',
          secondary: '#80CBC4',
          'on-secondary': '#15150F',
          success: '#B4D080',
          warning: '#E8C770',
          error: '#E89898',
          info: '#80CBC4',
          'on-surface': '#F6F5F0',
        }
      }
    }
  }
})