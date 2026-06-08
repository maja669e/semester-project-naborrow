<script>
// Trin 1 i låneanmodnings-flowet — vælg låneperiode og afhentningstidspunkt.
// Modtager item og initialData fra RentalView så formularen gendannes
// korrekt hvis brugeren trykker tilbage fra trin 2.
import MultiStepFormHeader from "@/components/layout/MultiStepFormHeader.vue";
import CalendarPicker      from "@/components/rentals/CalendarPicker.vue";
import PeriodSummary       from "@/components/rentals/PeriodSummary.vue";
import PickupTimeSelector  from "@/components/rentals/PickupTimeSelector.vue";
import FormBottomBar       from "@/components/layout/FormBottomBar.vue";

export default {
  name: "RentalStepOne",

  components: {
    MultiStepFormHeader,
    CalendarPicker,
    PeriodSummary,
    PickupTimeSelector,
    FormBottomBar,
  },

  props: {
    // Det aktuelle trin sendt videre til MultiStepFormHeader
    currentStep: { type: Number, default: 1 },

    // Genstanden der ønskes lånt — bruges til maxDays-validering
    item: { type: Object, default: () => ({}) },

    // Tidligere udfyldte data fra RentalView.
    // Bruges til at gendanne formens tilstand hvis brugeren går tilbage.
    initialData: { type: Object, default: () => ({}) },
  },

  data() {
    return {
      // Gendannes fra initialData hvis brugeren er vendt tilbage fra trin 2
      startDate:  this.initialData.startDate  || "",
      endDate:    this.initialData.endDate    || "",
      pickupTime: this.initialData.pickupTime?.length
        ? [...this.initialData.pickupTime]
        : [],

      errors: {
        dates:      "",
        pickupTime: "",
      },
    };
  },

  computed: {
    // Beregner om formen er gyldig uden at sætte fejlbeskeder.
    // Spejler validate()-logikken og låser næste-knappen via :nextDisabled.
    isFormValid() {
      return (
        this.startDate !== "" &&
        this.endDate !== "" &&
        this.pickupTime.length > 0
      );
    },
  },

  methods: {
    // Validerer at datoer og mindst ét afhentningstidspunkt er valgt,
    // og at perioden ikke overskrider genstandens maksimale låneperiode
    validate() {
      if (!this.startDate || !this.endDate) {
        this.errors.dates = "Vælg start- og slutdato";
        return false;
      }

      if (this.pickupTime.length === 0) {
        this.errors.pickupTime = "Vælg mindst ét tidspunkt";
        return false;
      }

      this.errors.dates      = "";
      this.errors.pickupTime = "";

      const s = new Date(this.startDate);
      s.setHours(0, 0, 0, 0);
      const e = new Date(this.endDate);
      e.setHours(0, 0, 0, 0);
      const diffDays = Math.ceil((e - s) / (1000 * 60 * 60 * 24)) + 1;

      if (this.item?.maxDays && diffDays > this.item.maxDays) {
        this.errors.dates = `Maks ${this.item.maxDays} dage`;
        return false;
      }

      return true;
    },

    // Validerer og sender data op til RentalView via emit
    next() {
      if (!this.validate()) return;
      this.$emit("next-step", {
        startDate:  this.startDate,
        endDate:    this.endDate,
        pickupTime: this.pickupTime,
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

    <h2>Vælg låneperiode</h2>

    <!-- Datoperiode -->
    <section aria-labelledby="periode-overskrift">
      <h3 id="periode-overskrift" class="sr-only">Datoperiode</h3>

      <CalendarPicker
        v-model:startDate="startDate"
        v-model:endDate="endDate"
        :maxDays="item?.maxDays"
      />

      <PeriodSummary
        :startDate="startDate"
        :endDate="endDate"
        :maxDays="item?.maxDays"
      />

      <p v-if="errors.dates" role="alert" class="fejltekst">
        {{ errors.dates }}
      </p>
    </section>

    <!-- Afhentningstidspunkt -->
    <section aria-labelledby="afhentning-overskrift" class="mt-8">
      <h3 id="afhentning-overskrift">Vælg afhentningstidspunkt</h3>
      <p>Vælg det tidspunkt der passer dig</p>

      <PickupTimeSelector v-model="pickupTime" />

      <p v-if="errors.pickupTime" role="alert" class="fejltekst">
        {{ errors.pickupTime }}
      </p>
    </section>

    <!-- Bundbar uden tilbage-knap — brugeren kom hertil fra en genstandsside -->
    <FormBottomBar
      next-label="Næste"
      :show-back="false"
      :above-nav="true"
      :nextDisabled="!isFormValid"
      @next="next"
    />

  </v-container>

</template>

<style scoped>
/* padding-bottom sikrer at indhold ikke skjules bag den faste FormBottomBar og AppBottomNav */
.laanflow-container {
  padding-bottom: calc(128px + env(safe-area-inset-bottom));
}

/* Skjuler tekst visuelt men beholder den for skærmlæsere */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.fejltekst {
  color: var(--color-error);
  font-size: 14px;
  margin-top: 4px;
}
</style>
