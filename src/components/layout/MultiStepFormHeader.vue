<script>
// Genanvendelig header til flertrinsformularer.
// Viser en centreret titel i en toolbar, en visuel adskiller og
// Stepper-komponenten, så hvert formulartrin ser identisk ud uden duplikering.
import Stepper from "@/components/Stepper.vue";

export default {
  name: "MultiStepFormHeader",
  components: { Stepper },

  props: {
    // Titel vist i toolbaren (fx "Opret ny genstand")
    title: { type: String, required: true },

    // Det aktuelle trins indeks sendt direkte videre til Stepper
    currentStep: { type: Number, required: true },

    // Labels til hvert trin vist i Stepper (fx ["Grundinfo", "Detaljer", "Forhåndsvisning"])
    steps: { type: Array, required: true },
  },
};
</script>

<template>
  <!-- Semantisk header-landmark der omslutter toolbar og trinindikator -->
  <header>

    <!-- Toolbar med centreret titel og fast-bredde spacer til højre
         for at holde titlen visuelt centreret (samme princip som AppHeader) -->
    <v-toolbar flat color="white">
      <v-toolbar-title class="text-center font-weight-bold">
        {{ title }}
      </v-toolbar-title>
      <div style="width: 40px" aria-hidden="true"></div>
    </v-toolbar>

    <!-- Visuel adskiller mellem toolbar og trinindikator -->
    <v-divider />

    <!-- Trinindikator der viser fremskridt i formularen -->
    <Stepper :currentStep="currentStep" :steps="steps" />

  </header>
</template>
