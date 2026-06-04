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

    <!-- Toolbar med centreret titel og fast-bredde spacer til højre
         for at holde titlen visuelt centreret -->
    <v-toolbar flat color="white">
      <v-toolbar-title class="text-center font-weight-bold">
        {{ title }}
      </v-toolbar-title>
      <div style="width: 40px" aria-hidden="true"></div>
    </v-toolbar>

    <v-divider />

    <!-- Trinindikator: markerer afsluttede trin med flueben og fremhæver det aktuelle -->
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
            <v-icon v-if="index + 1 < currentStep" size="16">mdi-check</v-icon>
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
/* ─── Trinindikator ──────────────────────────────────────── */
.stepper-wrapper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  padding: 16px 20px 8px;
}

.step-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #6b7280;
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
  color: white;
}

.step-item.active span {
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
