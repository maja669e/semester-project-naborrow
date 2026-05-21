<script>
// Velkomstside – første visning brugeren ser ved opstart.
// Indeholder et velkomstbillede og navigation til genstandsoversigt og lån.
export default {
  name: "HomeView",

  emits: [
    "go-to-items", // Udsendes når brugeren trykker på "Dine genstande"
  ],
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

          <!-- Naviger til brugerens egne genstande -->
          <v-col cols="12">
            <v-btn
              class="genstande-knap mt-15"
              size="large"
              @click="$emit('go-to-items')"
            >
              Dine genstande
            </v-btn>
          </v-col>

          <!-- Naviger til brugerens aktive lån -->
          <v-col cols="12">
            <v-btn class="laan-knap" size="large">Dine lån</v-btn>
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
}

/* ─── Velkomstbillede ────────────────────────────────────── */
.velkomst-billede {
  margin: 0 auto;
}

/* ─── Navigationsknapper ─────────────────────────────────── */
.genstande-knap,
.laan-knap {
  background-color: var(--color-primary);
  color: white;
  font-weight: normal;
  min-width: 200px;
  border-radius: var(--radius-md);
}
</style>
