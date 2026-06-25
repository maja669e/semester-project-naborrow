<script>
// Trin 3 i låneanmodnings-flowet — vis opsummering, acceptér vilkår og send anmodning.
// Modtager rentalData og item fra RentalView.
// Arrays serialiseres som JSON-tekst da databasen ikke gemmer arrays direkte.
import MultiStepFormHeader from "@/components/layout/MultiStepFormHeader.vue";
import RentalSummaryCard   from "@/components/rentals/RentalSummaryCard.vue";
import TermsDialog         from "@/components/feedback/TermsDialog.vue";
import FormBottomBar       from "@/components/layout/FormBottomBar.vue";
import SuccessDialog       from "@/components/feedback/SuccessDialog.vue";
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

  inject: ["authStore", "triggerRentalSuccess"],

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
  // Ryd fejlbeskeden så snart brugeren sætter fluebenet, så den ikke
  // bliver hængende efter at vilkårene er accepteret.
  watch: {
    acceptedTerms(accepted) {
      if (accepted) this.error = "";
    },
  },

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

  <div>

    <!-- Formularhoved uden for containeren, så den fylder fuld bredde
         i toppen som headeren på de øvrige sider -->
    <MultiStepFormHeader
      title="Låneanmodning"
      :currentStep="currentStep"
      :steps="['Periode', 'Afhentning', 'Bekræft']"
    />

    <v-container class="pa-4 laanflow-container">
    <h2>Bekræft lån</h2>
    <p>Tjek dine oplysninger før du sender låneanmodningen</p>

    <!-- Opsummeringskort med genstand og lejedetaljer -->
    <section aria-label="Opsummering af låneanmodning">
      <RentalSummaryCard
        :rental="rentalData"
        :item="item"
      />
    </section>

    <!-- Vilkårsaccept. role="group" + aria-describedby binder fejlen til gruppen,
         og fejlen ligger lige under checkboxen så den tydeligt hører til den.
         hide-details fjerner Vuetifys reserverede plads under feltet, der ellers
         skubbede fejlen langt ned. -->
    <section
      role="group"
      aria-labelledby="vilkaar-overskrift"
      :aria-describedby="error ? 'vilkaar-fejl' : undefined"
    >
      <h3 id="vilkaar-overskrift" class="sr-only">Vilkår og betingelser</h3>

      <v-checkbox v-model="acceptedTerms" color="primary" hide-details>
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

      <p v-if="error" id="vilkaar-fejl" role="alert" class="fejltekst">{{ error }}</p>

      <TermsDialog v-model="showTerms" />
    </section>

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
  </div>

</template>

<style scoped>
/* padding-bottom sikrer at indhold ikke skjules bag den faste FormBottomBar og AppBottomNav */
.laanflow-container {
  padding-bottom: calc(180px + env(safe-area-inset-bottom));
}

.vilkaar-link {
  color: var(--color-tilgaengelig-text);
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
