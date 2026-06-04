<script>
// Orkestreringsvisning for låneanmodnings-flowet.
// Styrer hvilket trin der vises og samler data fra begge formtrin
// i rentalData, så formularen gendannes korrekt hvis brugeren
// trykker tilbage og retter sine svar.
//
// rental injekteres fra App.vue via provide/inject — kun item-feltet
// bruges her; formdata lever lokalt i rentalData.
import RentalStepOne    from "@/components/rentals/RentalStepOne.vue";
import RentalStepTwo    from "@/components/rentals/RentalStepTwo.vue";
import RentalConfirmStep from "@/components/rentals/RentalConfirmStep.vue";

export default {
  name: "RentalView",
  components: { RentalStepOne, RentalStepTwo, RentalConfirmStep },

  inject: ["rental"],

  data() {
    return {
      // Aktivt trin i formularen (1 = periode, 2 = afhentning, 3 = bekræftelse)
      step: 1,

      // Akkumuleret formdata fra begge formtrin
      rentalData: {
        startDate:       "",
        endDate:         "",
        pickupTime:      [],
        accessories:     [],
        messageToLender: "",
      },
    };
  },

  methods: {
    // Modtager data fra trin 1, gemmer det og går til trin 2
    handleStepOne(data) {
      this.rentalData.startDate  = data.startDate;
      this.rentalData.endDate    = data.endDate;
      this.rentalData.pickupTime = data.pickupTime;
      this.step = 2;
    },

    // Modtager data fra trin 2, gemmer det og går til trin 3
    handleStepTwo(data) {
      this.rentalData.accessories     = data.accessories;
      this.rentalData.messageToLender = data.messageToLender;
      this.step = 3;
    },

    // Låneanmodning bekræftet — navigér til fællesskabssiden
    handleConfirmed() {
      this.$router.push({ name: "community" });
    },
  },
};
</script>

<template>

  <!-- Trin 1: Vælg låneperiode og afhentningstidspunkt -->
  <RentalStepOne
    v-if="step === 1"
    :currentStep="1"
    :item="rental.item"
    :initialData="rentalData"
    @next-step="handleStepOne"
  />

  <!-- Trin 2: Vælg tilbehør og skriv besked til udlåner -->
  <RentalStepTwo
    v-if="step === 2"
    :currentStep="2"
    :item="rental.item"
    :initialData="rentalData"
    @next-step="handleStepTwo"
    @go-back="step = 1"
  />

  <!-- Trin 3: Gennemse opsummering, acceptér vilkår og send anmodning -->
  <RentalConfirmStep
    v-if="step === 3"
    :currentStep="3"
    :item="rental.item"
    :rentalData="rentalData"
    @go-back="step = 2"
    @rental-confirmed="handleConfirmed"
  />

</template>
