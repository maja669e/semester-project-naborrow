<script>
// Trin 3 i låneanmodnings-flowet — vis opsummering, accepter vilkår og send anmodning.
import Stepper           from "@/components/Stepper.vue";
import RentalSummaryCard from "@/components/rentals/RentalSummaryCard.vue";
import TermsDialog       from "@/components/feedback/TermsDialog.vue";
import FormBottomBar     from "@/components/layout/FormBottomBar.vue";
import SuccessDialog     from "@/components/SuccessDialog.vue";
import { createRentalRequest } from "@/services/rentalrequest/rentalrequestservice.js";


export default {
  name: "RentalConfirmPage",

  components: {
    Stepper,
    RentalSummaryCard,
    TermsDialog,
    FormBottomBar,
    SuccessDialog,
  },

  inject: ["authStore"],
 

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
      showSuccessDialog: false,
    };
  },

  methods: {
    // Validerer vilkårsaccept, bygger request-objektet og sender det til backend.
    // Arrays serialiseres som JSON-tekst da databasen ikke gemmer arrays direkte.
    async confirmRental() {
      if (!this.acceptedTerms) {
        this.error = "Du skal acceptere vilkår og betingelser";
        return;
      }

      this.error = "";

      try {
        const rentalData = {
          ItemID:              this.item.id,
          RenterUserID:        this.authStore.user.value.userID,
          StartDate:           this.rental.startDate,
          EndDate:             this.rental.endDate,
          Status:              "pending",
          MessageToLender:     this.rental.messageToLender || null,
          SelectedAccessories: JSON.stringify(this.rental.accessories ?? []),
          PickupTimes:         JSON.stringify(this.rental.pickupTime ?? []),
        };

        await createRentalRequest(rentalData);
        this.showSuccessDialog = true;
      } catch (err) {
        console.error(err);
        this.error = "Kunne ikke sende låneanmodning";
      }
    },

    // Lukker success-dialogen og sender brugeren tilbage til oversigten
    handleSuccessBack() {
      this.showSuccessDialog = false;
      this.$emit("rental-confirmed");
    },
  },

  emits: ["goBack", "rental-confirmed"],
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
    <p v-if="error" role="alert" class="error-text">
      {{ error }}
    </p>

    <!-- Bundbar — "Bekræft lån" kalder confirmRental der validerer og sender anmodningen -->
    <FormBottomBar
      next-label="Bekræft lån"
      :above-nav="true"
      @back="$emit('goBack')"
      @next="confirmRental"
    />
     <SuccessDialog
  v-model="showSuccessDialog"
  title="Låneanmodning sendt!"
  message="Din låneanmodning er nu sendt til udlåner"
  @back-to-overview="handleSuccessBack"
/>

  </v-container>
 

</template>

<style scoped>

.error-text {
  color: #B00020;
  font-size: 14px;
  margin-top: 4px;
}

.terms-link {
  color: #1B5E20;
  text-decoration: underline;
  cursor: pointer;
}

.page {
  padding-bottom: 180px;
}

</style>