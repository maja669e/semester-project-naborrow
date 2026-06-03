<script>
// Trin 1 i låneanmodnings-flowet — vælg låneperiode og afhentningstidspunkt.
import Stepper            from "@/components/Stepper.vue";
import CalendarPicker     from "@/components/rentals/CalendarPicker.vue";
import PeriodSummary      from "@/components/rentals/PeriodSummary.vue";
import PickupTimeSelector from "@/components/rentals/PickupTimeSelector.vue";
import FormBottomBar      from "@/components/layout/FormBottomBar.vue";

export default {
  name: "RentalPageOne",

  components: {
    Stepper,
    CalendarPicker,
    PeriodSummary,
    PickupTimeSelector,
    FormBottomBar,
  },

  inject: ["rental", "saveRentalStep1"],

  data() {
    return {
      startDate: "",
      endDate: "",
      pickupTime: [],

      errors: {
        dates: "",
        pickupTime: "",
      },
    };
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

      this.errors.dates = "";
      this.errors.pickupTime = "";

      const s = new Date(this.startDate);
      s.setHours(0, 0, 0, 0);
      const e = new Date(this.endDate);
      e.setHours(0, 0, 0, 0);

      const diffDays = Math.ceil((e - s) / (1000 * 60 * 60 * 24)) + 1;

      if (this.rental.item?.maxDays && diffDays > this.rental.item.maxDays) {
        this.errors.dates = `Maks ${this.rental.item.maxDays} dage`;
        return false;
      }

      return true;
    },

    // Validerer og kalder den injekterede saveRentalStep1 fra App.vue
    next() {
      if (!this.validate()) return;

      this.saveRentalStep1({
        startDate:  this.startDate,
        endDate:    this.endDate,
        pickupTime: this.pickupTime,
      });
    },
  },
};


</script>

<template>

  <v-container class="pa-4 page">

    <Stepper
      :currentStep="1"
      :steps="['Periode', 'Afhentning', 'Bekræft']"
    />

    <h2>Vælg låneperiode</h2>

    <CalendarPicker
      v-model:startDate="startDate"
      v-model:endDate="endDate"
      :maxDays="rental.item?.maxDays"
    />

    <PeriodSummary
      :startDate="startDate"
      :endDate="endDate"
      :maxDays="rental.item?.maxDays"
    />
    <p v-if="errors.dates" role="alert" class="error-text">
      {{ errors.dates }}
    </p>

    
<section class="pickuptime">
  <h3>Vælg afhentningstidspunkt</h3>
  <p>Vælg det tidspunkt der passer dig</p>
<PickupTimeSelector
  v-model="pickupTime"
/>

<p v-if="errors.pickupTime" role="alert" class="error-text">
  {{ errors.pickupTime }}
</p>
</section>


    <!-- Bundbar uden tilbage-knap — brugeren kom hertil ved at trykke på en genstand -->
    <FormBottomBar
      next-label="Næste"
      :show-back="false"
      :above-nav="true"
      @next="next"
    />

  </v-container>

</template>

<style scoped>

.error-text {
  color: #B00020;
  font-size: 14px;
  margin-top: 4px;
}

.pickuptime {
  margin-top: 32px;
}
.page {
  padding-bottom: 200px; /* space for bottom button */
}
</style>