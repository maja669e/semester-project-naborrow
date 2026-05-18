<script>
import Stepper from "@/components/Stepper.vue";
import CalendarPicker from "@/components/rentals/CalendarPicker.vue";
import PeriodSummary from "@/components/rentals/PeriodSummary.vue";
import PickupTimeSelector from "@/components/rentals/PickupTimeSelector.vue";

export default {
  name: "RentalPageOne",

  components: {
    Stepper,
    CalendarPicker,
    PeriodSummary,
    PickupTimeSelector,
  },

  props: {
    currentStep: Number,
  },

  data() {
    return {
      startDate: "",
      endDate: "",
      pickupTime: "",

      errors: {
        dates: "",
        pickupTime: "",
      },
    };
  },


watch: {
  startDate(val) {
    console.log("START UPDATED:", val)
  },
  endDate(val) {
    console.log("END UPDATED:", val)
  }
},


  methods: { 
   validate() {

  if (!this.startDate || !this.endDate) {
    this.errors.dates = "Vælg start- og slutdato";
    return false;
  }

  if (!this.pickupTime) {
    this.errors.pickupTime = "Vælg et tidspunkt";
    return false;
  }

  this.errors.dates = "";
  this.errors.pickupTime = "";

  return true;
},
    next() {
      if (!this.validate()) return;
       

     this.$emit("go-to-rental-page-two", {
    startDate: this.startDate,
    endDate: this.endDate,
    pickupTime: this.pickupTime,
});

       console.log({
    startDate: this.startDate,
    endDate: this.endDate,
    pickupTime: this.pickupTime,
  });
    },
  },
};


</script>

<template>

  <v-container class="pa-4 page">

    <Stepper
      :currentStep="currentStep"
      :steps="['Periode', 'Afhentning', 'Bekræft']"
    />

    <h2>Vælg låneperiode</h2>

    <CalendarPicker
      v-model:startDate="startDate"
      v-model:endDate="endDate"
    />

  
    <PeriodSummary
      :startDate="startDate"
      :endDate="endDate"
    />
    <div v-if="errors.dates" class="error-text">
      {{ errors.dates }}
    </div>

    
<section class="pickuptime">
  <h3>Vælg afhentningstidspunkt</h3>
  <p>Vælg det tidspunkt der passer dig</p>
<PickupTimeSelector
  v-model="pickupTime"
/>

<div
  v-if="errors.pickupTime"
  class="error-text"
>
  {{ errors.pickupTime }}
</div>
</section>


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

<style scoped>

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;

  background: white;
  border-top: 1px solid #e5e7eb;
  z-index: 10;
  padding: 16px;
}

.create-button {
  width: 100%;
  text-transform: none;
  height: 48px !important;
}

.error-text {
  color: #B00020;
  font-size: 14px;
  margin-top: 4px;
}

.pickuptime {
  margin-top: 32px;
}
.page {
  padding-bottom: 120px; /* space for bottom button */
}
</style>