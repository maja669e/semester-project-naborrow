/**
 * plugins/index.js
 *
 * Automatically included in `./src/main.js`
 */

import vuetify from './vuetify'
import router  from '../router/index.js'

export function registerPlugins(app) {
  app.use(vuetify)
  app.use(router)
}
