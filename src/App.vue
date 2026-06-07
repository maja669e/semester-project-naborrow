<script>
// Rod-komponent for LÅKAL SPA.
// Ansvaret er:
//   1. Vise den aktuelle rute via <RouterView>
//   2. Levere tværgående tilstand til alle views via provide()
//   3. Vise AppBottomNav og SuccessDialog uden for ruterne
import AppBottomNav  from "@/components/layout/AppBottomNav.vue";
import SuccessDialog from "@/components/SuccessDialog.vue";
import { authStore }  from "@/stores/auth.js";

export default {
  components: { AppBottomNav, SuccessDialog },

  data() {
    return {
      // ── Profil / logout ──────────────────────────────────
      showProfileMenu: false,

      // ── Opret-genstand flow ──────────────────────────────
      showSuccess: false,

      // State for genstandsoversigten samlet i ét objekt, så provide()
      // kan levere en reaktiv reference – property-mutationer slår igennem
      // i alle descendant-views der injekterer items (som vist i slidesene).
      items: {
        reloadKey:   0,    // Forøges af onItemCreated for at udløse re-fetch
        shownItemId: null, // Id der fremhæves og scrolles til efter oprettelse
      },

      // ── Udlejnings-flow (provides til RentalView via provide/inject) ──
      // Kun item gemmes her — formdata akkumuleres lokalt i RentalView
      rental: {
        item: null,
      },
    };
  },

  provide() {
    return {
      items: this.items,

      itemCreated: this.onItemCreated,

      // Udlejnings-flow – item deles med RentalView; flowet styres internt deri
      rental:          this.rental,
      startRentalFlow: this.startRentalFlow,

      // Auth – tilgængeligt i alle descendant-komponenter
      authStore,
    };
  },

  computed: {
    // Giver skabelonen adgang til den loggede bruger uden at gå uden om Vue
    loggedInUser() {
      return authStore.user.value;
    },

    // Oversæt den aktuelle rute til en AppBottomNav-fanepnøgle
    activePage() {
      if (this.showProfileMenu) return "profil";
      const map = { home: "home", community: "homepage", items: "itemOverview", requests: "requests" };
      return map[this.$route?.name] || "";
    },

    // Bundnavigationen vises kun på de primære sider (ikke på login)
    showBottomNav() {
      return ["home", "community", "items", "rental", "requests", "loans"].includes(this.$route?.name)
        && authStore.isLoggedIn.value;
    },
  },

  methods: {
    // ── Generel navigation ───────────────────────────────────
    navigateTo(key) {
      if (key === "profil") { this.showProfileMenu = true; return; }
      const map = { home: "home", homepage: "community", itemOverview: "items" };
      if (map[key]) this.$router.push({ name: map[key] });
    },

    // ── Opret-genstand flow ──────────────────────────────────
    // Kaldt via provide/inject fra CreateItemView når en genstand er oprettet.
    // Opdaterer items-objektet (reaktivt via provide) og viser success-dialog.
    onItemCreated(newId) {
      this.items.shownItemId  = newId;
      this.items.reloadKey   += 1;
      this.showSuccess = true;
      this.$router.push({ name: "items" });
    },

    handleSuccessBack() {
      this.showSuccess = false;
      this.items.shownItemId = null;
    },

    // ── Udlejnings-flow (kaldt via inject fra rental-views) ──────────────────
    startRentalFlow(item) {
      this.rental.item = item;
      this.$router.push({ name: "rental" });
    },

    // Logger brugeren ud, lukker profilmenuen og sender til login-siden
    logout() {
      authStore.logout();
      this.showProfileMenu = false;
      this.$router.push({ name: "login" });
    },
  },
};
</script>

<template>
  <v-app>
    <v-main>

      <RouterView />

    </v-main>

    <!-- Success-dialog vises oven på genstandsoversigten efter oprettelse -->
    <SuccessDialog
      v-model="showSuccess"
      title="Oprettet!"
      message="Din genstand er nu oprettet og klar"
      @back-to-overview="handleSuccessBack"
    />

    <!-- Bundnavigation vises kun på de primære sider når brugeren er logget ind -->
    <AppBottomNav
      v-if="showBottomNav"
      :activePage="activePage"
      @navigate="navigateTo"
    />

    <!-- Profilmenu – vises som bundark når brugeren trykker på Profil-fanen -->
    <v-bottom-sheet v-model="showProfileMenu" max-width="600">
      <v-sheet class="profil-ark">

        <!-- Brugerinfo øverst i arket -->
        <div class="profil-ark__bruger">
          <v-icon size="48" color="var(--color-primary)">mdi-account-circle</v-icon>
          <div class="profil-ark__navn">
            <span class="profil-ark__fulde-navn">
              {{ loggedInUser?.firstName }} {{ loggedInUser?.lastName }}
            </span>
            <span class="profil-ark__email">{{ loggedInUser?.email }}</span>
          </div>
        </div>

        <v-divider class="mb-4" />

        <!-- Log ud-knap -->
        <v-btn
          block
          variant="tonal"
          color="error"
          size="large"
          prepend-icon="mdi-logout"
          class="profil-ark__log-ud"
          @click="logout"
        >
          Log ud
        </v-btn>

        <!-- Luk-knap -->
        <v-btn
          block
          variant="text"
          class="mt-2 profil-ark__luk"
          @click="showProfileMenu = false"
        >
          Annuller
        </v-btn>

      </v-sheet>
    </v-bottom-sheet>

  </v-app>
</template>

<style scoped>
.profil-ark {
  padding: 24px 16px 32px;
  border-radius: 16px 16px 0 0;
}

.profil-ark__bruger {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.profil-ark__navn {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.profil-ark__fulde-navn {
  font-family: var(--font-body);
  font-size: var(--text-body);
  font-weight: 600;
  color: var(--color-neutral);
}

.profil-ark__email {
  font-family: var(--font-body);
  font-size: 13px;
  color: var(--color-secondary);
}
</style>
