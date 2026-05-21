<script>
// Simpel visning der præsenterer brugerens genstande.
// Bruges kun som opstartsside – selve listevisningen håndteres af ItemOverviewView.
export default {
  name: "MyItemsView",

  emits: [
    "go-to-page-one", // Udsendes når brugeren vil oprette en ny genstand
  ],
};
</script>

<template>
  <v-container class="text-center">

    <!-- Sideoverskrift -->
    <h1 class="mt-15 mb-2">Dine genstande</h1>

    <!-- Opret ny genstand -->
    <v-row>
      <v-col cols="12">
        <v-btn
          class="ny-genstand-knap ma-2"
          size="large"
          @click="$emit('go-to-page-one')"
        >
          + Opret genstand
        </v-btn>
      </v-col>
    </v-row>

  </v-container>
</template>

<style scoped>
/* ─── Opret-knap ─────────────────────────────────────────── */
.ny-genstand-knap {
  background-color: var(--color-primary);
  color: white;
  font-weight: normal;
  min-width: 200px;
  border-radius: var(--radius-md);
}
</style>
