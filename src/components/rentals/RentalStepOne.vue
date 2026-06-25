<script>
// Trin 1 i låneanmodnings-flowet — vælg låneperiode og afhentningstidspunkt.
// Modtager item og initialData fra RentalView så formularen gendannes
// korrekt hvis brugeren trykker tilbage fra trin 2.
import MultiStepFormHeader from "@/components/layout/MultiStepFormHeader.vue";
import CalendarPicker      from "@/components/rentals/CalendarPicker.vue";
import PeriodSummary       from "@/components/rentals/PeriodSummary.vue";
import PickupTimeSelector  from "@/components/rentals/PickupTimeSelector.vue";
import FormBottomBar       from "@/components/layout/FormBottomBar.vue";
import ConfirmDialog       from "@/components/feedback/ConfirmDialog.vue";

export default {
  name: "RentalStepOne",

  components: {
    MultiStepFormHeader,
    CalendarPicker,
    PeriodSummary,
    PickupTimeSelector,
    FormBottomBar,
    ConfirmDialog,
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

      // Styrer bekræftelses-dialogen når brugeren vil forlade flowet
      showCancelDialog: false,

      errors: {
        dates:      "",
        pickupTime: "",
      },
    };
  },

  methods: {
    // Validerer at datoer og mindst ét afhentningstidspunkt er valgt,
    // og at perioden ikke overskrider genstandens maksimale låneperiode
    validate() {
      let valid = true;

      // Datoer: skal være valgt, og perioden må ikke overskride maks-låneperioden
      if (!this.startDate || !this.endDate) {
        this.errors.dates = "Vælg start- og slutdato";
        valid = false;
      } else {
        const s = new Date(this.startDate);
        s.setHours(0, 0, 0, 0);
        const e = new Date(this.endDate);
        e.setHours(0, 0, 0, 0);
        const diffDays = Math.ceil((e - s) / (1000 * 60 * 60 * 24)) + 1;

        if (this.item?.maxDays && diffDays > this.item.maxDays) {
          this.errors.dates = `Maks ${this.item.maxDays} dage`;
          valid = false;
        } else {
          this.errors.dates = "";
        }
      }

      // Afhentningstidspunkt: mindst ét skal vælges
      if (this.pickupTime.length === 0) {
        this.errors.pickupTime = "Vælg mindst ét tidspunkt";
        valid = false;
      } else {
        this.errors.pickupTime = "";
      }

      return valid;
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

    // Annuller flowet — vis bekræftelse hvis noget er udfyldt, ellers gå
    // tilbage med det samme (samme mønster som opret-genstand).
    cancel() {
      if (this.hasEnteredData()) {
        this.showCancelDialog = true;
      } else {
        this.confirmCancel();
      }
    },

    // Forlad låne-flowet og gå tilbage til Udforsk. Genstanden ligger stadig
    // i den delte rental-state, så ExploreView genåbner detaljekortet for det
    // item brugeren var inde på (i stedet for $router.back der afhænger af historik).
    confirmCancel() {
      this.$router.push({ name: "community" });
    },

    // True hvis brugeren har valgt dato eller afhentningstidspunkt
    hasEnteredData() {
      return (
        this.startDate !== "" ||
        this.endDate !== "" ||
        this.pickupTime.length > 0
      );
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
    <h2>Vælg låneperiode</h2>

    <!-- Datoperiode. role="group" + aria-describedby knytter fejlen til hele
         dato-gruppen, så en skærmlæser læser fejlen op som gruppens beskrivelse
         (ud over role="alert" der annoncerer den når den vises). -->
    <section
      role="group"
      aria-labelledby="periode-overskrift"
      :aria-describedby="errors.dates ? 'dates-fejl' : undefined"
    >
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

      <p v-if="errors.dates" id="dates-fejl" role="alert" class="fejltekst">
        {{ errors.dates }}
      </p>
    </section>

    <!-- Afhentningstidspunkt. Samme mønster: role="group" + aria-describedby
         binder fejlen til tidspunkt-gruppen. -->
    <section
      role="group"
      aria-labelledby="afhentning-overskrift"
      :aria-describedby="errors.pickupTime ? 'pickup-fejl' : undefined"
      class="mt-8"
    >
      <h3 id="afhentning-overskrift">Vælg afhentningstidspunkt</h3>
      <p>Vælg det tidspunkt der passer dig</p>

      <PickupTimeSelector v-model="pickupTime" />

      <p v-if="errors.pickupTime" id="pickup-fejl" role="alert" class="fejltekst">
        {{ errors.pickupTime }}
      </p>
    </section>

    <!-- Bundbar med tilbage-knap der annullerer flowet (bekræftelse hvis noget
         er udfyldt, ellers tilbage med det samme — samme mønster som opret-genstand).
         Næste-knappen er altid aktiv: klik kører next() → validate(), som viser
         fejlbeskeder ved manglende dato/tidspunkt (error object pattern). -->
    <FormBottomBar
      next-label="Næste"
      :above-nav="true"
      @back="cancel"
      @next="next"
    />

    <ConfirmDialog
      v-model="showCancelDialog"
      title="Annuller låneanmodning?"
      message="Er du sikker på, at du vil annullere? Alle oplysninger du har indtastet vil gå tabt."
      confirm-label="Ja, annuller"
      @confirm="confirmCancel"
    />

    </v-container>
  </div>

</template>

<style scoped>
/* padding-bottom sikrer at indhold (inkl. fejlteksten) ikke skjules bag den
   faste FormBottomBar (løftet 64px op via above-nav) + AppBottomNav.
   Samme værdi som RentalConfirmStep, så de er ens. */
.laanflow-container {
  padding-bottom: calc(180px + env(safe-area-inset-bottom));
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
