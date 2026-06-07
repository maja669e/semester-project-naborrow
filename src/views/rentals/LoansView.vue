<script>
// Lån-visning med to perspektiver: lån brugeren låner og lån på brugerens egne genstande.
// Bruger inject: ["authStore"] som alle andre views der tilgår brugertilstand.
import AppHeader     from "@/components/layout/AppHeader.vue";
import LoansOverview from "@/components/rentals/LoansOverview.vue";
import {
  getRentalsByUser,
  getRentalsByOwner,
} from "@/services/rental/rentalservice.js";

export default {
  name: "LoansView",

  components: {
    AppHeader,
    LoansOverview,
  },

  inject: ["authStore"],

  data() {
    return {
      // Aktiv fane: "renter" = jeg låner, "owner" = jeg udlåner
      activePerspective: "renter",

      // Lån brugeren selv har lånt fra andre
      myActiveLoans:    [],
      myCompletedLoans: [],

      // Lån andre har lavet på brugerens egne genstande
      lentActiveLoans:    [],
      lentCompletedLoans: [],

      loading: false,
    };
  },

  async mounted() {
    await this.loadRentals();
  },

  methods: {
    async loadRentals() {
      this.loading = true;

      try {
        const userId = this.authStore.user.value.userID;

        // Henter begge perspektiver parallelt for hurtigere indlæsning
        const [myRentals, lentRentals] = await Promise.all([
          getRentalsByUser(userId),
          getRentalsByOwner(userId),
        ]);

        this.myActiveLoans    = myRentals.filter(r => r.Status === "active");
        this.myCompletedLoans = myRentals.filter(r => r.Status !== "active");

        this.lentActiveLoans    = lentRentals.filter(r => r.Status === "active");
        this.lentCompletedLoans = lentRentals.filter(r => r.Status !== "active");

      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<template>
  <div>

    <AppHeader
      title="Mine lån"
      :show-back="true"
      @back="$router.back()"
    />

    <main class="laan-side">

      <!-- Perspektiv-skifter: to kort der tydeligt adskiller låner og udlåner -->
      <div class="perspektiv-skifter" role="group" aria-label="Vælg perspektiv">

        <!-- aria-pressed kommunikerer den valgte tilstand til skærmlæsere (WCAG 4.1.2) -->
        <button
          class="perspektiv-knap"
          :class="{ 'perspektiv-knap--aktiv': activePerspective === 'renter' }"
          :aria-pressed="activePerspective === 'renter'"
          @click="activePerspective = 'renter'"
        >
          <v-icon class="perspektiv-knap__ikon">mdi-archive-arrow-down-outline</v-icon>
          <span class="perspektiv-knap__titel">Lånt</span>
          <span class="perspektiv-knap__beskrivelse">Genstande jeg låner fra andre</span>
        </button>

        <button
          class="perspektiv-knap"
          :class="{ 'perspektiv-knap--aktiv': activePerspective === 'owner' }"
          :aria-pressed="activePerspective === 'owner'"
          @click="activePerspective = 'owner'"
        >
          <v-icon class="perspektiv-knap__ikon">mdi-archive-arrow-up-outline</v-icon>
          <span class="perspektiv-knap__titel">Udlånt</span>
          <span class="perspektiv-knap__beskrivelse">Mine genstande hos andre</span>
        </button>

      </div>

      <!-- Indlæsningsindikator -->
      <div v-if="loading" class="laan-side__loader">
        <v-progress-circular indeterminate color="primary" />
      </div>

      <!-- Lån-oversigt skifter med perspektiv -->
      <template v-else>

        <!-- Lån brugeren låner fra andre -->
        <LoansOverview
          v-if="activePerspective === 'renter'"
          :active-loans="myActiveLoans"
          :completed-loans="myCompletedLoans"
          :show-renter="false"
          @loan-completed="loadRentals"
        />

        <!-- Lån andre har lavet på brugerens egne genstande -->
        <LoansOverview
          v-else
          :active-loans="lentActiveLoans"
          :completed-loans="lentCompletedLoans"
          :show-renter="true"
          @loan-completed="loadRentals"
        />

      </template>

    </main>

  </div>
</template>

<style scoped>
.laan-side {
  max-width: 700px;
  margin: 0 auto;
  padding: 24px 16px 100px;
}

/* ── Perspektiv-skifter: to kortknapper side om side ──────────── */
.perspektiv-skifter {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 28px;
}

.perspektiv-knap {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  padding: 14px 16px;
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-surface);
  color: var(--color-secondary);
  font-family: var(--font-body);
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s, color 0.2s;
  min-height: var(--touch-target);
  text-align: left;
}

.perspektiv-knap__ikon {
  font-size: 20px !important;
  margin-bottom: 4px;
}

.perspektiv-knap__titel {
  font-size: var(--text-body);
  font-weight: 700;
  color: inherit;
  line-height: 1.2;
}

.perspektiv-knap__beskrivelse {
  font-size: var(--text-meta);
  color: inherit;
  opacity: 0.85;
  line-height: 1.3;
}

/* Aktiv tilstand: fyldt med primærfarve */
.perspektiv-knap--aktiv {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: white;
}

.test-knap {
  opacity: 0.5;
  font-size: var(--text-meta);
}

.laan-side__loader {
  display: flex;
  justify-content: center;
  padding: 48px 0;
}
</style>
