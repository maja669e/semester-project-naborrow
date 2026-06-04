// plugins/index.js
// Samler og registrerer alle Vue-plugins på appen.
// Inkluderes automatisk fra main.js.

import vuetify from './vuetify'
import router  from '../router/index.js'

export function registerPlugins(app) {
  app.use(vuetify)
  app.use(router)
}
