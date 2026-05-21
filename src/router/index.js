// Routerkonfiguration for naborrow SPA.
// Alle ruter bruger hash-historik (#) så serveren aldrig modtager
// under-stier direkte, og appen altid kan deployes statisk.
import { createRouter, createWebHashHistory } from "vue-router";

import HomeView         from "@/views/home/HomeView.vue";
import Homepage         from "@/views/home/Homepage.vue";
import ItemOverviewView from "@/views/items/ItemOverviewView.vue";
import CreateItemView   from "@/views/items/CreateItemView.vue";
import RentalPageOne    from "@/views/rentals/RentalPageOne.vue";
import RentalPageTwo    from "@/views/rentals/RentalPageTwo.vue";
import RentalConfirmPage from "@/views/rentals/RentalConfirmPage.vue";

const ruter = [
  { path: "/",                name: "home",           component: HomeView },
  { path: "/fællesskab",      name: "community",      component: Homepage },
  { path: "/genstande",       name: "items",          component: ItemOverviewView },
  { path: "/genstande/opret", name: "opret-genstand", component: CreateItemView },
  { path: "/laan/trin-1",     name: "laan-trin-1",    component: RentalPageOne },
  { path: "/laan/trin-2",     name: "laan-trin-2",    component: RentalPageTwo },
  { path: "/laan/bekraeft",   name: "laan-bekraeft",  component: RentalConfirmPage },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes: ruter,
});

// Send brugeren til forsiden ved sideopdatering.
// from.name er null kun ved den allerførste navigation i sessionen –
// herefter er from altid en navngivet rute, så vi springer tjekket over.
// Det forhindrer at 'reload'-typen (som forbliver sat hele sessionen)
// blokerer alle efterfølgende navigationer.
router.beforeEach((to, from) => {
  if (from.name) return;
  const navEntry = performance.getEntriesByType?.("navigation")?.[0];
  if (navEntry?.type === "reload" && to.path !== "/") {
    return { path: "/" };
  }
});

export default router;
