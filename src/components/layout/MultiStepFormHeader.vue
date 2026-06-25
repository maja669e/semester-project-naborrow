<script>
// Genanvendelig header til flertrinsformularer.
// Viser en centreret titel i en toolbar, en visuel adskiller og
// en trinindikator — alt hvad hvert formulartrin behøver øverst.
export default {
  name: "MultiStepFormHeader",

  props: {
    // Titel vist i toolbaren (fx "Opret ny genstand")
    title: { type: String, required: true },

    // Det aktuelle trins indeks (1-baseret)
    currentStep: { type: Number, required: true },

    // Labels til hvert trin (fx ["Grundinfo", "Detaljer", "Forhåndsvisning"])
    steps: { type: Array, required: true },
  },
};
</script>

<template>
  <!-- Semantisk header-landmark der omslutter toolbar og trinindikator -->
  <header>

    <!-- Titel-bjælke: egen fuld-bredde header øverst.
         Spacer til højre holder titlen visuelt centreret. -->
    <v-toolbar flat color="surface" class="form-titlebar">
      <v-toolbar-title class="text-center font-weight-bold">
        {{ title }}
      </v-toolbar-title>
      <div style="width: 40px" aria-hidden="true"></div>
    </v-toolbar>

    <!-- Trinindikator: separat blok under titlen.
         Markerer afsluttede trin med flueben og fremhæver det aktuelle. -->
    <div class="stepper-wrapper">
      <template v-for="(step, index) in steps" :key="index">

        <div
          class="step-item"
          :class="{
            done:   index + 1 < currentStep,
            active: index + 1 === currentStep,
          }"
        >
          <div class="step-circle">
            <v-icon v-if="index + 1 < currentStep" size="16" icon="mdi-check" />
            <span v-else>{{ index + 1 }}</span>
          </div>
          <span>{{ step }}</span>
        </div>

        <div
          v-if="index < steps.length - 1"
          class="step-line"
          :class="{ done: index + 1 < currentStep }"
        ></div>

      </template>
    </div>

  </header>
</template>

<style scoped>
/* ─── Titel-bjælke (egen header) ─────────────────────────────
   Stregen under adskiller titlen fra stepperen, så titlen står som
   sin egen header-blok. */
.form-titlebar {
  border-bottom: 1px solid var(--color-border);
}

/* ─── Trinindikator (separat blok under titlen) ──────────────
   Ligger inde i indholdets padding (ikke full-bleed), med lidt luft
   over, så den læses som en blok adskilt fra titel-bjælken. */
.stepper-wrapper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  padding: 12px 16px;
}

.step-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--color-text-secondary);
}

.step-circle {
  width: 24px;
  height: 24px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
}

.step-item.done .step-circle,
.step-item.active .step-circle {
  background: var(--color-primary);
  color: var(--color-surface);
}

/* Kun det direkte label-span (fx "Grundinfo") — IKKE tal-spannet inde i
   .step-circle, ellers overskrives det hvide tal på den aktive cirkel. */
.step-item.active > span {
  color: var(--color-neutral);
  font-weight: 600;
}

.step-line {
  flex: 1;
  height: 2px;
  min-width: 16px;
  background: var(--color-border);
}

.step-line.done {
  background: var(--color-primary);
}
</style>
