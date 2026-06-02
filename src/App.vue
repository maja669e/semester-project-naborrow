<script>
// Rod-komponent for naborrow SPA.
// Ansvaret er:
//   1. Vise den aktuelle rute via <router-view>
//   2. Levere tværgående tilstand til de redigerede views via provide()
//   3. Videregive props/events til de urørte lån- og community-views via routeProps/routeListeners
//   4. Vise AppBottomNav og SuccessDialog uden for ruterne
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

      // ── Udlejnings-flow (bruges stadig via routeProps/routeListeners) ──
      // Den genstand brugeren valgte at leje
      selectedRentalItem: null,
      // Samler datoer og detaljer på tværs af laan-trin-1 og laan-trin-2
      rentalDetails: {
        startDate:       "",
        endDate:         "",
        pickupTime:      [],
        accessories:     [],
        acceptedTerms:   false,
        messageToLender: "",
      },
    };
  },

  provide() {
    return {
      items: this.items,

      goToItems:   this.goToItems,
      goToCreate:  this.goToCreate,
      itemCreated: this.onItemCreated,
      goToHome:    this.goToHome,

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

    // Bundnavigationen vises kun på de tre primære sider (ikke på login)
    showBottomNav() {
      return ["home", "community", "items", "rental-step-1", "rental-step-2", "rental-confirm", "requests"].includes(this.$route?.name)
        && authStore.isLoggedIn.value;
    },

    // Props der sendes til de urørte lån- og community-views via router-view slot.
    // HomeView, ItemOverviewView og CreateItemView bruger nu provide/inject i stedet.
    routeProps() {
      const name = this.$route?.name;
      if (name === "rental-step-1") {
        return { item: this.selectedRentalItem, currentStep: 1 };
      }
      if (name === "rental-step-2") {
        return { item: this.selectedRentalItem, currentStep: 2 };
      }
      if (name === "rental-confirm") {
        return { item: this.selectedRentalItem, rental: this.rentalDetails, currentStep: 3 };
      }
      return {};
    },

    // Event-lyttere til de urørte lån- og community-views.
    // HomeView, ItemOverviewView og CreateItemView bruger provide/inject og har ingen lyttere her.
    routeListeners() {
      const name = this.$route?.name;
      const l    = {};

      if (name === "community") {
        l.startRental = this.startRentalFlow;
      }
      if (name === "rental-step-1") {
        l["go-to-rental-page-two"] = this.goToRentalStepTwo;
      }
      if (name === "rental-step-2") {
        l["save-rental-details"]  = this.saveRentalDetails;
        l["go-to-rental-confirm"] = this.goToRentalConfirm;
        l.goBack                  = this.goToRentalStepOne;
      }
      if (name === "rental-confirm") {
        l.goBack              = () => this.$router.push({ name: "rental-step-2" });
        l["rental-confirmed"] = () => this.$router.push({ name: "community" });
      }

      return l;
    },
  },

  methods: {
    // ── Generel navigation ───────────────────────────────────
    // Oversæt AppBottomNav-fanepnøgle til et rutenavn og naviger.
    // "profil" åbner bundmenuen i stedet for at navigere til en ny rute.
    navigateTo(key) {
      if (key === "profil") { this.showProfileMenu = true; return; }
      const map = { home: "home", homepage: "community", itemOverview: "items" };
      if (map[key]) this.$router.push({ name: map[key] });
    },

    goToItems() {
      this.$router.push({ name: "items" });
    },

    goToCreate() {
      this.$router.push({ name: "create-item" });
    },

    goToHome() {
      this.$router.push({ name: "home" });
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

    // ── Udlejnings-flow (kaldt via routeListeners fra lån-views) ────────────
    startRentalFlow(item) {
      this.selectedRentalItem = item;
      this.$router.push({ name: "rental-step-1" });
    },

    goToRentalStepTwo(data) {
      this.rentalDetails.startDate  = data.startDate;
      this.rentalDetails.endDate    = data.endDate;
      this.rentalDetails.pickupTime = data.pickupTime;
      this.$router.push({ name: "rental-step-2" });
    },

    saveRentalDetails(data) {
      this.rentalDetails.messageToLender = data.messageToLender;
      this.rentalDetails.accessories     = data.accessories;
    },

    goToRentalConfirm() {
      this.$router.push({ name: "rental-confirm" });
    },

    goToRentalStepOne() {
      this.$router.push({ name: "rental-step-1" });
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

      <!-- Router-view med slot til de urørte lån-/community-views der stadig
           modtager data via routeProps og routeListeners.
           HomeView, ItemOverviewView og CreateItemView bruger provide/inject. -->
      <router-view v-slot="{ Component }">
        <component
          :is="Component"
          v-bind="routeProps"
          v-on="routeListeners"
        />
      </router-view>

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
