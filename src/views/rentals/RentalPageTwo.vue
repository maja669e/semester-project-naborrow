<script>
import Stepper from "@/components/Stepper.vue";

import PickupTimeSelector from "./components/rentals/PickupTimeSelector.vue";
import PickAccessories from "./components/rentals/PickAccessories.vue";

export default {
  name: "RentalPageTwo",

  components: {
    Stepper,
    PickupTimeSelector,
    PickAccessories,
  },

  props: {
    currentStep: Number,
  },

  data() {
    return {
      pickupTime: "",
      accessories: [],

      errors: {
        pickupTime: "",
      },
    };
  },

  methods: {
    validate() {
      if (!this.pickupTime) {
        this.errors.pickupTime = "Vælg et tidspunkt";
        return false;
      }

      this.errors.pickupTime = "";
      return true;
    },

    next() {
      if (!this.validate()) return;

      this.$emit("save-rental-details", {
        pickupTime: this.pickupTime,
        accessories: this.accessories,
      });
      console.log({
  pickupTime: this.pickupTime,
  accessories: this.accessories,
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

    <p>
      Vælg tidspunkt og tilbehør til lånet.
    </p>

    <!-- Pickup time -->
    <PickupTimeSelector
      v-model="pickupTime"
    />

    <div
      v-if="errors.pickupTime"
      class="error-text"
    >
      {{ errors.pickupTime }}
    </div>

    <!-- Accessories -->
    <PickAccessories
      v-model="accessories"
    />

    <!-- Buttons -->
    <div class="bottom-bar">

      <v-btn
        variant="tonal"
        rounded="lg"
        color="grey-darken-2"
        class="back-button"
        @click="$emit('goBack')"
      >
        <v-icon start size="18">
          mdi-chevron-left
        </v-icon>

        Tilbage
      </v-btn>

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

  padding: 16px;

  display: flex;
  gap: 12px;
}

.back-button {
  flex: 1;
  text-transform: none;
  height: 48px !important;
}

.create-button {
  flex: 3;
  text-transform: none;
  height: 48px !important;
}

.error-text {
  color: #B00020;
  font-size: 14px;
  margin-top: 4px;
}

</style>