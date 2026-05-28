// Routerkonfiguration for naborrow SPA.
// Alle ruter bruger hash-historik (#) så serveren aldrig modtager
// under-stier direkte, og appen altid kan deployes statisk.
import { createRouter, createWebHashHistory } from "vue-router";
import { authStore } from "@/stores/auth.js";

import LoginView        from "@/views/auth/LoginView.vue";
import HomeView         from "@/views/home/HomeView.vue";
import Homepage         from "@/views/home/Homepage.vue";
import ItemOverviewView from "@/views/items/ItemOverviewView.vue";
import CreateItemView   from "@/views/items/CreateItemView.vue";
import RentalPageOne    from "@/views/rentals/RentalPageOne.vue";
import RentalPageTwo    from "@/views/rentals/RentalPageTwo.vue";
import RentalConfirmPage from "@/views/rentals/RentalConfirmPage.vue";
import RequestsView      from "@/views/rentals/RequestsView.vue";

const ruter = [
  { path: "/login",           name: "login",          component: LoginView,         meta: { offentlig: true } },
  { path: "/",                name: "home",           component: HomeView },
  { path: "/fællesskab",      name: "community",      component: Homepage },
  { path: "/genstande",       name: "items",          component: ItemOverviewView },
  { path: "/genstande/opret", name: "opret-genstand", component: CreateItemView },
  { path: "/laan/trin-1",     name: "laan-trin-1",    component: RentalPageOne },
  { path: "/laan/trin-2",     name: "laan-trin-2",    component: RentalPageTwo },
  { path: "/laan/bekraeft",   name: "laan-bekraeft",  component: RentalConfirmPage },
  { path: "/anmodninger",     name: "anmodninger",    component: RequestsView },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes: ruter,
});

router.beforeEach((to, from) => {
  // Videresend ikke-loggede brugere til login, medmindre ruten er offentlig
  if (!to.meta.offentlig && !authStore.erLoggetInd.value) {
    return { name: "login" };
  }

  // Ved sideopdatering sendes brugeren kun til forsiden fra beskyttede ruter –
  // ikke fra login-siden, da det ville skabe en unødvendig dobbelt-omdirigering
  if (from.name) return;
  const navEntry = performance.getEntriesByType?.("navigation")?.[0];
  if (navEntry?.type === "reload" && to.path !== "/" && !to.meta.offentlig) {
    return { path: "/" };
  }
});

export default router;
