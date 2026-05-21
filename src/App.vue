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
      visProfilMenu: false,

      // ── Opret-genstand flow ──────────────────────────────
      visSucces: false,

      // State for genstandsoversigten samlet i ét objekt, så provide()
      // kan levere en reaktiv reference – property-mutationer slår igennem
      // i alle descendant-views der injekterer genstande (som vist i slidesene).
      genstande: {
        genindlaesNoegle: 0,    // Forøges af onItemCreated for at udløse re-fetch
        vistGenstandId:   null, // Id der fremhæves og scrolles til efter oprettelse
      },

      // ── Udlejnings-flow (bruges stadig via routeProps/routeListeners) ──
      // Den genstand brugeren valgte at leje
      selectedRentalItem: null,
      // Samler datoer og detaljer på tværs af laan-trin-1 og laan-trin-2
      rentalDetails: {
        startDate:       "",
        endDate:         "",
        pickupTime:      "",
        accessories:     [],
        acceptedTerms:   false,
        messageToLender: "",
      },
    };
  },

  provide() {
    return {
      genstande: this.genstande,

      gaaTilGenstande:  this.gaaTilGenstande,
      gaaTilOpret:      this.gaaTilOpret,
      genstandOprettet: this.onItemCreated,
      gaaTilHjem:       this.gaaTilHjem,

      // Auth – tilgængeligt i alle descendant-komponenter
      authStore,
    };
  },

  computed: {
    // Oversæt den aktuelle rute til en AppBottomNav-fanepnøgle
    activePage() {
      if (this.visProfilMenu) return "profil";
      const map = { home: "home", community: "homepage", items: "itemOverview" };
      return map[this.$route?.name] || "";
    },

    // Bundnavigationen vises kun på de tre primære sider (ikke på login)
    showBottomNav() {
      return ["home", "community", "items"].includes(this.$route?.name)
        && authStore.erLoggetInd.value;
    },

    // Props der sendes til de urørte lån- og community-views via router-view slot.
    // HomeView, ItemOverviewView og CreateItemView bruger nu provide/inject i stedet.
    routeProps() {
      const name = this.$route?.name;
      if (name === "laan-trin-1") {
        return { item: this.selectedRentalItem, currentStep: 1 };
      }
      if (name === "laan-trin-2") {
        return { item: this.selectedRentalItem, currentStep: 2 };
      }
      if (name === "laan-bekraeft") {
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
      if (name === "laan-trin-1") {
        l["go-to-rental-page-two"] = this.gaaTilLaaneTrinTo;
      }
      if (name === "laan-trin-2") {
        l["save-rental-details"]  = this.gemLaaneDetaljer;
        l["go-to-rental-confirm"] = this.gaaTilLaaneBekraeft;
        l.goBack                  = this.gaaTilLaaneTrinEt;
      }
      if (name === "laan-bekraeft") {
        l.goBack              = () => this.$router.push({ name: "laan-trin-2" });
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
      if (key === "profil") { this.visProfilMenu = true; return; }
      const map = { home: "home", homepage: "community", itemOverview: "items" };
      if (map[key]) this.$router.push({ name: map[key] });
    },

    gaaTilGenstande() {
      this.$router.push({ name: "items" });
    },

    gaaTilOpret() {
      this.$router.push({ name: "opret-genstand" });
    },

    gaaTilHjem() {
      this.$router.push({ name: "home" });
    },

    // ── Opret-genstand flow ──────────────────────────────────
    // Kaldt via provide/inject fra CreateItemView når en genstand er oprettet.
    // Opdaterer genstande-objektet (reaktivt via provide) og viser success-dialog.
    onItemCreated(newId) {
      this.genstande.vistGenstandId  = newId;
      this.genstande.genindlaesNoegle += 1;
      this.visSucces = true;
      this.$router.push({ name: "items" });
    },

    handleSuccessBack() {
      this.visSucces = false;
      this.genstande.vistGenstandId = null;
    },

    // ── Udlejnings-flow (kaldt via routeListeners fra lån-views) ────────────
    startRentalFlow(item) {
      this.selectedRentalItem = item;
      this.$router.push({ name: "laan-trin-1" });
    },

    gaaTilLaaneTrinTo(data) {
      this.rentalDetails.startDate  = data.startDate;
      this.rentalDetails.endDate    = data.endDate;
      this.rentalDetails.pickupTime = data.pickupTime;
      this.$router.push({ name: "laan-trin-2" });
    },

    gemLaaneDetaljer(data) {
      this.rentalDetails.messageToLender = data.messageToLender;
      this.rentalDetails.accessories     = data.accessories;
    },

    gaaTilLaaneBekraeft() {
      this.$router.push({ name: "laan-bekraeft" });
    },

    gaaTilLaaneTrinEt() {
      this.$router.push({ name: "laan-trin-1" });
    },

    // Logger brugeren ud, lukker profilmenuen og sender til login-siden
    logUd() {
      authStore.logUd();
      this.visProfilMenu = false;
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
      v-model="visSucces"
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
    <v-bottom-sheet v-model="visProfilMenu" max-width="600">
      <v-sheet class="profil-ark">

        <!-- Brugerinfo øverst i arket -->
        <div class="profil-ark__bruger">
          <v-icon size="48" color="var(--color-primary)">mdi-account-circle</v-icon>
          <div class="profil-ark__navn">
            <span class="profil-ark__fulde-navn">
              {{ authStore.bruger.value?.firstName }} {{ authStore.bruger.value?.lastName }}
            </span>
            <span class="profil-ark__email">{{ authStore.bruger.value?.email }}</span>
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
          @click="logUd"
        >
          Log ud
        </v-btn>

        <!-- Luk-knap -->
        <v-btn
          block
          variant="text"
          class="mt-2 profil-ark__luk"
          @click="visProfilMenu = false"
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
