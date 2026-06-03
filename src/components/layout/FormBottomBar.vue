<script>
// Fast bundhandlingsbar der bruges på hvert trin i en flertrinsformular.
// Udtrukket for at undgå at gentage det samme to-knapslayout på tværs af
// ItemBasicInfoStep, ItemDetailsStep, ConfirmItemScreen og rental-flowet.
export default {
  name: "FormBottomBar",

  props: {
    // Tekst på tilbage-knappen til venstre
    backLabel: { type: String, default: "Tilbage" },

    // Tekst på den primære knap til højre
    nextLabel: { type: String, default: "Næste" },

    // Viser en indlæsningsindikator på den primære knap under en asynkron handling
    nextLoading: { type: Boolean, default: false },

    // Deaktiverer tilbage-knappen (fx på første trin)
    backDisabled: { type: Boolean, default: false },

    // Skjuler tilbage-knappen helt — bruges når siden kun har én handling
    showBack: { type: Boolean, default: true },

    // Løfter baren 64px op over AppBottomNav — bruges i flows
    // hvor bundnavigationen er synlig (fx rental-flowet)
    aboveNav: { type: Boolean, default: false },
  },

  emits: [
    "back", // Udsendes når brugeren trykker på tilbage-knappen
    "next", // Udsendes når brugeren trykker på den primære knap
  ],
};
</script>

<template>
  <!-- Fast bar i bunden; sider skal tilføje padding-bottom
       så indhold ikke gemmes bag den.
       :style binder bottom dynamisk: 64px over AppBottomNav eller 0. -->
  <div
    class="bundbar"
    :style="{ bottom: aboveNav ? '64px' : '0' }"
  >

    <!-- Sekundær: naviger til forrige trin (skjules hvis showBack er false) -->
    <v-btn
      v-if="showBack"
      variant="tonal"
      rounded="lg"
      color="grey-darken-2"
      class="bundbar__tilbage"
      :disabled="backDisabled"
      @click="$emit('back')"
    >
      <v-icon start size="18">mdi-chevron-left</v-icon>
      {{ backLabel }}
    </v-btn>

    <!-- Primær: valider og gå videre til næste trin -->
    <v-btn
      color="primary"
      rounded="lg"
      class="bundbar__naeste"
      :class="{ 'bundbar__naeste--fuld': !showBack }"
      :loading="nextLoading"
      @click="$emit('next')"
    >
      {{ nextLabel }}
    </v-btn>

  </div>
</template>

<style scoped>
/* ─── Barens container ───────────────────────────────────── */
.bundbar {
  position: fixed;
  left: 0;
  right: 0;
  background: white;
  border-top: 1px solid #e5e7eb;
  padding: 16px;
  display: flex;
  gap: 12px;
}

/* ─── Tilbage-knap ───────────────────────────────────────── */
/* flex: 1 giver den ca. en fjerdedel af barens bredde */
.bundbar__tilbage {
  flex: 1;
  text-transform: none;
  height: 48px !important;
}

/* ─── Primær næste-knap ──────────────────────────────────── */
/* flex: 3 giver den tre fjerdedele — eller fuld bredde hvis der er ingen tilbage-knap */
.bundbar__naeste {
  flex: 3;
  text-transform: none;
  height: 48px !important;
}

.bundbar__naeste--fuld {
  flex: 1;
}
</style>
