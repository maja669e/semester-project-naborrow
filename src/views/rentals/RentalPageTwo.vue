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

  props: {
    currentStep: Number,
     item: {
    type: Object,
    required: true,
  },
  },

  data() {
    return {
      accessories: [],
      messageToLender: "",
    };
  },

  methods: {
    // Gemmer tilbehør og besked i App.vue og navigerer til bekræftelsestrinnet
    next() {
      this.$emit("save-rental-details", {
        accessories:     this.accessories,
        messageToLender: this.messageToLender,
      });
      this.$emit("go-to-rental-confirm");
    },
  },
};
</script>

<template>

  <v-container class="pa-4">

    <!-- Stepper -->
    <Stepper
      :currentStep="currentStep"
      :steps="['Periode', 'Afhentning', 'Bekræft']"
    />

    <h2>Afhentning</h2>

   <h3>Vælg ønsket tilbehør</h3>
    <!-- Accessories -->
    <PickAccessories
      v-model="accessories"
      :accessories="item.accessories"
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
      @back="$emit('goBack')"
      @next="next"
    />

  </v-container>

</template>

<style scoped>

.page {
  padding-bottom: 100px;
}

</style>