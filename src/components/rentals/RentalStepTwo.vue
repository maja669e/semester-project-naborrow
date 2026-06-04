<script>
// Trin 2 i låneanmodnings-flowet — vælg tilbehør og skriv besked til udlåner.
// Modtager item og initialData fra RentalView så formularen gendannes
// korrekt hvis brugeren trykker tilbage fra trin 3.
import MultiStepFormHeader from "@/components/layout/MultiStepFormHeader.vue";
import PickAccessories     from "@/components/rentals/PickAccessories.vue";
import FormBottomBar       from "@/components/layout/FormBottomBar.vue";

export default {
  name: "RentalStepTwo",

  components: {
    MultiStepFormHeader,
    PickAccessories,
    FormBottomBar,
  },

  props: {
    // Det aktuelle trin sendt videre til MultiStepFormHeader
    currentStep: { type: Number, default: 2 },

    // Genstanden der ønskes lånt — bruges til at hente tilgængeligt tilbehør
    item: { type: Object, default: () => ({}) },

    // Tidligere udfyldte data fra RentalView.
    // Bruges til at gendanne formens tilstand hvis brugeren går tilbage.
    initialData: { type: Object, default: () => ({}) },
  },

  data() {
    return {
      // Gendannes fra initialData hvis brugeren er vendt tilbage fra trin 3
      accessories:     this.initialData.accessories?.length
        ? [...this.initialData.accessories]
        : [],
      messageToLender: this.initialData.messageToLender || "",
    };
  },

  methods: {
    // Sender valgt tilbehør og besked op til RentalView via emit
    next() {
      this.$emit("next-step", {
        accessories:     this.accessories,
        messageToLender: this.messageToLender,
      });
    },
  },
};
</script>

<template>

  <v-container class="pa-4 laanflow-container">

    <!-- Formularhoved med titel og trinindikator -->
    <MultiStepFormHeader
      title="Låneanmodning"
      :currentStep="currentStep"
      :steps="['Periode', 'Afhentning', 'Bekræft']"
    />

    <h2>Afhentning</h2>

    <!-- Tilbehørsvalg -->
    <section aria-labelledby="tilbehoer-overskrift">
      <h3 id="tilbehoer-overskrift">Vælg ønsket tilbehør</h3>

      <PickAccessories
        v-model="accessories"
        :accessories="item?.accessories"
      />
    </section>

    <!-- Besked til udlåner -->
    <section aria-labelledby="besked-overskrift" class="mt-6">
      <h3 id="besked-overskrift">Besked til udlåner</h3>

      <v-textarea
        v-model="messageToLender"
        label="Besked til udlåner"
        placeholder="Skriv en besked..."
        variant="outlined"
        rounded="xl"
        rows="4"
        class="mt-2"
      />
    </section>

    <!-- Bundbar med tilbage og næste -->
    <FormBottomBar
      :above-nav="true"
      @back="$emit('go-back')"
      @next="next"
    />

  </v-container>

</template>

<style scoped>
/* padding-bottom sikrer at indhold ikke skjules bag den faste FormBottomBar og AppBottomNav */
.laanflow-container {
  padding-bottom: calc(128px + env(safe-area-inset-bottom));
}
</style>
