<script>
// Fast bundhandlingsbar der bruges på hvert trin i en flertrinsformular.
// Udtrukket for at undgå at gentage det samme to-knapslayout i
// ItemBasicInfoStep, ItemDetailsStep og ConfirmItemScreen.
export default {
  name: "FormBottomBar",

  props: {
    // Tekst på tilbage-knappen til venstre
    backLabel: { type: String, default: "Tilbage" },

    // Tekst på den primære knap til højre
    nextLabel: { type: String, default: "Næste" },

    // Viser en indlæsningsindikator på den primære knap under en asynkron handling
    nextLoading: { type: Boolean, default: false },

    // Deaktiverer tilbage-knappen (fx på første trin hvor det at gå tilbage vil afslutte flowet)
    backDisabled: { type: Boolean, default: false },
  },

  emits: [
    "back", // Udsendes når brugeren trykker på tilbage-knappen
    "next", // Udsendes når brugeren trykker på den primære knap
  ],
};
</script>

<template>
  <!-- Fast bar i bunden; sider skal tilføje padding-bottom
       så indhold ikke gemmes bag den -->
  <div class="bundbar">

    <!-- Sekundær: naviger til forrige trin -->
    <v-btn
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
      :loading="nextLoading"
      @click="$emit('next')"
    >
      {{ nextLabel }}
    </v-btn>

  </div>
</template>

<style scoped>
/* ─── Barens container ───────────────────────────────────── */
/* Fast placeret så den altid er synlig mens brugeren scroller i formularen */
.bundbar {
  position: fixed;
  bottom: 0;
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
/* flex: 3 giver den tre fjerdedele af barens bredde
   og gør den til den tydelige primære handling */
.bundbar__naeste {
  flex: 3;
  text-transform: none;
  height: 48px !important;
}
</style>
