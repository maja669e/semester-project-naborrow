<script>
import Stepper from "@/components/Stepper.vue";
import RentalSummaryCard from "@/components/rentals/RentalSummaryCard.vue";
import TermsDialog from "@/components/feedback/TermsDialog.vue";
import { createRentalRequest } from "@/services/rentalrequest/rentalrequestservice.js";


export default {
  name: "RentalConfirmPage",

  components: {
    Stepper,
    RentalSummaryCard,
    TermsDialog,
  },
 

  props: {
    currentStep: Number,

    rental: {
      type: Object,
      required: true,
    },

     item: {
    type: Object,
    required: true
  }
  },

  data() {
    return {
      acceptedTerms: false,
      error: "",
      showTerms: false,
    };
  },

  methods: {
    async confirmRental() {
    console.log("ITEM:", this.item);

    if (!this.acceptedTerms) {
      this.error = "Du skal acceptere vilkår og betingelser";
      return;
    }

    this.error = "";

    try {

      const rentalData = {
       ItemID: this.item.id,
        RenterUserID: 2,

      StartDate: this.rental.startDate,
     EndDate: this.rental.endDate,

     Status: "pending",
      };

      await createRentalRequest(rentalData);

      this.$emit("rentalConfirmed");

    } catch (err) {
      console.error(err);

      this.error =
        "Kunne ikke sende låneanmodning";
    }
  },

   
/*   confirmRental() {
    if (!this.acceptedTerms) {
        console.log("CONFIRM CLICKED"); // <-- add this first
      this.error = "Du skal acceptere vilkår og betingelser";
      return;
    }

    this.error = "";

    console.log("Rental confirmed:", this.rental);

    // instead of alert:
    this.$emit("rental-confirmed");
  }, */

  },

  emits: ["goBack", "rentalConfirmed"],
};
</script>

<template>

  <v-container class="pa-4 page">

    <!-- Stepper -->
    <Stepper
      :currentStep="currentStep"
      :steps="['Periode', 'Afhentning', 'Bekræft']"
    />
  

    <h2>Bekræft lån</h2>

    <p>
      Tjek dine oplysninger før du sender låneanmodningen
    </p>

    <!-- Summary card -->
    <RentalSummaryCard
      :rental="rental"
       :item="item"
    />

    <!-- Terms -->
  <v-checkbox v-model="acceptedTerms" color="primary">
  <template #label>
    <span>
      Jeg accepterer
      <a
        href="#"
        class="terms-link"
        @click.prevent="showTerms = true"
      >
        vilkår og betingelser
      </a>
    </span>
  </template>
</v-checkbox>

<TermsDialog v-model="showTerms" />


    <!-- Error -->
    <div
      v-if="error"
      class="error-text"
    >
      {{ error }}
    </div>

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
        @click="confirmRental"
      >
        Bekræft lån
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
.page {
  padding-bottom: 120px; /* space for bottom button */
}
.terms-link {
  color: #1B5E20;
  text-decoration: underline;
  cursor: pointer;
}

</style>