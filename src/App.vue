<script>
// Rod-komponent for naborrow SPA.
// Ansvaret er:
//   1. Vise den aktuelle rute via <router-view>
//   2. Levere tværgående tilstand til de redigerede views via provide()
//   3. Videregive props/events til de urørte lån- og community-views via routeProps/routeListeners
//   4. Vise AppBottomNav og SuccessDialog uden for ruterne
import AppBottomNav  from "@/components/layout/AppBottomNav.vue";
import SuccessDialog from "@/components/SuccessDialog.vue";

export default {
  components: { AppBottomNav, SuccessDialog },

  data() {
    return {
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

  // Eksponér state og metoder til de views vi har arbejdet på (HomeView,
  // ItemOverviewView, CreateItemView). Da vi leverer objektreferencer fra
  // data() er property-mutations reaktive i descendant-views der injekterer dem
  // – præcis som vist i "Data + provide"-slidet.
  provide() {
    return {
      // State-referencer (reaktive fordi de peger på data()-objekter)
      genstande: this.genstande,

      // Metoder til navigation og state-mutation
      gaaTilGenstande:  this.gaaTilGenstande,
      gaaTilOpret:      this.gaaTilOpret,
      genstandOprettet: this.onItemCreated,
    };
  },

  computed: {
    // Oversæt den aktuelle rute til en AppBottomNav-fanepnøgle
    activePage() {
      const map = { home: "home", community: "homepage", items: "itemOverview" };
      return map[this.$route?.name] || "";
    },

    // Bundnavigationen vises kun på de tre primære sider
    showBottomNav() {
      return ["home", "community", "items"].includes(this.$route?.name);
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
    // Oversæt AppBottomNav-fanepnøgle til et rutenavn og naviger
    navigateTo(key) {
      const map = { home: "home", homepage: "community", itemOverview: "items" };
      if (map[key]) this.$router.push({ name: map[key] });
    },

    gaaTilGenstande() {
      this.$router.push({ name: "items" });
    },

    gaaTilOpret() {
      this.$router.push({ name: "opret-genstand" });
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

    <!-- Bundnavigation vises kun på de tre primære sider -->
    <AppBottomNav
      v-if="showBottomNav"
      :activePage="activePage"
      @navigate="navigateTo"
    />

  </v-app>
</template>
