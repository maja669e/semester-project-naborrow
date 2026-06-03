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
import RentalPageOne    from "@/views/rentals/RentalPageOne.vue";
import RentalPageTwo    from "@/views/rentals/RentalPageTwo.vue";
import RentalConfirmPage from "@/views/rentals/RentalConfirmPage.vue";
import RequestsView      from "@/views/rentals/RequestsView.vue";

const routes = [
  { path: "/login",           name: "login",          component: LoginView,         meta: { isPublic: true } },
  { path: "/",                name: "home",           component: HomeView },
  { path: "/fællesskab",      name: "community",      component: ExploreView },
  { path: "/genstande",       name: "items",          component: ItemOverviewView },
  { path: "/genstande/opret", name: "create-item",    component: CreateItemView },
  { path: "/laan/trin-1",     name: "rental-step-1",  component: RentalPageOne },
  { path: "/laan/trin-2",     name: "rental-step-2",  component: RentalPageTwo },
  { path: "/laan/bekraeft",   name: "rental-confirm", component: RentalConfirmPage },
  { path: "/anmodninger",     name: "requests",       component: RequestsView },
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
  if (from.name) return;
  const navEntry = performance.getEntriesByType?.("navigation")?.[0];
  if (navEntry?.type === "reload" && to.path !== "/" && !to.meta.isPublic) {
    return { path: "/" };
  }
});

export default router;
