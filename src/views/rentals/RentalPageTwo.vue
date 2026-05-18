<script>
import Stepper from "@/components/Stepper.vue";
import PickAccessories from "@/components/rentals/PickAccessories.vue";

export default {
  name: "RentalPageTwo",

  components: {
    Stepper,
    PickAccessories,
    
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
  next() {
      this.$emit("save-rental-details", {
        accessories: this.accessories,
        messageToLender: this.messageToLender,
      });

    console.log({
    accessories: this.accessories,
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