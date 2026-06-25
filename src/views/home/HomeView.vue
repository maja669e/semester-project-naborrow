<script>
// Velkomstside – første visning brugeren ser ved opstart.
// Indeholder et velkomstbillede og navigation til genstandsoversigt og lån.
// Navigation sker via RouterLink (:to) direkte på knapperne.
export default {
  name: "HomeView",
};
</script>

<template>
  <div class="forside-baggrund">
    <v-container class="text-center">

      <!-- Velkomsttekst -->
      <h1 class="mt-15 mb-15">Velkommen til dit lokale fællesskab</h1>

      <!-- Illustrationsbillede af fællesskabet -->
      <v-img
        src="@/assets/images/community.jpg"
        alt="Et lokalt fællesskab der deler genstande med hinanden"
        class="velkomst-billede mb-4"
        max-width="500"
        contain
      />

      <div class="flex-grow-1"></div>

      <!-- Primær navigation til de to hovedsektioner -->
      <nav aria-label="Hovednavigation">
        <v-row>

          <!-- Naviger til brugerens egne genstande via RouterLink -->
          <v-col cols="12">
            <v-btn
              color="primary"
              class="navigations-knap mt-15"
              size="large"
              :to="{ name: 'items' }"
            >
              Dine genstande
            </v-btn>
          </v-col>

        </v-row>
      </nav>

    </v-container>
  </div>
</template>

<style scoped>
/* ─── Sidebagggrund ──────────────────────────────────────── */
.forside-baggrund {
  background-color: var(--color-bg);
  min-height: 100vh;
  /* Gør plads til den faste AppBottomNav (64px) så "Dine genstande"-knappen
     ikke gemmes bag den. På lave vinduer skubber det indholdet højere end
     skærmen, så siden kan scrolles ned til knappen. */
  padding-bottom: calc(80px + env(safe-area-inset-bottom));
}

/* ─── Velkomstbillede ────────────────────────────────────── */
.velkomst-billede {
  margin: 0 auto;
}

/* ─── Navigationsknapper ─────────────────────────────────── */
/* Farve håndteres af Vuetify via color="primary" — kun layout her */
.navigations-knap {
  min-width: 200px;
}
</style>
