<script>
// Rod-komponent for LÅKAL SPA.
// Ansvaret er:
//   1. Vise den aktuelle rute via <RouterView>
//   2. Levere tværgående tilstand til alle views via provide()
//   3. Vise AppBottomNav og SuccessDialog uden for ruterne
import AppBottomNav  from "@/components/layout/AppBottomNav.vue";
import SuccessDialog from "@/components/feedback/SuccessDialog.vue";
import { authStore }  from "@/stores/auth.js";

export default {
  components: { AppBottomNav, SuccessDialog },

  data() {
    return {
        showRentalSuccess: false,
      // ── Profil / logout ──────────────────────────────────
      showProfileMenu: false,

      // ── Tema (lys/mørk) ──────────────────────────────────
      // Initialiseres fra localStorage, falder tilbage på systemindstilling
      isDark: (() => {
        const saved = localStorage.getItem("lakal-theme");
        if (saved) return saved === "dark";
        return window.matchMedia("(prefers-color-scheme: dark)").matches;
      })(),

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

       triggerRentalSuccess: this.triggerRentalSuccess, 

      // Auth – tilgængeligt i alle descendant-komponenter
      authStore,
    };
  },

  computed: {
    // Giver skabelonen adgang til den loggede bruger uden at gå uden om Vue
    loggedInUser() {
      return authStore.user.value;
    },

    // Oversætter isDark til Vuetifys tema-streng — bindes direkte på <v-app :theme>
    currentTheme() {
      return this.isDark ? "dark" : "light";
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

  watch: {
    // Gem tema-valg i localStorage når brugeren skifter
    isDark(val) {
      localStorage.setItem("lakal-theme", val ? "dark" : "light");
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
      triggerRentalSuccess() {
    this.showRentalSuccess = true;

    // immediate background redirect (same as item flow)
    this.$router.push({ name: "community" });
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
  <v-app :theme="currentTheme">
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
<SuccessDialog
  v-model="showRentalSuccess"
  title="Låneanmodning sendt!"
  message="Din låneanmodning er nu sendt til udlåner"
/>
    <!-- Bundnavigation vises kun på de primære sider når brugeren er logget ind -->
    <AppBottomNav
      v-if="showBottomNav"
      :activePage="activePage"
      @navigate="navigateTo"
    />

    <!-- Profilmenu – vises som bundark når brugeren trykker på Profil-fanen -->
    <v-bottom-sheet v-model="showProfileMenu" max-width="600">
      <v-sheet class="profil-ark" color="surface">

        <!-- Brugerinfo øverst i arket -->
        <div class="profil-ark__bruger">
          <v-icon size="48" color="var(--color-primary)" icon="mdi-account-circle" />
          <div class="profil-ark__navn">
            <span class="profil-ark__fulde-navn">
              {{ loggedInUser?.firstName }} {{ loggedInUser?.lastName }}
            </span>
            <span class="profil-ark__email">{{ loggedInUser?.email }}</span>
          </div>
        </div>

        <v-divider class="mb-4" />

        <!-- Tema-toggle: lys/mørk tilstand -->
        <div class="profil-ark__theme-row">
          <span class="profil-ark__theme-label">
            <v-icon
              size="18"
              class="mr-2"
              :icon="isDark ? 'mdi-weather-night' : 'mdi-weather-sunny'"
            />
            {{ isDark ? 'Mørk tilstand' : 'Lys tilstand' }}
          </span>
          <v-switch
            v-model="isDark"
            color="primary"
            hide-details
            density="compact"
          />
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
          variant="tonal"
          class="mt-2 profil-ark__luk"
          @click="showProfileMenu = false"
        >
          Annuller
        </v-btn>

      </v-sheet>
    </v-bottom-sheet>

  </v-app>
</template>

<style>
/* Globale element-defaults — gælder hele appen */
h1, h2, h3, h4 {
  font-family: var(--font-display);
  line-height: 1.2;
}

/* Synlig fokus-ring (WCAG 2.2 SC 2.4.11) — kun ved tastaturnavigation */
:focus-visible {
  outline: 3px solid var(--color-primary);
  outline-offset: 2px;
  border-radius: var(--radius-sm);
}
:focus:not(:focus-visible) { outline: none; }

/* Reduced motion (WCAG 2.3.3 + EAA) */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
</style>

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

.profil-ark__theme-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-2) var(--space-4);
  margin-bottom: var(--space-2);
}

.profil-ark__theme-label {
  font-family: var(--font-body);
  font-size: var(--text-body);
  color: var(--color-neutral);
  display: flex;
  align-items: center;
}
</style>
