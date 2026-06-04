<script>
// Trin 2 i låneanmodnings-flowet — vælg tilbehør og skriv besked til udlåner.
import Stepper         from "@/components/Stepper.vue";
import PickAccessories from "@/components/rentals/PickAccessories.vue";
import FormBottomBar   from "@/components/layout/FormBottomBar.vue";

export default {
  name: "RentalPageTwo",

  components: {
    Stepper,
    PickAccessories,
    FormBottomBar,
  },

  inject: ["rental", "saveRentalStep2"],

  data() {
    return {
      accessories: [],
      messageToLender: "",
    };
  },

  methods: {
    // Kalder den injekterede saveRentalStep2 fra App.vue og navigerer til bekræftelse
    next() {
      this.saveRentalStep2({
        accessories:     this.accessories,
        messageToLender: this.messageToLender,
      });
    },
  },
};
</script>

<template>

  <v-container class="pa-4">

    <!-- Stepper -->
    <Stepper
      :currentStep="2"
      :steps="['Periode', 'Afhentning', 'Bekræft']"
    />

    <h2>Afhentning</h2>

   <h3>Vælg ønsket tilbehør</h3>
    <!-- Accessories -->
    <PickAccessories
      v-model="accessories"
      :accessories="rental.item?.accessories"
    />

    <v-textarea
  v-model="messageToLender"
  label="Besked til udlåner"
  placeholder="Skriv en besked..."
  variant="outlined"
  rounded="xl"
  rows="4"
  class="mt-6"
/>

    <!-- Bundbar med tilbage og næste -->
    <FormBottomBar
      :above-nav="true"
      @back="$router.push({ name: 'rental-step-1' })"
      @next="next"
    />

  </v-container>

</template>

<style scoped>

.page {
  padding-bottom: 100px;
}

</style>