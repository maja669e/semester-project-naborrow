<script>
// Orkestreringsvisning for oprettelse af en ny genstand.
// Styrer hvilket trin der vises og samler data fra begge formtrin
// i itemData, så formularen gendannes korrekt hvis brugeren
// trykker tilbage og retter sine svar.
//
// itemCreated injekteres fra App.vue via provide/inject, så denne
// komponent ikke behøver at $emit op igennem router-view-slottet.
import ItemBasicInfoStep from "@/components/items/ItemBasicInfoStep.vue";
import ItemDetailsStep   from "@/components/items/ItemDetailsStep.vue";
import ConfirmItemScreen from "@/components/items/ConfirmItemScreen.vue";

export default {
  name: "CreateItemView",
  components: { ItemBasicInfoStep, ItemDetailsStep, ConfirmItemScreen },

  // Injekterer callback fra App.vue der håndterer navigation og
  // success-dialog efter vellykket oprettelse.
  inject: ["itemCreated"],

  data() {
    return {
      // Aktivt trin i formularen (1 = grundinfo, 2 = detaljer, 3 = bekræftelse)
      step: 1,

      // Akkumuleret data fra begge formtrin.
      // selectedCategory gemmer btn-toggle-værdien ("Andet" eller kategorinavn)
      // adskilt fra category som er den endelige, løste kategori.
      itemData: {
        name:             "",
        category:         "",   // Løst kategorinavn (inkl. brugerdefineret)
        selectedCategory: "",   // Btn-toggle-værdien – bruges til at gendanne formens valg
        brand:            "",
        images:           [],
        categoryID:       null,
        condition:        "",
        loanPeriod:       "",
        extras:           [],
        hasExtra:         null, // null = ubesvaret, true/false = brugerens valg
      },
    };
  },

  methods: {
    // Modtager data fra trin 1, gemmer det og går til trin 2
    handleStepOne(data) {
      this.itemData.name             = data.name;
      this.itemData.category         = data.category;
      this.itemData.selectedCategory = data.selectedCategory;
      this.itemData.brand            = data.brand;
      this.itemData.images           = data.images;
      this.itemData.categoryID       = data.categoryID;
      this.step = 2;
    },

    // Modtager data fra trin 2 og gemmer det inden bekræftelse
    handleStepTwo(details) {
      this.itemData.condition  = details.condition;
      this.itemData.loanPeriod = details.maxLoanPeriod;
      this.itemData.extras     = details.extras;
      this.itemData.hasExtra   = details.hasAccessories;
    },
  },
};
</script>

<template>

  <!-- Trin 1: Grundlæggende information (billeder, kategori, navn) -->
  <ItemBasicInfoStep
    v-if="step === 1"
    :currentStep="1"
    :initialData="itemData"
    @go-to-add-details="handleStepOne"
  />

  <!-- Trin 2: Detaljer (stand, låneperiode, tilbehør) -->
  <ItemDetailsStep
    v-if="step === 2"
    :currentStep="2"
    :initialData="itemData"
    @save-details="handleStepTwo"
    @go-to-confirm-item="step = 3"
    @go-to-page-one="step = 1"
  />

  <!-- Trin 3: Forhåndsvisning og bekræftelse inden oprettelse.
       item-created håndteres af den injekterede itemCreated-metode
       fra App.vue i stedet for at boble op via $emit. -->
  <ConfirmItemScreen
    v-if="step === 3 && itemData"
    :currentStep="3"
    :item="itemData"
    @goBack="step = 2"
    @item-created="itemCreated($event)"
  />


</template>
