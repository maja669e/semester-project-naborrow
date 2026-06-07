// Routerkonfiguration for naborrow SPA.
// Alle ruter bruger hash-historik (#) så serveren aldrig modtager
// under-stier direkte, og appen altid kan deployes statisk.
import { createRouter, createWebHistory } from "vue-router";
import { authStore } from "@/stores/auth.js";

import LoginView        from "@/views/auth/LoginView.vue";
import HomeView         from "@/views/home/HomeView.vue";
import ExploreView      from "@/views/home/ExploreView.vue";
import ItemOverviewView from "@/views/items/ItemOverviewView.vue";
import CreateItemView   from "@/views/items/CreateItemView.vue";
import RentalView    from "@/views/rentals/RentalView.vue";
import RequestsView  from "@/views/rentals/RequestsView.vue";
import LoansView     from "@/views/rentals/LoansView.vue";

const routes = [
  { path: "/login",           name: "login",          component: LoginView,         meta: { isPublic: true } },
  { path: "/",                name: "home",           component: HomeView },
  { path: "/fællesskab",      name: "community",      component: ExploreView },
  { path: "/genstande",       name: "items",          component: ItemOverviewView },
  { path: "/genstande/opret", name: "create-item",    component: CreateItemView },
  { path: "/laan",            name: "rental",         component: RentalView },
  { path: "/anmodninger",     name: "requests",       component: RequestsView },
  { path: "/aktive-lån",      name: "loans",          component: LoansView },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from) => {
  // Videresend ikke-loggede brugere til login, medmindre ruten er offentlig
  if (!to.meta.isPublic && !authStore.isLoggedIn.value) {
    return { name: "login" };
  }

  // Ved sideopdatering sendes brugeren kun til forsiden fra beskyttede ruter –
  // ikke fra login-siden, da det ville skabe en unødvendig dobbelt-omdirigering
  // Ingen reload-redirect — Vite dev-serveren og en korrekt konfigureret
  // produktionsserver sender alle stier til index.html, så reload virker på alle ruter
});

export default router;
