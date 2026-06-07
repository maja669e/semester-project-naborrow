<script>
// Trin 3 i låneanmodnings-flowet — vis opsummering, acceptér vilkår og send anmodning.
// Modtager rentalData og item fra RentalView.
// Arrays serialiseres som JSON-tekst da databasen ikke gemmer arrays direkte.
import MultiStepFormHeader from "@/components/layout/MultiStepFormHeader.vue";
import RentalSummaryCard   from "@/components/rentals/RentalSummaryCard.vue";
import TermsDialog         from "@/components/feedback/TermsDialog.vue";
import FormBottomBar       from "@/components/layout/FormBottomBar.vue";
import SuccessDialog       from "@/components/SuccessDialog.vue";
import { createRentalRequest } from "@/services/rentalrequest/rentalrequestservice.js";

export default {
  name: "RentalConfirmStep",

  components: {
    MultiStepFormHeader,
    RentalSummaryCard,
    TermsDialog,
    FormBottomBar,
    SuccessDialog,
  },

  inject: ["authStore"],

  props: {
    // Det aktuelle trin sendt videre til MultiStepFormHeader
    currentStep: { type: Number, default: 3 },

    // Genstanden der ønskes lånt
    item: { type: Object, default: () => ({}) },

    // Akkumulerede formdata fra trin 1 og 2 (datoer, tilbehør, besked m.m.)
    rentalData: { type: Object, default: () => ({}) },
  },

  data() {
    return {
      acceptedTerms:     false,
      error:             "",
      showTerms:         false,
      showSuccessDialog: false,
    };
  },
inject: ["authStore", "triggerRentalSuccess"],
  methods: {
    // Validerer vilkårsaccept, bygger request-objektet og sender det til backend
async confirmRental() {
  if (!this.acceptedTerms) {
    this.error = "Du skal acceptere vilkår og betingelser";
    return;
  }

  this.error = "";

  try {
    const payload = {
      ItemID: this.item.id,
      RenterUserID: this.authStore.user.value.userID,
      StartDate: this.rentalData.startDate,
      EndDate: this.rentalData.endDate,
      Status: "pending",
      MessageToLender: this.rentalData.messageToLender || null,
      SelectedAccessories: JSON.stringify(this.rentalData.accessories ?? []),
      PickupTimes: JSON.stringify(this.rentalData.pickupTime ?? []),
    };

    await createRentalRequest(payload);

    this.triggerRentalSuccess();

  } catch (err) {
    console.error(err);
    this.error = "Kunne ikke sende låneanmodning";
  }
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

    <h2>Bekræft lån</h2>
    <p>Tjek dine oplysninger før du sender låneanmodningen</p>

    <!-- Opsummeringskort med genstand og lejedetaljer -->
    <section aria-label="Opsummering af låneanmodning">
      <RentalSummaryCard
        :rental="rentalData"
        :item="item"
      />
    </section>

    <!-- Vilkårsaccept -->
    <section aria-labelledby="vilkaar-overskrift">
      <h3 id="vilkaar-overskrift" class="sr-only">Vilkår og betingelser</h3>

      <v-checkbox v-model="acceptedTerms" color="primary">
        <template #label>
          <span>
            Jeg accepterer
            <a
              href="#"
              class="vilkaar-link"
              @click.prevent="showTerms = true"
            >
              vilkår og betingelser
            </a>
          </span>
        </template>
      </v-checkbox>

      <TermsDialog v-model="showTerms" />
    </section>

    <p v-if="error" role="alert" class="fejltekst">{{ error }}</p>

    <!-- Bundbar — "Bekræft lån" validerer og sender anmodningen -->
    <FormBottomBar
      next-label="Bekræft lån"
      :above-nav="true"
      @back="$emit('go-back')"
      @next="confirmRental"
    />

   <SuccessDialog
  v-model="showSuccessDialog"
  title="Låneanmodning sendt!"
  message="Din låneanmodning er nu sendt til udlåner"
/>

  </v-container>

</template>

<style scoped>
/* padding-bottom sikrer at indhold ikke skjules bag den faste FormBottomBar og AppBottomNav */
.laanflow-container {
  padding-bottom: calc(180px + env(safe-area-inset-bottom));
}

.fejltekst {
  color: #B00020;
  font-size: 14px;
  margin-top: 4px;
}

.vilkaar-link {
  color: #1B5E20;
  text-decoration: underline;
  cursor: pointer;
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
</style>
