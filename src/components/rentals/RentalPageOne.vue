<script>
import Stepper from "@/components/Stepper.vue";
import CalendarPicker from "./CalendarPicker.vue";
import PeriodSummary from "./PeriodSummary.vue";

export default {
  name: "RentalPageOne",

  components: {
    Stepper,
    CalendarPicker,
    PeriodSummary,
  },

  props: {
    currentStep: Number,
  },

  data() {
    return {
      startDate: "",
      endDate: "",

      errors: {
        dates: "",
      },
    };
  },

  methods: {
    validate() {
      if (!this.startDate || !this.endDate) {
        this.errors.dates = "Vælg start- og slutdato";
        return false;
      }

      this.errors.dates = "";
      return true;
    },

    next() {
      if (!this.validate()) return;
       

      this.$emit("go-to-rental-page-two", {
        startDate: this.startDate,
        endDate: this.endDate,
      });

       console.log({
    startDate: this.startDate,
    endDate: this.endDate,
  });
    },
  },
};
</script>

<template>

  <v-container class="pa-4">

    <Stepper
      :currentStep="currentStep"
      :steps="['Periode', 'Afhentning', 'Bekræft']"
    />

    <h2>Vælg låneperiode</h2>

    <CalendarPicker
      v-model:startDate="startDate"
      v-model:endDate="endDate"
    />

    <label>Valgt låneperiode</label>
    <PeriodSummary
      :startDate="startDate"
      :endDate="endDate"
    />

    <div v-if="errors.dates" class="error-text">
      {{ errors.dates }}
    </div>

    <div class="bottom-bar">

      <v-btn
        color="primary"
        rounded="lg"
        class="create-button"
        @click="next"
      >
        Næste
      </v-btn>

    </div>

  </v-container>

</template>